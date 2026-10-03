// Base SQLite intégrée à Node (node:sqlite). Un seul fichier : data/terranova.db (volume Docker).
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(process.env.DB_PATH || path.join(dir, 'terranova.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Identifiants : le mot de passe (scrypt) et le rôle font foi côté serveur.
-- Le profil (prénom, quartier, préférences…) est un document de la collection « utilisateurs ».
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

-- Documents métier (demandes, annonces, services, rendez-vous, notifications, journal d'audit…)
CREATE TABLE IF NOT EXISTS docs (
  col TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  cree TEXT NOT NULL,
  PRIMARY KEY (col, id)
);
CREATE INDEX IF NOT EXISTS docs_col ON docs(col, cree);

-- F37 : état anti-intrusion par adresse e-mail (échecs, verrouillage progressif)
CREATE TABLE IF NOT EXISTS securite (
  email TEXT PRIMARY KEY,
  etat TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compteurs (
  nom TEXT PRIMARY KEY,
  valeur INTEGER NOT NULL
);

-- Demandes reçues de l'API Webcup, dédoublonnées sur request_code (D19)
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
`);

// Migration : lien entre un compte et son document de profil
const colonnes = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!colonnes.includes('doc_id')) db.exec('ALTER TABLE users ADD COLUMN doc_id TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_doc ON users(doc_id)');

module.exports = db;
