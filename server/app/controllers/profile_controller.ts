import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { DEFAULT_ROLE } from '#constants/domain'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'
import { deleteAccountValidator, updateProfileValidator } from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  /** Nom et quartier modifiables ici (pas d'e-mail ni de mot de passe). */
  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)
    await user.merge(payload).save()

    return user
  }

  /** Marque le guide de première connexion comme vu (idempotent : garde la première date). */
  async completeOnboarding({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.onboardedAt) {
      user.onboardedAt = DateTime.now()
      await user.save()
    }
    return user
  }

  /**
   * Suppression du compte de l'utilisateur authentifié (jamais d'id dans l'URL).
   * Mot de passe redemandé ; jetons et messages liés partent en cascade (FK).
   * Réservé aux citoyens : on ne supprime pas un admin ou un agent par erreur.
   */
  async destroy({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== DEFAULT_ROLE) {
      return response.forbidden({
        error: 'Accès refusé : seul un compte citoyen peut être supprimé ici.',
      })
    }

    const { password } = await request.validateUsing(deleteAccountValidator)

    // Même limiteur que la connexion : on ne peut pas deviner le mot de passe via cette route.
    const ip = request.ip()
    const lock = await checkLock(user.email, ip)
    if (lock) {
      await recordAttempt(user.email, ip, 'bloque', lock.scope)
      const retryAfter = Math.ceil((lock.until - Date.now()) / 1000)
      response.header('Retry-After', String(retryAfter))
      return response.tooManyRequests({
        error: lockMessage(lock.until),
        retryAfterSeconds: retryAfter,
      })
    }

    if (!(await hash.verify(user.password, password))) {
      await recordAttempt(user.email, ip, 'echec')
      return response.unprocessableEntity({
        errors: [
          {
            field: 'password',
            message: 'Mot de passe incorrect : le compte n’a pas été supprimé.',
          },
        ],
      })
    }

    await user.delete()
    return response.noContent()
  }
}
