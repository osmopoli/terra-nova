// Polling de l'API Webcup / Nova Terra. La clé reste côté serveur.
// Dédoublonnage sur request_code ; aucune hypothèse sur le nombre ou le rythme des vagues.
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');

const API_URL = process.env.WEBCUP_API_URL || 'https://24h.webcup.fr/wp-json/webcup/v1/requests';
const INTERVAL = Math.min(Math.max(Number(process.env.POLL_INTERVAL_SECONDS) || 30, 15), 120) * 1000;
const FALLBACK = path.join(__dirname, '..', 'data', 'initial-requests.json');
// Champs qui bougent tout seuls avec le temps (bonus XP) : ignorés pour détecter un vrai changement de contenu.
const VOLATILE = new Set(['xp_available', 'xp_time_bonus', 'xp_total', 'sort_order']);

db.prepare('INSERT OR IGNORE INTO api_state (id) VALUES (1)').run();

const upsert = db.prepare(`INSERT INTO api_requests (request_code, payload, difficulty_level, xp_total, wave)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(request_code) DO UPDATE SET payload = excluded.payload, difficulty_level = excluded.difficulty_level,
    xp_total = excluded.xp_total, wave = excluded.wave`);
const logEvent = db.prepare('INSERT INTO api_events (kind, request_code, details) VALUES (?, ?, ?)');

function changedFields(prev, next) {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  return [...keys].filter((k) => !VOLATILE.has(k) && JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
}

function ingest(json) {
  const before = new Map(db.prepare('SELECT request_code, payload FROM api_requests').all().map((r) => [r.request_code, JSON.parse(r.payload)]));
  const prevSession = JSON.parse(db.prepare('SELECT session_json FROM api_state WHERE id = 1').get()?.session_json || 'null');
  const fresh = [];
  for (const r of json.requests || []) {
    if (!r.request_code) continue;
    const prev = before.get(r.request_code);
    if (!prev) {
      fresh.push(r.request_code);
      logEvent.run('nouvelle', r.request_code, JSON.stringify({ requester_name: r.requester_name, message_public: r.message_public }));
    } else {
      const fields = changedFields(prev, r);
      if (fields.length) logEvent.run('modifiee', r.request_code, JSON.stringify({ fields, requester_name: r.requester_name, message_public: r.message_public }));
    }
    upsert.run(r.request_code, JSON.stringify(r), r.difficulty_level ?? null, r.xp_total ?? null, r.visible_since_wave ?? r.wave_number ?? null);
  }
  const session = json.session || {};
  if (prevSession && session.current_wave != null && session.current_wave !== prevSession.current_wave) {
    logEvent.run('vague', null, JSON.stringify({ from: prevSession.current_wave ?? null, to: session.current_wave }));
  }
  db.prepare("UPDATE api_state SET session_json = ?, last_poll_at = datetime('now'), last_error = NULL WHERE id = 1")
    .run(JSON.stringify(session));
  if (fresh.length) console.log(`[webcup] ${fresh.length} nouvelle(s) demande(s) : ${fresh.join(', ')}`);
  return fresh;
}

async function pollOnce() {
  const key = process.env.WEBCUP_API_KEY;
  if (!key) {
    // Mode hors-ligne : on charge le dernier export JSON connu.
    if (fs.existsSync(FALLBACK)) ingest(JSON.parse(fs.readFileSync(FALLBACK, 'utf8')));
    db.prepare("UPDATE api_state SET last_error = ? WHERE id = 1").run('WEBCUP_API_KEY absente : données chargées depuis data/initial-requests.json');
    return;
  }
  try {
    const res = await fetch(API_URL, { headers: { 'X-Webcup-Api-Key': key, Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ingest(await res.json());
  } catch (err) {
    console.error('[webcup] échec du polling :', err.message);
    db.prepare("UPDATE api_state SET last_error = ?, last_poll_at = datetime('now') WHERE id = 1").run(err.message);
  }
}

function startPolling() {
  pollOnce();
  setInterval(pollOnce, INTERVAL).unref();
}

function getState() {
  const state = db.prepare('SELECT * FROM api_state WHERE id = 1').get();
  const rows = db.prepare('SELECT * FROM api_requests ORDER BY done ASC, difficulty_level DESC, xp_total DESC, request_code ASC').all();
  return {
    session: state.session_json ? JSON.parse(state.session_json) : null,
    last_poll_at: state.last_poll_at,
    last_error: state.last_error,
    poll_interval_seconds: INTERVAL / 1000,
    requests: rows.map((r) => ({ ...JSON.parse(r.payload), first_seen_at: r.first_seen_at, done: !!r.done })),
  };
}

function setDone(code, done) {
  return db.prepare('UPDATE api_requests SET done = ? WHERE request_code = ?').run(done ? 1 : 0, code).changes;
}

// Journal de veille : les 100 derniers événements, ou ceux postérieurs à `since` (id).
function getEvents(since = 0) {
  const state = db.prepare('SELECT * FROM api_state WHERE id = 1').get();
  const events = db.prepare('SELECT * FROM api_events WHERE id > ? ORDER BY id DESC LIMIT 100').all(Number(since) || 0);
  return {
    server_now: new Date().toISOString(),
    last_poll_at: state.last_poll_at,
    last_error: state.last_error,
    poll_interval_seconds: INTERVAL / 1000,
    session: state.session_json ? JSON.parse(state.session_json) : null,
    request_count: db.prepare('SELECT COUNT(*) n FROM api_requests').get().n,
    events: events.map((e) => ({ ...e, details: e.details ? JSON.parse(e.details) : null })),
  };
}

module.exports = { startPolling, pollOnce, getState, getEvents, setDone, ingest };
