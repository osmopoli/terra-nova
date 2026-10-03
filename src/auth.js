// D01 / D03 : comptes et connexion. D08 / D09 : rôles et contrôle d'accès.
const crypto = require('node:crypto');
const db = require('./db');
const { ah } = require('./async');

const SESSION_DAYS = 7;
const ROLES = ['citoyen', 'agent', 'admin'];
const ROLE_LABELS = { citoyen: 'Citoyen', agent: 'Agent municipal', admin: 'Administrateur' };

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

async function createUser({ email, name, password, role = 'citoyen' }) {
  const info = await db.run('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)',
    [email.trim().toLowerCase(), name.trim(), hashPassword(password), role]);
  return info.insertId;
}

function findUserByEmail(email) {
  return db.get('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
}

async function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + SESSION_DAYS * 864e5;
  await db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expires]);
  res.cookie('tn_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: SESSION_DAYS * 864e5 });
}

async function destroySession(req, res) {
  if (req.cookies.tn_session) await db.run('DELETE FROM sessions WHERE token = ?', [req.cookies.tn_session]);
  res.clearCookie('tn_session');
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').filter(Boolean).map((c) => {
    const i = c.indexOf('=');
    return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
  }));
}

// Charge l'utilisateur courant dans req.user / res.locals.user
const loadUser = ah(async (req, res, next) => {
  req.cookies = parseCookies(req.headers.cookie);
  const token = req.cookies.tn_session;
  req.user = null;
  if (token) {
    const row = await db.get(`SELECT u.id, u.email, u.name, u.role, u.created_at, s.expires_at
      FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`, [token]);
    if (row && Number(row.expires_at) > Date.now()) req.user = row;
    else if (row) await db.run('DELETE FROM sessions WHERE token = ?', [token]);
  }
  res.locals.user = req.user;
  next();
});

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect(`/connexion?next=${encodeURIComponent(req.originalUrl)}`);
  next();
}

// D09 : un citoyen n'atteint jamais les outils agents ; les fonctions sensibles restent réservées.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      if (req.path.startsWith('/api/') || req.baseUrl.startsWith('/api')) return res.status(401).json({ error: 'Non authentifié' });
      return res.redirect(`/connexion?next=${encodeURIComponent(req.originalUrl)}`);
    }
    if (!roles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api/')) return res.status(403).json({ error: 'Accès refusé' });
      return res.status(403).render403();
    }
    next();
  };
}

async function seedAccounts() {
  const seeds = [
    { email: process.env.ADMIN_EMAIL || 'admin@terranova.fr', password: process.env.ADMIN_PASSWORD || 'admin1234', name: 'Administrateur Terra Nova', role: 'admin' },
    { email: process.env.AGENT_EMAIL || 'agent@terranova.fr', password: process.env.AGENT_PASSWORD || 'agent1234', name: 'Agent municipal', role: 'agent' },
  ];
  for (const s of seeds) if (!(await findUserByEmail(s.email))) await createUser(s);
}

module.exports = { ROLES, ROLE_LABELS, createUser, findUserByEmail, verifyPassword, createSession, destroySession, loadUser, requireAuth, requireRole, seedAccounts };
