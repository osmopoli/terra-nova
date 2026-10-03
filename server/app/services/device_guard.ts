import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import LoginDevice from '#models/login_device'
import Notification from '#models/notification'
import { DEVICE_LIMITS, PASSWORD_CHANGE_PATH } from '#constants/domain'

type Device = { fingerprint: string; browser: string; os: string; ipHint: string }

/** Navigateur reconnu depuis le user-agent (Edge/Opera avant Chrome, Chrome avant Safari). */
export function parseBrowser(ua: string) {
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox'
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Navigateur inconnu'
}

export function parseOs(ua: string) {
  if (/Windows/.test(ua)) return 'Windows'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS'
  if (/Linux|X11/.test(ua)) return 'Linux'
  return 'Système inconnu'
}

/** IPv4 tronquée au /24, IPv6 au /48 ; toute valeur non valide donne « inconnu ». */
export function truncateIp(ip: string) {
  const v4 = ip.replace(/^::ffff:/, '')
  if (isIP(v4) === 4) return `${v4.split('.').slice(0, 3).join('.')}.0/24`
  if (isIP(ip) === 6) return `${ip.split(':').slice(0, 3).join(':')}::/48`
  return 'inconnu'
}

export function describeDevice(userAgent: string | undefined, ip: string): Device {
  const ua = (userAgent ?? '').slice(0, 400)
  const ipHint = truncateIp(ip)
  const browser = parseBrowser(ua)
  const os = parseOs(ua)
  // Navigateur + système + réseau (pas l'UA brut) : une mise à jour mineure ne déclenche pas d'alerte.
  const fingerprint = createHmac('sha256', env.get('APP_KEY'))
    .update(`${browser}|${os}|${ipHint}`)
    .digest('hex')
  return { fingerprint, browser, os, ipHint }
}

/** Enregistre l'appareil d'une connexion sans jamais la bloquer (une alerte n'est pas critique). */
export async function noteDevice(userId: number, request: HttpContext['request'], notify = true) {
  try {
    await recordDevice(userId, request.header('user-agent'), request.ip(), notify)
  } catch (error) {
    logger.error({ err: error }, "Enregistrement de l'appareil impossible")
  }
}

/**
 * Enregistre l'appareil de la connexion ; retourne true s'il est nouveau pour ce compte.
 * `notify: false` (inscription) mémorise l'appareil sans alerter.
 */
export async function recordDevice(
  userId: number,
  userAgent: string | undefined,
  ip: string,
  notify = true
) {
  const device = describeDevice(userAgent, ip)
  const now = DateTime.now()
  const known = await LoginDevice.query()
    .where('user_id', userId)
    .where('fingerprint', device.fingerprint)
    .first()

  if (known) {
    known.lastSeenAt = now
    await known.save()
    return false
  }

  // Plafond par compte : on oublie les appareils les moins récemment vus.
  const stale = await LoginDevice.query()
    .where('user_id', userId)
    .orderBy('last_seen_at', 'desc')
    .offset(DEVICE_LIMITS.maxPerAccount - 1)
  if (stale.length > 0) {
    await LoginDevice.query()
      .whereIn(
        'id',
        stale.map((d) => d.id)
      )
      .delete()
  }

  await LoginDevice.create({ userId, ...device, firstSeenAt: now, lastSeenAt: now })

  if (notify) {
    const recent = await Notification.query()
      .where('user_id', userId)
      .where('kind', 'securite')
      .where('created_at', '>', now.minus({ hours: 1 }).toSQL({ includeOffset: false })!)
      .count('* as total')
      .pojo<{ total: number | string }>()
    if (Number(recent[0].total) < DEVICE_LIMITS.maxAlertsPerHour) {
      await Notification.create({
        userId,
        kind: 'securite',
        title: 'Nouvelle connexion à votre compte',
        message: `Connexion depuis ${device.browser} sur ${device.os} (réseau ${device.ipHint}). Ce n'est pas vous ? Changez votre mot de passe.`,
        actionPath: PASSWORD_CHANGE_PATH,
      })
    }
  }
  return true
}
