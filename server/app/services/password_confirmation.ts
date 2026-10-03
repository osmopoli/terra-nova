import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import type User from '#models/user'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'

/**
 * Confirmation du mot de passe avant un changement de sécurité, avec le même limiteur
 * que la connexion (WEBC-60). Renvoie true si le mot de passe est bon ; sinon la réponse
 * HTTP (429 ou 422 sur `password`) est déjà écrite et l'appelant doit s'arrêter.
 */
export async function confirmPassword(
  { request, response }: HttpContext,
  user: User,
  password: string,
  refusal: string
) {
  const ip = request.ip()
  const lock = await checkLock(user.email, ip)
  if (lock) {
    await recordAttempt(user.email, ip, 'bloque', lock.scope)
    const retryAfter = Math.ceil((lock.until - Date.now()) / 1000)
    response.header('Retry-After', String(retryAfter))
    response.tooManyRequests({ error: lockMessage(lock.until), retryAfterSeconds: retryAfter })
    return false
  }
  if (!(await hash.verify(user.password, password))) {
    await recordAttempt(user.email, ip, 'echec')
    response.unprocessableEntity({ errors: [{ field: 'password', message: refusal }] })
    return false
  }
  return true
}
