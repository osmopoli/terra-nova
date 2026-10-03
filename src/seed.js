// Données de démonstration (comptes, services, demandes, annonces, journal) chargées au premier démarrage.
// Source : data/demo-seed.json (dates relatives « @<ms> » = il y a <ms>, « @-<ms> » = dans <ms>, recalculées à partir de maintenant).
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const { docs } = require('./donnees');
const { creerCompte, parEmail } = require('./auth');

const FICHIER = path.join(__dirname, '..', 'data', 'demo-seed.json');
const PARTICIPATION = ['consultations', 'avis', 'projets', 'idees'];   // vague 12 (F65-F68)
const COLLECTIONS = ['utilisateurs', 'services', 'demandes', 'annonces', 'audit', 'notifications', 'rdv', 'journal', ...PARTICIPATION];

function absolu(v, t) {
  if (typeof v === 'string' && /^@-?\d+$/.test(v)) return new Date(t - Number(v.slice(1))).toISOString();
  if (Array.isArray(v)) return v.map((x) => absolu(x, t));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolu(x, t)]));
  return v;
}

// Consultations, avis, projets et idées : semés aussi sur une base déjà en service qui ne les a pas encore
function semerParticipation(s) {
  for (const c of PARTICIPATION) for (const d of s[c] || []) docs.put(c, d);
  for (const [nom, v] of Object.entries(s.compteurs || {})) docs.fixerCompteur(nom, v);
}

function semer({ forcer = false } = {}) {
  const lire = () => absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')), Date.now());
  if (!forcer && docs.compte('services') > 0) {
    if (docs.compte('projets') === 0) { semerParticipation(lire()); console.log('[demo] participation (vague 12) chargée'); }
    return false;
  }
  const s = lire();
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
  semerParticipation(s);
  console.log('[demo] données de démonstration chargées');
  return true;
}

module.exports = { semer };
