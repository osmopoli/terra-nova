// Données de démonstration (comptes, services, demandes, annonces, journal) chargées au premier démarrage.
// Source : data/demo-seed.json (dates relatives « @<ms> » recalculées à partir de maintenant).
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const { docs } = require('./donnees');
const { creerCompte, parEmail } = require('./auth');

const FICHIER = path.join(__dirname, '..', 'data', 'demo-seed.json');
const COLLECTIONS = ['utilisateurs', 'services', 'demandes', 'annonces', 'audit', 'notifications', 'rdv', 'journal'];

function absolu(v, t) {
  if (typeof v === 'string' && /^@\d+$/.test(v)) return new Date(t - Number(v.slice(1))).toISOString();
  if (Array.isArray(v)) return v.map((x) => absolu(x, t));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolu(x, t)]));
  return v;
}

function semer({ forcer = false } = {}) {
  if (!forcer && docs.compte('services') > 0) return false;
  const s = absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')), Date.now());
  if (forcer) {
    for (const c of COLLECTIONS) docs.vider(c);
    db.exec('DELETE FROM sessions; DELETE FROM securite;');
    db.prepare("DELETE FROM users WHERE email LIKE '%@nova.test'").run();
  }
  for (const u of s.utilisateurs) {
    const { motdepasseDemo, ...profil } = u;
    if (!parEmail(profil.email)) creerCompte(profil, motdepasseDemo || 'Citoyen2026');
  }
  for (const c of ['services', 'demandes', 'annonces', 'audit']) for (const d of s[c] || []) docs.put(c, d);
  docs.fixerCompteur('demandes', s.compteur || 1040);
  console.log('[demo] données de démonstration chargées');
  return true;
}

module.exports = { semer };
