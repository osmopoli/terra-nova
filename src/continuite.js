/* Terra Nova — vague 19 (F93, F94) : continuité de service quand la base ou une dépendance tombe en panne.
   - « Paquet essentiel » : alertes et messages officiels en cours, état des services, numéros d'urgence, consignes, contacts
     utiles (mairie, associations et leurs horaires). Calculé depuis la base et gardé comme DERNIÈRE COPIE BONNE en mémoire
     et dans un fichier à côté de la base (instantane-essentiel.json) : si la base ne répond plus, les lectures essentielles
     (GET /api/essentiel, /api/etat, /api/officiels, /api/associations, /api/pouls, /essentiel, /simple) servent cette copie
     avec « stale: true » et l'heure de la copie, au lieu d'une erreur 500.
   - Incident simulé (démonstration, administrateur seulement, durée limitée, journalisé) : pendant la simulation, chaque
     requête HTTP d'un habitant ou d'un visiteur voit la base « en panne » (lecture de session comprise, comme une vraie panne) ;
     les tâches de fond et les requêtes de l'administrateur continuent normalement, pour pouvoir arrêter la simulation.
   - Une vraie panne (SQLite qui lève une erreur) suit exactement le même chemin.
   Aucune donnée personnelle dans la copie de secours : le résumé « Mes demandes » n'est gardé que dans le navigateur de l'habitant. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { AsyncLocalStorage } = require('node:async_hooks');
const router = require('express').Router();
const db = require('./db');
const { docs, audit, maintenant } = require('./donnees');

const als = new AsyncLocalStorage();
const FICHIER = path.join(path.dirname(process.env.DB_PATH
  || (process.env.NODE_ENV === 'production' ? path.join(os.homedir(), 'terranova-data', 'terranova.db') : path.join(__dirname, '..', 'data', 'terranova.db'))), 'instantane-essentiel.json');
const SEED = path.join(__dirname, '..', 'data', 'demo-seed.json');

class IncidentBase extends Error { constructor() { super('Base de données indisponible (incident).'); this.code = 'INCIDENT_BASE'; } }

/* ---------- Simulation : la base « tombe » pour les requêtes HTTP non exemptées ---------- */
let simulation = null;   // { mode: 'base', depuis, jusqu, par }
const simulee = () => { if (simulation && simulation.jusqu <= Date.now()) simulation = null; return simulation; };
const enPanne = () => { const c = als.getStore(); return !!(c && !c.exempt && simulee()); };
for (const k of ['tous', 'get', 'put', 'patch', 'suppr', 'vider', 'compte', 'prochainNumero']) {
  const f = docs[k];
  if (typeof f !== 'function') continue;
  docs[k] = (...a) => { if (enPanne()) throw new IncidentBase(); return f(...a); };
}
let testBase = 0, baseOkCache = true;
function baseOk() {
  if (Date.now() - testBase > 2000) { testBase = Date.now(); try { db.prepare('SELECT 1').get(); baseOkCache = true; } catch { baseOkCache = false; } }
  return baseOkCache;
}
const estErreurBase = (e) => !!e && (e.code === 'INCIDENT_BASE' || /sqlite|database|SQLITE_/i.test(String(e.code || '') + ' ' + String(e.message || '')));

/* ---------- Paquet essentiel ---------- */
function referenceSeed() {
  try { return JSON.parse(fs.readFileSync(SEED, 'utf8')).vague19.reference; } catch { return { numeros: [], locaux: [], consignes: {}, mairie: {} }; }
}
const REF_SEED = referenceSeed();
function semer() {
  try {
    if (docs.get('essentiel', 'reference')) return false;
    docs.put('essentiel', Object.assign({}, REF_SEED, { cree: maintenant() }));
    console.log('[demo] vague 19 : informations essentielles (numéros, contacts, consignes) ajoutées');
    return true;
  } catch (e) { console.error('[vague19] semis', e.message); return false; }
}

function construire() {
  const t = maintenant();
  const ref = docs.get('essentiel', 'reference') || REF_SEED;
  const alertes = docs.tous('annonces').filter((a) => a.active && a.importance !== 'info' && (!a.expire || a.expire > t))
    .sort((a, b) => String(b.cree).localeCompare(String(a.cree)))
    .map((a) => ({ id: a.id, titre: a.titre, zone: a.zone, resume: a.resume || '', consignes: a.consignes || [], publics: a.publics || [], importance: a.importance, categorie: a.categorie, cree: a.cree, expire: a.expire || '', active: true }));
  const officiels = require('./modules/officiel').actifsPour(null).map((m) => ({ id: m.id, titre: m.titre, message: m.message, actions: m.actions || [], audience: m.audience,
    debut: m.debut, fin: m.fin, traductions: m.traductions || {}, signataire: m.signataire || '',
    crise: require('./modules/officiel').vuePublique(m, null).crise }));   // vague 21 (F101) : crise localisée (vue publique)
  const services = docs.tous('services').map((s) => ({ id: s.id, nom: s.nom, description: s.description, icone: s.icone, categorie: s.categorie, prioritaire: !!s.prioritaire,
    etat: s.etat || { code: 'ok' }, horaires: s.horaires || '', lieu: s.lieu || '', contact: s.contact || '', rdv: !!s.rdv, lien: s.lien || '' }));
  const associations = docs.tous('associations').sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
    .map((a) => ({ id: a.id, nom: a.nom, icone: a.icone, quartier: a.quartier, adresse: a.adresse, tel: a.tel, email: a.email, plages: a.plages || [], info: a.info || '',
      aide: a.aide || {}, themes: a.themes || [], services: a.services || [], pmr: !!a.pmr, x: a.x, y: a.y, arret: a.arret, ordre: a.ordre }));
  return { version: 1, majLe: t, numeros: ref.numeros || [], locaux: ref.locaux || [], mairie: ref.mairie || {}, consignes: ref.consignes || {},
    alertes, officiels, services, associations };
}

let copie = null;      // { donnees, majLe, v }
try { const f = JSON.parse(fs.readFileSync(FICHIER, 'utf8')); if (f && f.majLe) copie = { donnees: f, majLe: f.majLe, v: -1 }; } catch { /* pas encore de copie */ }
let ecriture = null;
function sauverBientot() {
  if (ecriture) return;
  ecriture = setTimeout(() => {
    ecriture = null;
    try { fs.writeFileSync(FICHIER + '.tmp', JSON.stringify(copie.donnees)); fs.renameSync(FICHIER + '.tmp', FICHIER); } catch (e) { console.error('[vague19] copie de secours', e.message); }
  }, 1500);
  ecriture.unref();
}
// Paquet frais si la base répond (recalculé à chaque écriture, au plus toutes les 5 s), sinon dernière copie bonne (stale)
function essentiel() {
  if (enPanne() || !baseOk()) { if (!copie) throw new IncidentBase(); return { donnees: copie.donnees, stale: true }; }
  const v = docs.version();
  try {
    if (!copie || copie.v !== v || Date.now() - Date.parse(copie.majLe) > 60000) {
      if (copie && copie.v !== v && Date.now() - copie.t < 5000 && !enPanne()) return { donnees: copie.donnees, stale: false };
      const d = construire();
      copie = { donnees: d, majLe: d.majLe, v, t: Date.now() };
      sauverBientot();
    }
    return { donnees: copie.donnees, stale: false };
  } catch (e) {
    if (!copie) throw e;
    return { donnees: copie.donnees, stale: true };
  }
}
// rafraîchie aussi sans visite (toutes les minutes), sauf pendant une simulation
setInterval(() => { if (!simulee() && baseOk()) { try { essentiel(); } catch { /* base indisponible */ } } }, 60000).unref();

/* ---------- Middlewares ---------- */
// Remplace app.use(chargerUtilisateur) : contexte de la requête, lecture de session protégée
function contexte(chargerUtilisateur) {
  return (req, res, next) => {
    const ctx = { exempt: true };
    als.run(ctx, () => {
      let suite = false;
      const decider = (err) => {
        if (suite) return; suite = true;
        if (simulee() && !(req.user && req.user.role === 'admin')) { ctx.exempt = false; req.user = null; req.incident = 'simule'; }
        else if (!baseOk()) { req.user = null; req.incident = 'base'; }
        next(err);
      };
      try { chargerUtilisateur(req, res, decider); }
      catch (e) { if (suite) throw e; suite = true; req.user = null; req.incident = 'base'; ctx.exempt = false; next(); }
    });
  };
}

const PAGES_SECOURS = /^\/simple(\/|$)/;
function copieDe(res, d) { res.set('X-Copie-De-Secours', d.majLe); res.set('Cache-Control', 'no-store'); }
// Lectures essentielles pendant un incident : dernière copie bonne, jamais d'erreur 500
function secours(req, res, next) {
  if (!req.incident || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
  let e;
  try { e = essentiel(); } catch { return next(); }
  const d = e.donnees, stale = { stale: true, incident: true, majLe: d.majLe };
  switch (req.path) {
    case '/api/etat': copieDe(res, d); return res.json(Object.assign({ moi: null, services: d.services, annonces: d.alertes }, stale));
    case '/api/officiels': copieDe(res, d); return res.json(Object.assign({ maintenant: d.majLe, messages: d.officiels }, stale));
    case '/api/associations': copieDe(res, d); return res.json(d.associations);
    case '/api/pouls': copieDe(res, d); return res.json(Object.assign({ officiels: d.officiels, notif: null, veille: null }, stale));
    default:
      if (PAGES_SECOURS.test(req.path)) return require('./modules/essentiel').rendre(req, res, { stale: true, statut: 200 });
      return next();
  }
}
// Toute autre lecture ou écriture qui a besoin de la base pendant l'incident : 503 clair (ou la page essentielle)
function erreur(err, req, res, next) {
  if (!(req.incident || estErreurBase(err)) || res.headersSent) return next(err);
  if (!req.incident) { testBase = 0; if (baseOk() && err.code !== 'INCIDENT_BASE') return next(err); }
  res.set('Retry-After', '30');
  if (req.path.startsWith('/api/')) return res.status(503).json({ ok: false, incident: true, erreur: 'Un incident technique empêche cette action pour le moment. Les informations essentielles restent consultables (page « Infos essentielles »). Réessayez dans quelques minutes : rien n’est perdu.', essentiel: '/essentiel' });
  return require('./modules/essentiel').rendre(req, res, { stale: true, statut: 503 });
}

/* ---------- Routes ---------- */
router.get('/api/essentiel', (req, res) => {
  const e = essentiel();
  res.set('Cache-Control', 'no-cache');   // public, sans donnée personnelle : copié par le Service Worker (paquet hors connexion)
  if (e.stale) res.set('X-Copie-De-Secours', e.donnees.majLe);
  res.json(Object.assign({}, e.donnees, { stale: e.stale, incident: !!req.incident }));
});

// Résumé personnel (demandes récentes, prochains rendez-vous) : gardé seulement dans le navigateur de l'habitant, effacé à la déconnexion
router.get('/api/essentiel/moi', (req, res) => {
  if (!req.user) return res.status(401).json({ erreur: 'Connexion requise.' });
  res.set('Cache-Control', 'private, no-cache');
  const t = maintenant();
  const demandes = docs.tous('demandes').filter((d) => d.userId === req.user.id).sort((a, b) => String(b.cree).localeCompare(String(a.cree))).slice(0, 8)
    .map((d) => { const h = (d.historique || [])[(d.historique || []).length - 1] || {}; return { id: d.id, objet: d.objet, statut: d.statut, type: d.type, serviceId: d.serviceId || '', cree: d.cree, maj: h.date || d.cree, note: h.note || '' }; });
  const rdv = docs.tous('rdv').filter((r) => r.userId === req.user.id && r.statut !== 'annule' && r.debut > t).sort((a, b) => a.debut.localeCompare(b.debut)).slice(0, 3)
    .map((r) => ({ id: r.id, debut: r.debut, libelle: r.libelle || '', lieu: r.lieu || '', serviceId: r.serviceId }));
  res.json({ majLe: t, uid: req.user.id, prenom: req.user.prenom, demandes, rdv });
});

/* « Pouls » : une seule lecture légère toutes les 30 s au lieu de trois (messages officiels, notifications, veille).
   Sans le champ « maintenant » : réponse identique tant que rien ne change → 304 grâce à l'ETag (src/etag-api.js). */
router.get('/api/pouls', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const u = req.user;
  // vague 21 (F101) : même vue que GET /api/officiels (crise localisée : critique pour le quartier touché, rétablissement estimé)
  const off = require('./modules/officiel');
  const officiels = off.actifsPour(u).map((m) => off.vuePublique(m, u));
  let notif = null, veille = null;
  if (u) {
    const l = docs.tous('notifications').filter((n) => n.userId === u.id);
    notif = { n: l.filter((n) => !n.lu).length, total: l.length, dernier: l.reduce((m, n) => (String(n.cree) > m ? String(n.cree) : m), '') };
    const urg = require('./modules/urgences');
    if (typeof urg.veillePour === 'function') veille = urg.veillePour(u);
  }
  res.json({ officiels, notif, veille });
});

const personnel = (req, res, next) => (req.user && (req.user.role === 'agent' || req.user.role === 'admin') ? next() : res.status(req.user ? 403 : 401).json({ erreur: req.user ? 'Accès refusé pour votre profil.' : 'Connexion requise.' }));
function etatContinuite() {
  let webcup = null;
  try { webcup = db.prepare('SELECT last_poll_at, last_error FROM api_state WHERE id = 1').get() || null; } catch { /* table absente */ }
  let octets = 0, fichier = false;
  try { octets = fs.statSync(FICHIER).size; fichier = true; } catch { /* pas encore écrite */ }
  const s = simulee();
  return { base: baseOk() ? 'ok' : 'panne', simulation: s ? { mode: s.mode, depuis: new Date(s.depuis).toISOString(), jusqu: new Date(s.jusqu).toISOString(), par: s.par } : null,
    copie: copie ? { majLe: copie.majLe, octets: octets || Buffer.byteLength(JSON.stringify(copie.donnees)), fichier, alertes: copie.donnees.alertes.length, officiels: copie.donnees.officiels.length,
      services: copie.donnees.services.length, associations: copie.donnees.associations.length } : null,
    webcup: webcup ? { derniere: webcup.last_poll_at, erreur: webcup.last_error || '' } : null,
    essentiels: ['/api/essentiel', '/api/etat (visiteur)', '/api/officiels', '/api/associations', '/api/pouls', '/essentiel', '/simple'] };
}
router.get('/api/continuite', personnel, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(etatContinuite()); });
router.post('/api/continuite/simuler', (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(req.user ? 403 : 401).json({ erreur: 'Action réservée à l’administrateur.' });
  const b = req.body || {};
  const avant = simulee() ? 'incident simulé' : 'normal';
  if (b.mode === 'aucun') simulation = null;
  else if (b.mode === 'base') {
    try { essentiel(); } catch { /* garde la copie existante */ }
    const minutes = Math.max(1, Math.min(30, Math.round(Number(b.minutes) || 5)));
    simulation = { mode: 'base', depuis: Date.now(), jusqu: Date.now() + minutes * 60000, par: `${req.user.prenom} ${req.user.nom}` };
  } else return res.status(400).json({ erreur: 'Mode inconnu : base ou aucun.' });
  audit(req.user, { categorie: 'plateforme', action: b.mode === 'aucun' ? 'Fin de l’incident simulé' : 'Incident simulé : base de données indisponible', objetId: 'continuite',
    objetLibelle: 'Continuité de service', avant, apres: b.mode === 'aucun' ? 'normal' : `base indisponible (${Math.round((simulation.jusqu - Date.now()) / 60000)} min)`, motif: String(b.motif || '').slice(0, 200) || 'Démonstration de la continuité de service' });
  res.json(etatContinuite());
});

module.exports = { router, contexte, secours, erreur, essentiel, semer, baseOk, simulee, IncidentBase };
