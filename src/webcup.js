// Polling de l'API Webcup / Nova Terra. La clé reste côté serveur.
// Dédoublonnage sur request_code ; aucune hypothèse sur le nombre ou le rythme des vagues.
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');

const API_URL = process.env.WEBCUP_API_URL || 'https://24h.webcup.fr/wp-json/webcup/v1/requests';
const INTERVAL = Math.min(Math.max(Number(process.env.POLL_INTERVAL_SECONDS) || 20, 15), 120) * 1000;
const FALLBACK = path.join(__dirname, '..', 'data', 'initial-requests.json');

db.prepare('INSERT OR IGNORE INTO api_state (id) VALUES (1)').run();

const upsert = db.prepare(`INSERT INTO api_requests (request_code, payload, difficulty_level, xp_total, wave)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(request_code) DO UPDATE SET payload = excluded.payload, difficulty_level = excluded.difficulty_level,
    xp_total = excluded.xp_total, wave = excluded.wave`);

function ingest(json) {
  const before = new Set(db.prepare('SELECT request_code FROM api_requests').all().map((r) => r.request_code));
  const fresh = [];
  for (const r of json.requests || []) {
    if (!r.request_code) continue;
    if (!before.has(r.request_code)) fresh.push(r.request_code);
    upsert.run(r.request_code, JSON.stringify(r), r.difficulty_level ?? null, r.xp_total ?? null, r.visible_since_wave ?? r.wave_number ?? null);
  }
  db.prepare("UPDATE api_state SET session_json = ?, last_poll_at = datetime('now'), last_error = NULL WHERE id = 1")
    .run(JSON.stringify(json.session || {}));
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

module.exports = { startPolling, pollOnce, getState, setDone, ingest };
