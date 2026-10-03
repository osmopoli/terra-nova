import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import LoginDevice from '#models/login_device'
import { DEFAULT_ROLE, RECENT_DEVICES_LIMIT } from '#constants/domain'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'
import {
  changePasswordValidator,
  deleteAccountValidator,
  updateProfileValidator,
} from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  /** Seul le nom est modifiable ici (pas d'e-mail ni de mot de passe). */
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

  /** Appareils récents du compte (WEBC-80), le plus récent d'abord. */
  async devices({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const devices = await LoginDevice.query()
      .where('user_id', user.id)
      .orderBy('last_seen_at', 'desc')
      .limit(RECENT_DEVICES_LIMIT)
    return { devices }
  }

  /** Changement de mot de passe : exige l'ancien (même verrou que la connexion), révoque les autres sessions. */
  async changePassword({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, password } = await request.validateUsing(changePasswordValidator)

    const key = `mdp:${user.email}`
    const ip = request.ip()
    const lock = await checkLock(key, ip)
    if (lock) {
      response.header('Retry-After', String(Math.ceil((lock.until - Date.now()) / 1000)))
      return response.tooManyRequests({ error: lockMessage(lock.until) })
    }
    if (!(await hash.verify(user.password, currentPassword))) {
      await recordAttempt(key, ip, 'echec')
      return response.unprocessableEntity({
        errors: [{ field: 'currentPassword', message: 'Mot de passe actuel incorrect.' }],
      })
    }

    await recordAttempt(key, ip, 'succes')
    user.password = password
    await user.save()
    const tokens = await User.accessTokens.all(user)
    await Promise.all(
      tokens
        .filter((token) => token.identifier !== user.currentAccessToken.identifier)
        .map((token) => User.accessTokens.delete(user, token.identifier))
    )
    return response.noContent()
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
