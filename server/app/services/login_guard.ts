import LoginAttempt from '#models/login_attempt'
import { LOGIN_LIMITS, type LoginBlockScope, type LoginOutcome } from '#constants/domain'

const WINDOW_MS = LOGIN_LIMITS.windowMinutes * 60_000

export type LoginLock = { until: number; scope: LoginBlockScope }

export const normalizeEmail = (email: string) => email.trim().toLowerCase().slice(0, 254)

/** Date de déblocage si les `max` derniers échecs (récents d'abord) sont dans la fenêtre, sinon 0. */
function unlockAt(failures: LoginAttempt[], max: number) {
  return failures.length >= max ? failures[max - 1].attemptedAt + WINDOW_MS : 0
}

/** Retourne le verrou en vigueur pour ce compte / cette IP, ou null si la tentative est autorisée. */
export async function checkLock(email: string, ip: string, now = Date.now()) {
  const since = now - WINDOW_MS
  const key = normalizeEmail(email)

  const lastSuccess = await LoginAttempt.query()
    .where('email', key)
    .where('outcome', 'succes')
    .max('attempted_at as last')
    .first()
  const lastSuccessAt = Number(lastSuccess?.$extras.last ?? 0)

  const accountFailures = await LoginAttempt.query()
    .where('email', key)
    .where('outcome', 'echec')
    .where('attempted_at', '>', Math.max(since, lastSuccessAt))
    .orderBy('attempted_at', 'desc')
    .limit(LOGIN_LIMITS.maxFailuresPerAccount)
  const ipFailures = await LoginAttempt.query()
    .where('ip', ip)
    .where('outcome', 'echec')
    .where('attempted_at', '>', since)
    .orderBy('attempted_at', 'desc')
    .limit(LOGIN_LIMITS.maxFailuresPerIp)

  const account = unlockAt(accountFailures, LOGIN_LIMITS.maxFailuresPerAccount)
  const byIp = unlockAt(ipFailures, LOGIN_LIMITS.maxFailuresPerIp)
  const until = Math.max(account, byIp)
  if (until <= now) return null
  return { until, scope: account >= byIp ? 'compte' : 'ip' } satisfies LoginLock
}

export function recordAttempt(
  email: string,
  ip: string,
  outcome: LoginOutcome,
  reason: LoginBlockScope | null = null
) {
  return LoginAttempt.create({
    email: normalizeEmail(email),
    ip: ip || 'inconnue',
    outcome,
    reason,
    attemptedAt: Date.now(),
  })
}

/** « Trop de tentatives… Réessayez dans N minutes (vers HH:MM). » */
export function lockMessage(until: number, now = Date.now()) {
  const minutes = Math.max(1, Math.ceil((until - now) / 60_000))
  const hour = new Date(until).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Indian/Mayotte',
  })
  return `Trop de tentatives de connexion. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''} (vers ${hour}).`
}

/** Compteurs sur 24 h et dernières tentatives, pour l'administrateur. */
export async function loginAttemptsOverview(now = Date.now()) {
  const since = now - 864e5
  const rows = await LoginAttempt.query()
    .where('attempted_at', '>', since)
    .select('outcome')
    .count('* as total')
    .groupBy('outcome')
  const last24h = { succes: 0, echec: 0, bloque: 0 } as Record<LoginOutcome, number>
  for (const row of rows) last24h[row.outcome] = Number(row.$extras.total)

  const recent = await LoginAttempt.query().orderBy('id', 'desc').limit(50)
  return { last24h, recent: recent.map((a) => a.serialize()) }
}
