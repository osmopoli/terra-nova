import { createHash, createPublicKey, timingSafeEqual, verify } from 'node:crypto'
import type { Request } from '@adonisjs/core/http'

/**
 * Vérification WebAuthn sans CBOR (D02). Le navigateur fournit la clé publique au format
 * SPKI (`response.getPublicKey()`) ; on contrôle clientDataJSON, authenticatorData et la
 * signature `authData || sha256(clientDataJSON)` avec node:crypto.
 */

export const RP_NAME = 'Terra Nova'
/** ES256 (ECDSA P-256) et RS256 (RSASSA-PKCS1-v1_5 SHA-256). */
export const ALGORITHMS = [-7, -257] as const
export const CHALLENGE_TTL_MS = 2 * 60_000
export const CHALLENGE_CREATE = 'cle_creation'
export const CHALLENGE_GET = 'cle_connexion'

const FLAG_UP = 0x01
const FLAG_UV = 0x04
const FLAG_AT = 0x40

export class WebAuthnError extends Error {}

const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest()
const fromB64u = (value: string) => Buffer.from(value, 'base64url')
const sameBytes = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b)

/** Le rpId est le nom d'hôte de la requête (localhost en local, le domaine en production). */
export const rpIdOf = (request: Request) => request.hostname() ?? 'localhost'

/**
 * Origine acceptée : même hôte (et port) que la requête, en HTTPS ; HTTP toléré pour
 * localhost seulement (contexte sécurisé du navigateur). Robuste derrière un proxy TLS.
 */
function originAllowed(origin: unknown, request: Request) {
  if (typeof origin !== 'string') return false
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  if (url.host !== request.host()) return false
  return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost')
}

/** Lit le défi annoncé par clientDataJSON (pour retrouver le défi stocké côté serveur). */
export function challengeOf(clientDataJSON: string) {
  try {
    const data = JSON.parse(fromB64u(clientDataJSON).toString('utf8'))
    return typeof data.challenge === 'string' ? data.challenge : null
  } catch {
    return null
  }
}

export function checkClientData(
  clientDataJSON: string,
  type: 'webauthn.create' | 'webauthn.get',
  expectedChallenge: string,
  request: Request
) {
  let data: { type?: unknown; challenge?: unknown; origin?: unknown }
  try {
    data = JSON.parse(fromB64u(clientDataJSON).toString('utf8'))
  } catch {
    throw new WebAuthnError('Réponse de la clé illisible.')
  }
  if (data.type !== type) throw new WebAuthnError('Réponse de la clé inattendue.')
  if (data.challenge !== expectedChallenge) {
    throw new WebAuthnError('Ce défi ne correspond pas : recommencez.')
  }
  if (!originAllowed(data.origin, request)) {
    throw new WebAuthnError('Origine de la demande non reconnue.')
  }
}

/** Contrôle rpIdHash et drapeaux UP + UV ; renvoie les octets bruts et le compteur. */
export function checkAuthenticatorData(authenticatorData: string, request: Request) {
  const raw = fromB64u(authenticatorData)
  if (raw.length < 37) throw new WebAuthnError('Données de la clé incomplètes.')
  if (!sameBytes(raw.subarray(0, 32), sha256(rpIdOf(request)))) {
    throw new WebAuthnError('Cette clé appartient à un autre site.')
  }
  const flags = raw[32]
  if (!(flags & FLAG_UP)) throw new WebAuthnError('Présence de l’utilisateur non confirmée.')
  if (!(flags & FLAG_UV)) {
    throw new WebAuthnError(
      'Le déverrouillage de l’appareil (code, empreinte ou visage) est requis.'
    )
  }
  return { raw, flags, signCount: raw.readUInt32BE(33) }
}

/** À l'enregistrement : l'identifiant annoncé doit être celui des données attestées. */
export function attestedCredentialId(raw: Buffer, flags: number) {
  if (!(flags & FLAG_AT) || raw.length < 55) {
    throw new WebAuthnError('Données de la clé incomplètes.')
  }
  const length = raw.readUInt16BE(53)
  if (raw.length < 55 + length) throw new WebAuthnError('Données de la clé incomplètes.')
  return raw.subarray(55, 55 + length).toString('base64url')
}

/** Clé publique SPKI conforme à l'algorithme annoncé (P-256 pour ES256, RSA ≥ 2048 pour RS256). */
export function checkPublicKey(spki: string, algorithm: number) {
  let key
  try {
    key = createPublicKey({ key: fromB64u(spki), format: 'der', type: 'spki' })
  } catch {
    throw new WebAuthnError('Clé publique invalide.')
  }
  const details = key.asymmetricKeyDetails ?? {}
  const ok =
    (algorithm === -7 && key.asymmetricKeyType === 'ec' && details.namedCurve === 'prime256v1') ||
    (algorithm === -257 && key.asymmetricKeyType === 'rsa' && (details.modulusLength ?? 0) >= 2048)
  if (!ok) throw new WebAuthnError('Type de clé non pris en charge.')
}

export function signatureValid(
  spki: string,
  authData: Buffer,
  clientDataJSON: string,
  signature: string
) {
  try {
    const signed = Buffer.concat([authData, sha256(fromB64u(clientDataJSON))])
    const key = { key: fromB64u(spki), format: 'der' as const, type: 'spki' as const }
    return verify('sha256', signed, key, fromB64u(signature))
  } catch {
    return false
  }
}
