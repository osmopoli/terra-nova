import { randomBytes } from 'node:crypto'
import AuthChallenge from '#models/auth_challenge'
import { sha256Hex } from '#services/totp'

/**
 * Jetons intermédiaires côté serveur : courts, à usage unique, seule leur empreinte est stockée.
 * `purpose` empêche d'utiliser un jeton pour autre chose que ce pour quoi il a été émis.
 */

export async function issueChallenge(purpose: string, userId: number | null, ttlMs: number) {
  const now = Date.now()
  // Ménage opportuniste : les jetons expirés ne servent plus à rien.
  await AuthChallenge.query().where('expires_at', '<', now).delete()
  const token = randomBytes(32).toString('base64url')
  const challenge = await AuthChallenge.create({
    purpose,
    tokenHash: sha256Hex(token),
    userId,
    attempts: 0,
    expiresAt: now + ttlMs,
  })
  return { token, challenge }
}

/** Jeton valide (bon usage, non expiré) sans le consommer, ou null. */
export async function findChallenge(purpose: string, token: unknown) {
  if (typeof token !== 'string' || !token || token.length > 200) return null
  const challenge = await AuthChallenge.query()
    .where('token_hash', sha256Hex(token))
    .where('purpose', purpose)
    .first()
  if (!challenge) return null
  if (challenge.expiresAt < Date.now()) {
    await challenge.delete()
    return null
  }
  return challenge
}

/** Supprime le jeton ; true seulement pour la requête qui l'a réellement supprimé (usage unique). */
export async function consumeChallenge(challenge: AuthChallenge) {
  const result: unknown = await AuthChallenge.query().where('id', challenge.id).delete()
  const affected = Array.isArray(result) ? Number(result[0]) : Number(result)
  return affected === 1
}

/** Retrouve et consomme en une fois (défis WebAuthn : jamais réutilisables, même après échec). */
export async function takeChallenge(purpose: string, token: unknown) {
  const challenge = await findChallenge(purpose, token)
  if (!challenge || !(await consumeChallenge(challenge))) return null
  return challenge
}
