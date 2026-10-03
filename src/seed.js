// Données de démonstration (comptes, services, demandes, annonces, journal) chargées au premier démarrage.
// Source : data/demo-seed.json (dates relatives « @<ms> » = il y a <ms>, « @-<ms> » = dans <ms>, recalculées à partir de maintenant).
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const { docs } = require('./donnees');
const { creerCompte, parEmail, motsDePasseDemo } = require('./auth');

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

/* Vague 13 : agent habilité, nouvel arrivant sans e-mail (F70, F71), dossiers administratifs réservés (chiffrés).
   Semés aussi sur une base déjà en service (chaque compte n'est créé qu'une fois). */
function semerVague13(s) {
  const v13 = s.vague13 || {};
  let ajout = false;
  for (const u of v13.utilisateurs || []) { const { motdepasseDemo, ...profil } = u; if (!parEmail(profil.email)) { creerCompte(profil, motdepasseDemo || 'Citoyen2026'); ajout = true; } }
  if (ajout) for (const [email, dossier] of Object.entries(v13.dossiers || {})) { const r = parEmail(email); if (r) docs.patch('utilisateurs', r.doc_id, { dossier }); }
  return ajout;
}

// Réinitialisation (admin) : seuls les comptes de démonstration du fichier sont supprimés, avec leurs sessions, dossiers
// de connexion et documents. Les habitants réellement inscrits (et leurs demandes, rendez-vous, notifications,
// avis, idées, journal) sont conservés.
function viderDemo(s) {
  const emailsDemo = [...s.utilisateurs, ...((s.vague13 || {}).utilisateurs || [])].map((u) => String(u.email).toLowerCase());
  const lignes = emailsDemo.map(parEmail).filter(Boolean);
  const idsDemo = new Set(lignes.map((r) => r.doc_id));
  const conserves = new Set(db.prepare('SELECT doc_id FROM users').all().map((r) => r.doc_id).filter((id) => id && !idsDemo.has(id)));
  const emailsConserves = new Set(db.prepare('SELECT email FROM users').all().map((r) => r.email).filter((e) => !emailsDemo.includes(e)));
  for (const c of COLLECTIONS) {
    for (const d of docs.tous(c)) {
      const garder = c === 'utilisateurs' ? conserves.has(d.id) : c === 'journal' ? emailsConserves.has(d.email) : !!d.userId && conserves.has(d.userId);
      if (!garder) docs.suppr(c, d.id);
    }
  }
  const suppr = db.prepare('DELETE FROM users WHERE id = ?'), supprLie = ['sessions', 'deux_etapes', 'cles_acces', 'appareils'].map((t) => db.prepare(`DELETE FROM ${t} WHERE user_id = ?`));
  for (const r of lignes) { supprLie.forEach((q) => q.run(r.id)); suppr.run(r.id); db.prepare('DELETE FROM connexion_tel WHERE login = ?').run(r.email); }
  db.exec('DELETE FROM securite;');
  // le compteur NT-xxxx ne doit jamais redescendre sous une demande conservée
  const max = docs.tous('demandes').reduce((m, d) => Math.max(m, Number(String(d.id).replace(/^NT-/, '')) || 0), 0);
  return Math.max(s.compteur || 1040, max);
}

function semer({ forcer = false } = {}) {
  const lire = () => absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')), Date.now());
  if (!forcer && docs.compte('services') > 0) {
    if (docs.compte('projets') === 0) { semerParticipation(lire()); console.log('[demo] participation (vague 12) chargée'); }
    if (semerVague13(lire())) console.log('[demo] comptes et dossiers de la vague 13 chargés');
    motsDePasseDemo();
    return false;
  }
  const s = lire();
  let compteur = s.compteur || 1040;
  if (forcer) compteur = viderDemo(s);
  for (const u of s.utilisateurs) {
    const { motdepasseDemo, ...profil } = u;
    if (!parEmail(profil.email)) creerCompte(profil, motdepasseDemo || 'Citoyen2026');
  }
  for (const c of ['services', 'demandes', 'annonces', 'audit']) for (const d of s[c] || []) docs.put(c, d);
  semerVague13(s);
  docs.fixerCompteur('demandes', compteur);
  semerParticipation(s);
  motsDePasseDemo();
  console.log('[demo] données de démonstration chargées');
  return true;
}

module.exports = { semer };
