const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(process.env.DB_PATH || path.join(dir, 'terranova.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citoyen' CHECK (role IN ('citoyen','agent','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- Demandes reçues de l'API Webcup, dédoublonnées sur request_code
CREATE TABLE IF NOT EXISTS api_requests (
  request_code TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  difficulty_level INTEGER,
  xp_total INTEGER,
  wave INTEGER,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  done INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  session_json TEXT,
  last_poll_at TEXT,
  last_error TEXT
);

-- Messages / demandes des habitants (D04, traités par les agents F22)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_slug TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau','en_cours','traite')),
  agent_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  hours TEXT,
  contact TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Annonce',
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Migration légère : désactivation de compte (F34)
if (!db.prepare('PRAGMA table_info(users)').all().some((c) => c.name === 'disabled')) {
  db.exec('ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0');
}

module.exports = db;
