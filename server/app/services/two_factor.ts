import encryption from '@adonisjs/core/services/encryption'
import TwoFactorSetting from '#models/two_factor_setting'
import { TWO_FACTOR } from '#constants/domain'
import { issueChallenge } from '#services/auth_challenges'
import { matchingStep, normalizeRecoveryCode, sha256Hex } from '#services/totp'

export const LOGIN_CHALLENGE = 'connexion_deux_etapes'

export const encryptSecret = (secret: string) => encryption.encrypt(secret)
export const decryptSecret = (setting: TwoFactorSetting) =>
  encryption.decrypt<string>(setting.secret) ?? ''

/** Réglage actif du compte, ou null si la vérification en deux étapes n'est pas activée. */
export function activeSetting(userId: number) {
  return TwoFactorSetting.query().where('user_id', userId).whereNotNull('enabled_at').first()
}

/**
 * Enregistre le pas TOTP s'il est plus récent que le dernier accepté. Mise à jour
 * conditionnelle : deux requêtes simultanées avec le même code ne passent pas toutes les deux.
 */
export async function claimStep(setting: TwoFactorSetting, step: number) {
  const result: unknown = await TwoFactorSetting.query()
    .where('id', setting.id)
    .where('last_step', '<', step)
    .update({ last_step: step })
  const affected = Array.isArray(result) ? Number(result[0]) : Number(result)
  if (affected === 1) setting.lastStep = step
  return affected === 1
}

/** Vérifie un code de l'application ou un code de secours (consommé). */
export async function verifySecondFactor(
  setting: TwoFactorSetting,
  input: string
): Promise<'totp' | 'secours' | null> {
  const code = input.replace(/[\s-]/g, '')
  const step = matchingStep(decryptSecret(setting), code, setting.lastStep)
  if (step !== null) return (await claimStep(setting, step)) ? 'totp' : null

  const recovery = normalizeRecoveryCode(input)
  if (!recovery) return null
  const digest = sha256Hex(recovery)
  if (!setting.recoveryCodes.includes(digest)) return null
  setting.recoveryCodes = setting.recoveryCodes.filter((value) => value !== digest)
  await setting.save()
  return 'secours'
}

/** Après un bon mot de passe : jeton intermédiaire pour l'étape « code », jamais le jeton d'accès. */
export async function startLoginChallenge(userId: number) {
  const ttl = TWO_FACTOR.challengeMinutes * 60_000
  const { token } = await issueChallenge(LOGIN_CHALLENGE, userId, ttl)
  return { twoFactorRequired: true, challengeToken: token, expiresInSeconds: ttl / 1000 }
}
