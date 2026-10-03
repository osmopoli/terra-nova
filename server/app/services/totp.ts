import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { TWO_FACTOR } from '#constants/domain'

/** TOTP (RFC 6238 sur HOTP RFC 4226) : HMAC-SHA1, 6 chiffres, pas de 30 s. Sans dépendance. */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function toBase32(buffer: Buffer) {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buffer) {
    value = ((value << 8) | byte) & 0xffff
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function fromBase32(input: string) {
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of input.replace(/[\s=-]/g, '').toUpperCase()) {
    const index = ALPHABET.indexOf(char)
    if (index < 0) continue
    value = ((value << 5) | index) & 0xffff
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

/** Secret de 160 bits (taille recommandée par la RFC 4226), en base32. */
export const newSecret = () => toBase32(randomBytes(20))

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / TWO_FACTOR.stepSeconds)

export function codeAt(secret: string, step: number) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac('sha1', fromBase32(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 15
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff
  return String(binary % 10 ** TWO_FACTOR.digits).padStart(TWO_FACTOR.digits, '0')
}

const sameText = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * Pas TOTP correspondant au code (pas courant ± fenêtre), strictement après `lastStep`
 * pour refuser le rejeu ; null si le code ne correspond à aucun pas acceptable.
 */
export function matchingStep(secret: string, code: string, lastStep: number, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null
  const step = currentStep(now)
  for (let delta = -TWO_FACTOR.window; delta <= TWO_FACTOR.window; delta++) {
    const candidate = step + delta
    if (candidate > lastStep && sameText(codeAt(secret, candidate), code)) return candidate
  }
  return null
}

export function otpauthUrl(secret: string, account: string) {
  const label = encodeURIComponent(`${TWO_FACTOR.issuer}:${account}`)
  const params = new URLSearchParams({
    secret,
    issuer: TWO_FACTOR.issuer,
    algorithm: 'SHA1',
    digits: String(TWO_FACTOR.digits),
    period: String(TWO_FACTOR.stepSeconds),
  })
  return `otpauth://totp/${label}?${params.toString().replace(/\+/g, '%20')}`
}

export const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex')

/** Codes de secours : 10 caractères base32, affichés en deux groupes (ABCDE-FGHIJ). */
export function newRecoveryCodes(count: number = TWO_FACTOR.recoveryCodes) {
  return Array.from({ length: count }, () => toBase32(randomBytes(7)).slice(0, 10))
}

export const formatRecoveryCode = (code: string) => `${code.slice(0, 5)}-${code.slice(5)}`

/** Code de secours saisi, normalisé (majuscules, sans tiret ni espace) ou null. */
export function normalizeRecoveryCode(input: string) {
  const raw = input.toUpperCase().replace(/[\s-]/g, '')
  return /^[A-Z2-7]{10}$/.test(raw) ? raw : null
}
