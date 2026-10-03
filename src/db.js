// Base SQLite intégrée à Node (node:sqlite). Un seul fichier : data/terranova.db en local.
// En production (HODI), chaque déploiement remplace le dossier de l'application : la base vit donc
// dans le dossier personnel (~/terranova-data) pour survivre aux déploiements, sauf si DB_PATH est fourni.
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const fichier = process.env.DB_PATH
  || (process.env.NODE_ENV === 'production' ? path.join(os.homedir(), 'terranova-data', 'terranova.db') : path.join(__dirname, '..', 'data', 'terranova.db'));
fs.mkdirSync(path.dirname(fichier), { recursive: true });
const db = new DatabaseSync(fichier);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
-- Vague 15 (F77, F78) : tenue en charge. Attendre au lieu d'échouer si la base est occupée ; écritures moins coûteuses
-- en WAL (sûr : aucune perte si le processus s'arrête) ; cache de pages et tables temporaires en mémoire.
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -16000;
PRAGMA temp_store = MEMORY;

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
// Vague 15 : index des requêtes chaudes (déconnexion de tous les appareils d'un compte, sessions expirées)
db.exec('CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id); CREATE INDEX IF NOT EXISTS sessions_expire ON sessions(expires_at);');

/* Vague 15 : réutilisation des requêtes préparées. db.prepare(sql) avec le même texte renvoie la requête déjà compilée
   au lieu de la recompiler à chaque requête HTTP (ex. lecture de la session). node:sqlite est synchrone : une requête
   préparée ne sert jamais à deux appels en même temps. */
const preparer = db.prepare.bind(db);
const preparees = new Map();
db.prepare = (sql) => {
  let s = preparees.get(sql);
  if (!s) { s = preparer(sql); if (preparees.size < 400) preparees.set(sql, s); }
  return s;
};

module.exports = db;
