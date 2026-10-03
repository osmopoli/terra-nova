import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

/**
 * WEBC-2 : synchronisation de l'API Webcup / Nova Terra.
 * La clé reste côté serveur ; dédoublonnage sur request_code ; aucune hypothèse
 * sur le nombre ou le rythme des vagues (le serveur Webcup filtre déjà les demandes futures).
 */
const API_URL = 'https://24h.webcup.fr/wp-json/webcup/v1/requests'
/** Dans la fourchette 15-30 s demandée par le sujet. */
export const POLL_INTERVAL_SECONDS = 20
const STATE_ID = 1

export type WebcupRequest = { request_code: string; [field: string]: unknown }
export type WebcupSession = { minutes_until_next_wave?: number | null; [field: string]: unknown }
export type WebcupPayload = { session?: WebcupSession; requests?: WebcupRequest[] }

type StateRow = {
  session_json: string | null
  last_poll_at: Date | null
  last_error: string | null
}

async function saveState(values: Partial<StateRow>) {
  const exists = await db.from('webcup_state').where('id', STATE_ID).first()
  if (exists) await db.from('webcup_state').where('id', STATE_ID).update(values)
  else await db.table('webcup_state').insert({ id: STATE_ID, ...values })
}

async function readState(): Promise<StateRow | null> {
  return db.from('webcup_state').where('id', STATE_ID).first()
}

/** Enregistre une réponse de l'API. Renvoie les codes vus pour la première fois. */
export async function ingest(payload: WebcupPayload): Promise<string[]> {
  const rows = await db.from('webcup_requests').select('request_code')
  const known = new Set<string>(rows.map((row) => row.request_code))
  const fresh: string[] = []
  for (const request of payload.requests ?? []) {
    const code = request.request_code
    if (typeof code !== 'string' || !code || code.length > 64) continue
    const values = {
      payload: JSON.stringify(request),
      difficulty_level: Number(request.difficulty_level) || null,
      xp_total: Number(request.xp_total) || null,
      wave: Number(request.visible_since_wave ?? request.wave_number) || 0,
    }
    if (known.has(code)) {
      await db.from('webcup_requests').where('request_code', code).update(values)
    } else {
      await db
        .table('webcup_requests')
        .insert({ request_code: code, first_seen_at: new Date(), ...values })
      known.add(code)
      fresh.push(code)
    }
  }
  await saveState({
    session_json: JSON.stringify(payload.session ?? null),
    last_poll_at: new Date(),
    last_error: null,
  })
  if (fresh.length)
    logger.info(`[webcup] ${fresh.length} nouvelle(s) demande(s) : ${fresh.join(', ')}`)
  return fresh
}

async function fetchAndIngest() {
  const key = env.get('WEBCUP_API_KEY')
  if (!key) {
    await saveState({ last_poll_at: new Date(), last_error: 'WEBCUP_API_KEY absente du serveur.' })
    return
  }
  try {
    const response = await fetch(API_URL, {
      headers: { 'X-Webcup-Api-Key': key, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`l'API Webcup a répondu ${response.status}`)
    await ingest((await response.json()) as WebcupPayload)
  } catch (error) {
    logger.error(`[webcup] échec du polling : ${(error as Error).message}`)
    await saveState({ last_poll_at: new Date(), last_error: (error as Error).message })
  }
}

// Un seul polling à la fois (timer + requêtes + rafraîchissement admin).
let inFlight: Promise<void> | null = null
export function pollOnce(): Promise<void> {
  inFlight ??= fetchAndIngest()
    .catch((error) => logger.error(`[webcup] erreur base de données : ${error.message}`))
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

let timer: NodeJS.Timeout | null = null
export function startPolling() {
  if (timer) return
  void pollOnce()
  timer = setInterval(pollOnce, POLL_INTERVAL_SECONDS * 1000)
  timer.unref()
}

export function stopPolling() {
  if (timer) clearInterval(timer)
  timer = null
}

/** Si le timer a pris du retard (serveur endormi par Passenger, redémarrage), on resynchronise avant de répondre. */
async function ensureFresh() {
  if (app.inTest) return
  const state = await readState()
  const last = state?.last_poll_at
  if (!last || Date.now() - new Date(last).getTime() > POLL_INTERVAL_SECONDS * 1000) {
    await pollOnce()
  }
}

/** Minutes avant la prochaine vague recalculées à l'instant T depuis la dernière synchro. */
function liveSession(session: WebcupSession | null, syncedAt: Date | null) {
  if (!session) return null
  const live = { ...session, next_wave_at: null as string | null }
  if (
    syncedAt &&
    session.minutes_until_next_wave !== null &&
    session.minutes_until_next_wave !== undefined
  ) {
    const next = new Date(syncedAt.getTime() + Number(session.minutes_until_next_wave) * 60_000)
    live.next_wave_at = next.toISOString()
    live.minutes_until_next_wave = Math.max(0, Math.ceil((next.getTime() - Date.now()) / 60_000))
  }
  return live
}

/**
 * Demandes dédoublonnées + session. Les champs de l'API Webcup sont renvoyés tels quels
 * (snake_case) ; nos propres champs sont en camelCase.
 */
export async function listRequests({ onlyNew = false } = {}) {
  await ensureFresh()
  const state = await readState()
  const query = db
    .from('webcup_requests')
    .orderByRaw('seen_at IS NULL DESC')
    .orderBy('difficulty_level', 'desc')
    .orderBy('xp_total', 'desc')
    .orderBy('request_code', 'asc')
  if (onlyNew) query.whereNull('seen_at')
  const rows = await query
  const newCount = await db.from('webcup_requests').whereNull('seen_at').count('* as total').first()
  const syncedAt = state?.last_poll_at ? new Date(state.last_poll_at) : null

  return {
    session: liveSession(state?.session_json ? JSON.parse(state.session_json) : null, syncedAt),
    syncedAt: syncedAt?.toISOString() ?? null,
    lastError: state?.last_error ?? null,
    pollIntervalSeconds: POLL_INTERVAL_SECONDS,
    newCount: Number(newCount?.total ?? 0),
    requests: rows.map((row) => ({
      ...JSON.parse(row.payload),
      firstSeenAt: new Date(row.first_seen_at).toISOString(),
      isNew: !row.seen_at,
    })),
  }
}

/** Retire l'indicateur « nouvelle » : codes donnés, ou toutes les demandes si aucun code. */
export async function markSeen(codes?: string[]): Promise<number> {
  if (codes && !codes.length) return 0
  const query = db.from('webcup_requests').whereNull('seen_at')
  if (codes) query.whereIn('request_code', codes)
  // mysql2 renvoie le nombre de lignes modifiées (un tableau selon les versions de Lucid).
  const changed: number | number[] = await query.update({ seen_at: new Date() })
  return Number(Array.isArray(changed) ? changed[0] : changed) || 0
}
