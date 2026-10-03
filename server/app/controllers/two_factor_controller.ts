import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import TwoFactorSetting from '#models/two_factor_setting'
import { TWO_FACTOR } from '#constants/domain'
import { confirmPassword } from '#services/password_confirmation'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'
import { consumeChallenge, findChallenge } from '#services/auth_challenges'
import { issueAccessToken } from '#services/session'
import { noteDevice } from '#services/device_guard'
import {
  formatRecoveryCode,
  matchingStep,
  newRecoveryCodes,
  newSecret,
  otpauthUrl,
  sha256Hex,
} from '#services/totp'
import {
  LOGIN_CHALLENGE,
  activeSetting,
  claimStep,
  decryptSecret,
  encryptSecret,
  verifySecondFactor,
} from '#services/two_factor'
import {
  passwordConfirmationValidator,
  totpConfirmValidator,
  twoFactorLoginValidator,
} from '#validators/security'

const EXPIRED = 'Cette étape a expiré. Reprenez la connexion depuis le début.'

export default class TwoFactorController {
  /** État pour la page profil. */
  async show({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const setting = await activeSetting(user.id)
    return {
      enabled: Boolean(setting),
      enabledAt: setting?.enabledAt?.toISO() ?? null,
      recoveryCodesLeft: setting?.recoveryCodes.length ?? 0,
    }
  }

  /** Étape 1 : nouveau secret, inactif tant que le premier code n'est pas confirmé. */
  async setup(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const { password } = await ctx.request.validateUsing(passwordConfirmationValidator)
    if (await activeSetting(user.id)) {
      return ctx.response.conflict({ error: 'La vérification en deux étapes est déjà active.' })
    }
    const confirmed = await confirmPassword(
      ctx,
      user,
      password,
      'Mot de passe incorrect : la vérification en deux étapes n’a pas été préparée.'
    )
    if (!confirmed) return

    const secret = newSecret()
    await TwoFactorSetting.updateOrCreate(
      { userId: user.id },
      { secret: encryptSecret(secret), enabledAt: null, lastStep: 0, recoveryCodes: [] }
    )
    return {
      secret: secret.match(/.{1,4}/g)!.join(' '),
      otpauthUrl: otpauthUrl(secret, user.email),
      issuer: TWO_FACTOR.issuer,
      account: user.email,
    }
  }

  /** Étape 2 : le premier code prouve que l'application est réglée ; codes de secours remis une fois. */
  async confirm({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { code } = await request.validateUsing(totpConfirmValidator)
    const setting = await TwoFactorSetting.findBy('userId', user.id)
    if (!setting || setting.enabledAt) {
      return response.conflict({
        error: setting
          ? 'La vérification en deux étapes est déjà active.'
          : 'Commencez par afficher la clé secrète depuis votre profil.',
      })
    }
    const step = matchingStep(decryptSecret(setting), code.replace(/\s/g, ''), setting.lastStep)
    if (step === null || !(await claimStep(setting, step))) {
      return response.unprocessableEntity({
        errors: [
          {
            field: 'code',
            message:
              'Ce code ne correspond pas. Saisissez les 6 chiffres affichés en ce moment dans l’application.',
          },
        ],
      })
    }

    const codes = newRecoveryCodes()
    setting.recoveryCodes = codes.map(sha256Hex)
    setting.enabledAt = DateTime.now()
    await setting.save()
    return {
      enabled: true,
      enabledAt: setting.enabledAt.toISO(),
      recoveryCodes: codes.map(formatRecoveryCode),
    }
  }

  /** Désactivation : mot de passe redemandé. */
  async destroy(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const { password } = await ctx.request.validateUsing(passwordConfirmationValidator)
    const setting = await TwoFactorSetting.findBy('userId', user.id)
    if (!setting?.enabledAt) {
      return ctx.response.conflict({ error: 'La vérification en deux étapes n’est pas active.' })
    }
    const confirmed = await confirmPassword(
      ctx,
      user,
      password,
      'Mot de passe incorrect : la vérification en deux étapes reste active.'
    )
    if (!confirmed) return

    await setting.delete()
    return ctx.response.noContent()
  }

  /** Connexion, deuxième étape : jeton intermédiaire + code ; émet enfin le jeton d'accès. */
  async login({ request, response }: HttpContext) {
    const { challengeToken, code } = await request.validateUsing(twoFactorLoginValidator)
    const challenge = await findChallenge(LOGIN_CHALLENGE, challengeToken)
    const user = challenge?.userId ? await User.find(challenge.userId) : null
    const setting = user ? await activeSetting(user.id) : null
    if (!challenge || !user || !setting) {
      if (challenge) await consumeChallenge(challenge)
      return response.gone({ error: EXPIRED })
    }

    const ip = request.ip()
    const lock = await checkLock(user.email, ip)
    if (lock) {
      await recordAttempt(user.email, ip, 'bloque', lock.scope)
      await consumeChallenge(challenge)
      const retryAfter = Math.ceil((lock.until - Date.now()) / 1000)
      response.header('Retry-After', String(retryAfter))
      return response.tooManyRequests({
        error: lockMessage(lock.until),
        retryAfterSeconds: retryAfter,
      })
    }

    const method = await verifySecondFactor(setting, code)
    if (!method) {
      await recordAttempt(user.email, ip, 'echec')
      const attempts = challenge.attempts + 1
      if (attempts >= TWO_FACTOR.maxAttempts) {
        await consumeChallenge(challenge)
        return response.gone({
          error: 'Trop de codes incorrects. Reprenez la connexion depuis le début.',
        })
      }
      challenge.attempts = attempts
      await challenge.save()
      const left = TWO_FACTOR.maxAttempts - attempts
      return response.unprocessableEntity({
        errors: [
          {
            field: 'code',
            message: `Code incorrect ou déjà utilisé. Il vous reste ${left} essai${left > 1 ? 's' : ''}.`,
          },
        ],
      })
    }

    // Usage unique : si une autre requête a déjà consommé ce jeton, rien n'est émis.
    if (!(await consumeChallenge(challenge))) return response.gone({ error: EXPIRED })
    await recordAttempt(user.email, ip, 'succes')
    await noteDevice(user.id, request)
    return {
      user,
      token: await issueAccessToken(user),
      method,
      recoveryCodesLeft: method === 'secours' ? setting.recoveryCodes.length : undefined,
    }
  }
}
