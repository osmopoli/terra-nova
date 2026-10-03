// Données de démonstration (comptes, services, demandes, annonces, journal) chargées au premier démarrage.
// Source : data/demo-seed.json (dates relatives « @<ms> » = il y a <ms>, « @-<ms> » = dans <ms>, recalculées à partir de maintenant).
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const { docs } = require('./donnees');
const { creerCompte, parEmail } = require('./auth');

const FICHIER = path.join(__dirname, '..', 'data', 'demo-seed.json');
const PARTICIPATION = ['consultations', 'avis', 'projets', 'idees'];   // vague 12 (F65-F68)
const VAGUE14 = ['officiels', 'associations', 'avisServices'];   // vague 14 (F73, F74, F76)
const COLLECTIONS = ['utilisateurs', 'services', 'demandes', 'annonces', 'audit', 'notifications', 'rdv', 'journal', ...PARTICIPATION, ...VAGUE14];

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

/* Vague 14 : message officiel (F73), associations partenaires (F74), demandes semblables (F75), avis sur les services (F76).
   Chargés une seule fois, y compris sur une base déjà en service (compteur « seed_vague14 ») ; les demandes prennent le prochain
   numéro NT-xxxx libre pour ne jamais écraser une vraie demande. */
function semerVague14(s) {
  const fait = db.prepare('SELECT valeur FROM compteurs WHERE nom = ?').get('seed_vague14');
  if (fait && fait.valeur > 0) return false;
  const v = s.vague14 || {};
  const existe = (id) => !!(id && docs.get('utilisateurs', id));
  const maintenant = new Date().toISOString();
  for (const a of v.associations || []) if (!docs.get('associations', a.id)) docs.put('associations', a);
  for (const m of v.officiels || []) {
    const n = docs.prochainNumero('officiels', 0);
    docs.put('officiels', Object.assign({ id: 'OFF-' + String(n).padStart(4, '0'), cree: m.debut < maintenant ? m.debut : maintenant,
      signataire: 'Haut Conseil de la Ville', statut: 'publie', accuses: [], accusesAppareils: 0 }, m));
  }
  for (const r of v.rdv || []) if (!docs.get('rdv', r.id) && existe(r.userId)) docs.put('rdv', r);
  for (const d of v.demandes || []) {
    const { ref, historique, ...dem } = d;   // eslint-disable-line no-unused-vars
    if (dem.userId && !existe(dem.userId)) dem.userId = null;
    const id = 'NT-' + docs.prochainNumero('demandes', 1040);
    docs.put('demandes', Object.assign(dem, { id, historique: [{ date: dem.cree, statut: 'recue', note: 'Demande enregistrée et transmise au service concerné.', par: 'Système' }].concat(historique || []) }));
  }
  for (const a of v.avisServices || []) {
    if (!existe(a.userId)) continue;
    const n = docs.prochainNumero('avisServices', 0);
    docs.put('avisServices', Object.assign({ id: 'COM-' + String(n).padStart(4, '0'), statut: 'publie', modifications: 0 }, a));
  }
  docs.fixerCompteur('seed_vague14', 1);
  return true;
}

function semer({ forcer = false } = {}) {
  const lire = () => absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')), Date.now());
  if (!forcer && docs.compte('services') > 0) {
    if (docs.compte('projets') === 0) { semerParticipation(lire()); console.log('[demo] participation (vague 12) chargée'); }
    if (semerVague13(lire())) console.log('[demo] comptes et dossiers de la vague 13 chargés');
    if (semerVague14(lire())) console.log('[demo] contenus de la vague 14 chargés (message officiel, associations, demandes semblables, avis)');
    return false;
  }
  const s = lire();
  if (forcer) {
    for (const c of COLLECTIONS) docs.vider(c);
    db.exec('DELETE FROM sessions; DELETE FROM securite;');
    db.prepare("DELETE FROM users WHERE email LIKE '%@nova.test'").run();
    db.exec("DELETE FROM users WHERE email LIKE 'tn-%'; DELETE FROM connexion_tel;");   // F71 : comptes sans e-mail
    for (const c of ['seed_vague14', 'officiels', 'avisServices']) docs.fixerCompteur(c, 0);   // vague 14 : rechargée avec la démo
  }
  for (const u of s.utilisateurs) {
    const { motdepasseDemo, ...profil } = u;
    if (!parEmail(profil.email)) creerCompte(profil, motdepasseDemo || 'Citoyen2026');
  }
  for (const c of ['services', 'demandes', 'annonces', 'audit']) for (const d of s[c] || []) docs.put(c, d);
  semerVague13(s);
  docs.fixerCompteur('demandes', s.compteur || 1040);
  semerParticipation(s);
  semerVague14(s);
  console.log('[demo] données de démonstration chargées');
  return true;
}

module.exports = { semer };
