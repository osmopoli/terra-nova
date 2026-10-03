import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Passkey from '#models/passkey'
import { confirmPassword } from '#services/password_confirmation'
import { recordAttempt } from '#services/login_guard'
import { issueChallenge, takeChallenge } from '#services/auth_challenges'
import { issueAccessToken } from '#services/session'
import { noteDevice } from '#services/device_guard'
import {
  ALGORITHMS,
  CHALLENGE_CREATE,
  CHALLENGE_GET,
  CHALLENGE_TTL_MS,
  RP_NAME,
  WebAuthnError,
  attestedCredentialId,
  challengeOf,
  checkAuthenticatorData,
  checkClientData,
  checkPublicKey,
  rpIdOf,
  signatureValid,
} from '#services/webauthn'
import {
  passkeyLoginValidator,
  passkeyRegistrationValidator,
  passwordConfirmationValidator,
} from '#validators/security'

const EXPIRED = 'La demande a expiré : recommencez.'
const MAX_PASSKEYS = 10

/** Nom lisible par défaut : navigateur et système de l'appareil d'enregistrement. */
function deviceLabel(userAgent = '') {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Firefox\//.test(userAgent)
      ? 'Firefox'
      : /Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Navigateur'
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /Android/.test(userAgent)
      ? 'Android'
      : /iPhone|iPad/.test(userAgent)
        ? 'iPhone / iPad'
        : /Mac OS X/.test(userAgent)
          ? 'Mac'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'appareil inconnu'
  return `${browser} sur ${os}`
}

export default class PasskeysController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const passkeys = await Passkey.query().where('user_id', user.id).orderBy('created_at', 'asc')
    return { passkeys }
  }

  /** Options de création : mot de passe redemandé, défi à usage unique de 2 minutes. */
  async registrationOptions(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const { password } = await ctx.request.validateUsing(passwordConfirmationValidator)
    const confirmed = await confirmPassword(
      ctx,
      user,
      password,
      'Mot de passe incorrect : aucune clé d’accès n’a été ajoutée.'
    )
    if (!confirmed) return

    const existing = await Passkey.query().where('user_id', user.id).select('credential_id')
    if (existing.length >= MAX_PASSKEYS) {
      return ctx.response.conflict({
        error: `Vous avez déjà ${MAX_PASSKEYS} clés d’accès : retirez-en une avant d’en ajouter.`,
      })
    }
    const { token } = await issueChallenge(CHALLENGE_CREATE, user.id, CHALLENGE_TTL_MS)
    return {
      challenge: token,
      rp: { name: RP_NAME, id: rpIdOf(ctx.request) },
      user: {
        id: Buffer.from(`terra-nova:${user.id}`).toString('base64url'),
        name: user.email,
        displayName: user.fullName ?? user.email,
      },
      pubKeyCredParams: ALGORITHMS.map((alg) => ({ type: 'public-key', alg })),
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
      excludeCredentials: existing.map((p) => ({ type: 'public-key', id: p.credentialId })),
      attestation: 'none',
      timeout: CHALLENGE_TTL_MS,
    }
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(passkeyRegistrationValidator)
    const announced = challengeOf(payload.clientDataJSON)
    const challenge = await takeChallenge(CHALLENGE_CREATE, announced)
    if (!challenge || !announced || challenge.userId !== user.id) {
      return response.gone({ error: EXPIRED })
    }

    try {
      checkClientData(payload.clientDataJSON, 'webauthn.create', announced, request)
      const { raw, flags, signCount } = checkAuthenticatorData(payload.authenticatorData, request)
      if (attestedCredentialId(raw, flags) !== payload.id) {
        throw new WebAuthnError('Identifiant de clé incohérent.')
      }
      checkPublicKey(payload.publicKey, payload.publicKeyAlgorithm)
      if (await Passkey.findBy('credentialId', payload.id)) {
        return response.conflict({ error: 'Cette clé d’accès est déjà enregistrée.' })
      }
      const passkey = await Passkey.create({
        userId: user.id,
        credentialId: payload.id,
        publicKey: payload.publicKey,
        algorithm: payload.publicKeyAlgorithm,
        signCount,
        name: payload.name || deviceLabel(request.header('user-agent')),
      })
      return response.created(passkey)
    } catch (error) {
      if (error instanceof WebAuthnError) return response.badRequest({ error: error.message })
      throw error
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const passkey = await Passkey.query()
      .where('id', Number(params.id))
      .where('user_id', user.id)
      .first()
    if (!passkey) return response.notFound({ error: 'Clé d’accès introuvable.' })
    await passkey.delete()
    return response.noContent()
  }

  /** Connexion : clé découvrable, aucun e-mail à saisir. */
  async loginOptions({ request }: HttpContext) {
    const { token } = await issueChallenge(CHALLENGE_GET, null, CHALLENGE_TTL_MS)
    return {
      challenge: token,
      rpId: rpIdOf(request),
      userVerification: 'required',
      timeout: CHALLENGE_TTL_MS,
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(passkeyLoginValidator)
    const announced = challengeOf(payload.clientDataJSON)
    // Défi consommé dès sa première présentation, même si la suite échoue : pas de rejeu.
    const challenge = await takeChallenge(CHALLENGE_GET, announced)
    if (!challenge || !announced) return response.gone({ error: EXPIRED })

    try {
      checkClientData(payload.clientDataJSON, 'webauthn.get', announced, request)
      const passkey = await Passkey.findBy('credentialId', payload.id)
      if (!passkey) {
        throw new WebAuthnError(
          'Cette clé d’accès n’est liée à aucun compte. Connectez-vous avec votre mot de passe, puis ajoutez-la depuis votre profil.'
        )
      }
      const { raw, signCount } = checkAuthenticatorData(payload.authenticatorData, request)
      if (!signatureValid(passkey.publicKey, raw, payload.clientDataJSON, payload.signature)) {
        throw new WebAuthnError('La clé d’accès n’a pas pu être vérifiée.')
      }
      // Compteur de signatures : s'il n'avance plus, la clé a peut-être été copiée.
      if ((passkey.signCount > 0 || signCount > 0) && signCount <= passkey.signCount) {
        throw new WebAuthnError(
          'Cette clé d’accès a été refusée par sécurité. Retirez-la de votre profil et ajoutez-en une nouvelle.'
        )
      }
      const user = await User.findOrFail(passkey.userId)
      passkey.signCount = signCount
      passkey.lastUsedAt = DateTime.now()
      await passkey.save()
      await recordAttempt(user.email, request.ip(), 'succes')
      await noteDevice(user.id, request)
      return { user, token: await issueAccessToken(user), method: 'cle' }
    } catch (error) {
      if (error instanceof WebAuthnError) return response.badRequest({ error: error.message })
      throw error
    }
  }
}
