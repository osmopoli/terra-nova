import type { HttpContext } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import { DEFAULT_ROLE } from '#constants/domain'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'

const TOKEN_TTL = '30 days'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    // Inscription publique : toujours citoyen, le rôle n'est jamais lu depuis le corps.
    const user = await User.create({ ...payload, role: DEFAULT_ROLE })
    const token = await User.accessTokens.create(user, ['*'], { expiresIn: TOKEN_TTL })

    return response.created({ user, token: token.value!.release() })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const ip = request.ip()

    const lock = await checkLock(email, ip)
    if (lock) {
      await recordAttempt(email, ip, 'bloque', lock.scope)
      const retryAfter = Math.ceil((lock.until - Date.now()) / 1000)
      response.header('Retry-After', String(retryAfter))
      return response.tooManyRequests({
        error: lockMessage(lock.until),
        retryAfterSeconds: retryAfter,
      })
    }

    try {
      const user = await User.verifyCredentials(email, password)
      if (user.disabledAt) {
        await recordAttempt(email, ip, 'echec')
        return response.forbidden({
          error: 'Ce compte est désactivé. Contactez la mairie pour le réactiver.',
        })
      }
      await recordAttempt(email, ip, 'succes')
      const token = await User.accessTokens.create(user, ['*'], { expiresIn: TOKEN_TTL })
      return { user, token: token.value!.release() }
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        await recordAttempt(email, ip, 'echec')
        return response.badRequest({ errors: [{ message: 'E-mail ou mot de passe incorrect.' }] })
      }
      throw error
    }
  }

  /** Révoque uniquement le token utilisé pour la requête. */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.noContent()
  }
}
