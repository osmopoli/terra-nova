/* Terra Nova — tenue en charge (vague 15 : F77 surcharge du serveur, F78 affluence simultanée)
   Un seul processus Node (Passenger sur HODI, hébergement mutualisé) : chaque milliseconde de calcul compte.
   - Mesure en continu : retard de la boucle d'événements (perf_hooks.monitorEventLoopDelay), requêtes en cours,
     débit, latence p50 / p95 / p99 sur 60 s, mémoire. Niveau de charge : normal → forte → critique (avec hystérésis).
   - Délestage : en « forte », les calculs lourds et non essentiels (diagnostics, indicateurs, exports, flux Webcup)
     répondent 503 + Retry-After avec un message simple ; en « critique », les fonctions secondaires aussi (soutiens,
     participation, avis, regroupements…). L'essentiel n'est jamais délesté : connexion, état de la plateforme et des
     services, alertes et messages officiels, déposer une demande, version simple, urgences, pages et fichiers.
   - Équité : au plus N requêtes API simultanées par adresse IP ; au-delà, file d'attente courte (l'essentiel passe devant),
     puis 503 poli. Délai maximal par requête (réponse 503 propre plutôt qu'une page qui tourne sans fin).
   - Mémoïsation des lectures chaudes (GET /api/etat, messages officiels, signalements publics…) par profil, invalidée à
     chaque écriture (numéro de version des documents) et bornée par une durée courte.
   - Mode dégradé forcé par l'administrateur (démonstration), journalisé, avec expiration automatique. */
const { monitorEventLoopDelay } = require('node:perf_hooks');
const router = require('express').Router();
const { docs, audit } = require('./donnees');

const N = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : d);
const CONFIG = {
  lagForte: N(process.env.CHARGE_LAG_FORTE, 120),        // ms (p99 du retard de la boucle sur 1 s)
  lagCritique: N(process.env.CHARGE_LAG_CRITIQUE, 350),
  enCoursForte: N(process.env.CHARGE_EN_COURS_FORTE, 60),
  enCoursCritique: N(process.env.CHARGE_EN_COURS_CRITIQUE, 150),
  p95Forte: N(process.env.CHARGE_P95_FORTE, 800),         // ms, latence serveur (attente comprise) sur 10 s
  p95Critique: N(process.env.CHARGE_P95_CRITIQUE, 2000),
  parIp: N(process.env.CHARGE_PAR_IP, 8),                 // requêtes API simultanées par IP
  fileParIp: N(process.env.CHARGE_FILE_PAR_IP, 24),
  attenteMax: N(process.env.CHARGE_ATTENTE_MAX, 4000),    // ms dans la file avant 503
  delaiMax: N(process.env.CHARGE_DELAI_MAX, 15000),       // ms par requête
  retour: 15000,                                          // ms sous les seuils avant de redescendre d'un niveau
  cache: process.env.CHARGE_CACHE !== '0'
};
const NIVEAUX = ['normal', 'forte', 'critique'];
const rang = (n) => NIVEAUX.indexOf(n);

/* ---------- Classement des chemins ---------- */
// Toujours servis (jamais délestés, passent devant dans la file d'attente)
const ESSENTIEL = [
  /^\/api\/(health|charge)(\/|$)/, /^\/api\/auth\//, /^\/api\/etat$/, /^\/api\/officiels(\/[^/]+\/compris)?$/,
  /^\/api\/services\//, /^\/api\/notifications\//, /^\/api\/accueil\/(code|inscrire)$/, /^\/api\/securite\/etat$/,
  /^\/api\/urgences(\/|-points|$)/, /^\/api\/veille$/, /^\/api\/activite(\/|$)/,   // vague 17 (F86) : urgences médicales et veille, jamais délestées
  /^\/api\/recherche$/, /^\/api\/orientation(\/suggestions)?$/, /^\/api\/langage-clair(\/[^/]+)?$/,   // vague 18 (D10, F89, F91, F92) : trouver le bon service, jamais délesté
  /^\/api\/mobilite(\/itineraire)?$/, /^\/api\/vague20\/resume$/   // vague 20 (F97) : lignes interrompues et solutions de remplacement, jamais délestées
];
const estEssentiel = (req) => ESSENTIEL.some((r) => r.test(req.path))
  || (req.method === 'POST' && req.path === '/api/docs/demandes')            // déposer une demande, un signalement
  || (req.method === 'PATCH' && /^\/api\/docs\/(demandes|notifications|rdv)\//.test(req.path));
// Délestés dès la charge forte : calculs lourds, non essentiels pour l'habitant
const LOURD = [/^\/api\/sobriete$/, /^\/api\/indicateurs$/, /^\/api\.php$/, /^\/api\/webcup\//, /^\/api\/mes-donnees$/, /^\/api\/bouclier/, /^\/api\/securite\/journal/,
  /^\/api\/exports\/(apercu|fichier)$/, /^\/api\/sauvegardes$/, /^\/api\/integrite\/controler$/,   // vague 17 (F85, F87, F88) : exports, sauvegardes, contrôles
  /^\/api\/usage(\/|$)/];   // vague 20 (F98) : mesure d'usage et rapport, en pause en forte affluence
// Délestés en charge critique : utiles mais secondaires
const SECONDAIRE = [/^\/api\/demandes\/(groupes|publiques)$/, /^\/api\/demandes\/[^/]+\/(semblables|soutenir)$/, /^\/api\/participation/,
  /^\/api\/(consultations|idees|projets)/, /^\/api\/avis-services/, /^\/api\/contributions/, /^\/api\/mon-recapitulatif$/, /^\/api\/mes-informations$/,
  /^\/api\/journal$/, /^\/api\/habilitations/, /^\/api\/officiels\/tous$/,
  /^\/api\/explications/, /^\/api\/orientation\/(questions|synonymes)/];   // vague 18 (F90, F91) : statistiques des agents
function classe(req) {
  if (!req.path.startsWith('/api')) return 'page';
  if (estEssentiel(req)) return 'essentiel';
  if (LOURD.some((r) => r.test(req.path))) return 'lourd';
  if (SECONDAIRE.some((r) => r.test(req.path))) return 'secondaire';
  return 'normal';
}

/* ---------- Mesures ---------- */
const boucle = monitorEventLoopDelay({ resolution: 10 });
boucle.enable();
const m = {
  demarre: Date.now(), total: 0, enCours: 0, enCoursMax: 0, delestees: 0, refusIp: 0, expirees: 0, erreurs5xx: 0, limitees429: 0,
  parChemin: new Map(),               // chemin délesté → nombre
  cacheHits: 0, cacheMiss: 0,
  lag: { p50: 0, p99: 0, max: 0 }, lagMax: 0
};
const durees = [];                    // [horodatage, ms] des requêtes API terminées (60 s glissantes)
const historique = [];                // échantillons toutes les 2 s (3 min)
let auto = 'normal', autoDepuis = Date.now(), dernierDepassement = 0;
// Un pic isolé (démarrage, compression d'un fichier, ramasse-miettes) n'est pas une surcharge :
// pas de montée automatique pendant les 20 s qui suivent le démarrage, puis il faut 2 s de dépassement d'affilée.
const GRACE_DEMARRAGE = 20000, SECONDES_POUR_MONTER = 2;
let depassementsSuivis = 0;
let force = null;                     // { niveau, jusqu, par }

const pct = (l, p) => { if (!l.length) return 0; const s = l.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };
function latences(fenetre) {
  const lim = Date.now() - fenetre;
  const l = []; for (let i = durees.length - 1; i >= 0 && durees[i][0] >= lim; i--) l.push(durees[i][1]);
  return { n: l.length, p50: Math.round(pct(l, 50)), p95: Math.round(pct(l, 95)), p99: Math.round(pct(l, 99)) };
}
function niveau() {
  if (force && force.jusqu > Date.now()) return rang(force.niveau) > rang(auto) ? force.niveau : auto;
  if (force) force = null;
  return auto;
}
let tick = 0;
setInterval(() => {
  m.lag = { p50: Math.round(boucle.percentile(50) / 1e6), p99: Math.round(boucle.percentile(99) / 1e6), max: Math.round(boucle.max / 1e6) };
  m.lagMax = Math.max(m.lagMax, m.lag.max);
  boucle.reset();
  const lim = Date.now() - 60000; while (durees.length && durees[0][0] < lim) durees.shift();
  const r10 = latences(10000);
  const vise = m.lag.p99 >= CONFIG.lagCritique || m.enCours >= CONFIG.enCoursCritique || (r10.n >= 20 && r10.p95 >= CONFIG.p95Critique) ? 'critique'
    : m.lag.p99 >= CONFIG.lagForte || m.enCours >= CONFIG.enCoursForte || (r10.n >= 20 && r10.p95 >= CONFIG.p95Forte) ? 'forte' : 'normal';
  const t = Date.now();
  if (rang(vise) >= rang(auto)) dernierDepassement = t;                                               // le niveau actuel est encore justifié
  depassementsSuivis = rang(vise) > rang(auto) ? depassementsSuivis + 1 : 0;
  if (rang(vise) > rang(auto) && t - m.demarre >= GRACE_DEMARRAGE && depassementsSuivis >= SECONDES_POUR_MONTER) { auto = vise; autoDepuis = t; depassementsSuivis = 0; }   // monte après 2 s de dépassement
  else if (rang(vise) < rang(auto) && t - dernierDepassement >= CONFIG.retour) { auto = NIVEAUX[rang(auto) - 1]; autoDepuis = t; dernierDepassement = t; }   // redescend d'un palier après 15 s sous le seuil
  if (++tick % 2 === 0) {
    const d = latences(2000);
    historique.push({ t, lag: m.lag.p99, enCours: m.enCours, rps: Math.round(d.n / 2), p95: d.p95, niveau: niveau() });
    if (historique.length > 90) historique.shift();
  }
}, 1000).unref();

/* ---------- Middleware 1 : mesure (monté avant tout le reste) ---------- */
function mesurer(req, res, next) {
  const api = req.path.startsWith('/api');
  const t0 = process.hrtime.bigint();
  m.total++; m.enCours++; if (m.enCours > m.enCoursMax) m.enCoursMax = m.enCours;
  if (api) res.setHeader('X-Charge', niveau());
  let fini = false;
  const fin = () => {
    if (fini) return; fini = true; m.enCours--;
    if (!api || res.locals.ralenti) return;   // vague 17 (F85) : un ralentissement volontaire (activité inhabituelle) n'est pas une surcharge
    durees.push([Date.now(), Number(process.hrtime.bigint() - t0) / 1e6]);
    if (durees.length > 20000) durees.splice(0, 5000);
    if (res.statusCode >= 500 && !res.locals.deleste) m.erreurs5xx++;
    if (res.statusCode === 429) m.limitees429++;
  };
  res.on('finish', fin); res.on('close', fin);
  next();
}

/* ---------- Middleware 2 : délestage, file équitable par IP, délai maximal ---------- */
const MESSAGES = {
  deleste: 'Forte affluence : cette partie est en pause quelques instants pour garder l’essentiel disponible (alertes, état des services, demandes). Réessayez dans un moment.',
  ip: 'Beaucoup de demandes arrivent en même temps depuis votre connexion. Patientez quelques secondes puis réessayez.',
  delai: 'Le serveur met plus de temps que prévu à répondre. Votre demande n’a pas été perdue de vue : réessayez dans quelques secondes.'
};
const attente = (base) => Math.round(base * (0.75 + Math.random() * 0.5));   // gigue : les navigateurs ne reviennent pas tous ensemble
function refuser(res, type, secondes) {
  if (res.headersSent) return;
  res.locals.deleste = true;
  res.setHeader('Retry-After', String(secondes));
  res.setHeader('Cache-Control', 'no-store');
  res.status(503).json({ ok: false, erreur: MESSAGES[type], degrade: true, niveau: niveau(), reessayerDans: secondes });
}
const files = new Map();   // ip → { actifs, file: [] }
function liberer(ip) {
  const e = files.get(ip); if (!e) return;
  e.actifs = Math.max(0, e.actifs - 1);
  while (e.file.length && e.actifs < CONFIG.parIp) {
    const x = e.file.shift();
    clearTimeout(x.minuterie);
    if (x.res.writableEnded || x.res.destroyed) continue;
    e.actifs++; x.lancer();
  }
  if (!e.actifs && !e.file.length) files.delete(ip);
}
function proteger(req, res, next) {
  const c = classe(req);
  if (c === 'page') return next();   // pages, scripts, styles : servis depuis la mémoire, jamais délestés
  const n = niveau();
  if ((c === 'lourd' && rang(n) >= 1) || (c === 'secondaire' && rang(n) >= 2)) {
    const chemin = req.path.replace(/\/(NT|OFF|CON|IDE|COM)-[\w-]+/g, '/:id');
    m.delestees++; m.parChemin.set(chemin, (m.parChemin.get(chemin) || 0) + 1);
    if (m.parChemin.size > 200) m.parChemin.clear();
    return refuser(res, 'deleste', attente(n === 'critique' ? 30 : 15));
  }
  // délai maximal : une réponse claire plutôt qu'une attente sans fin
  res.setTimeout(CONFIG.delaiMax, () => { m.expirees++; refuser(res, 'delai', attente(10)); });
  const ip = req.ip || 'inconnue';
  let e = files.get(ip);
  if (!e) { e = { actifs: 0, file: [] }; files.set(ip, e); }
  let libere = false;
  const lancer = () => { const fin = () => { if (!libere) { libere = true; liberer(ip); } }; res.on('finish', fin); res.on('close', fin); next(); };
  if (e.actifs < CONFIG.parIp) { e.actifs++; return lancer(); }
  if (e.file.length >= CONFIG.fileParIp) { m.refusIp++; return refuser(res, 'ip', attente(5)); }
  const x = { res, lancer, minuterie: null };
  x.minuterie = setTimeout(() => { const i = e.file.indexOf(x); if (i >= 0) e.file.splice(i, 1); m.refusIp++; refuser(res, 'ip', attente(5)); }, CONFIG.attenteMax);
  if (c === 'essentiel') { const i = e.file.findIndex((y) => !y.essentiel); x.essentiel = true; e.file.splice(i < 0 ? e.file.length : i, 0, x); }
  else e.file.push(x);
}

/* ---------- Middleware 3 : mémoïsation des lectures chaudes (monté après le chargement du profil et les filtres) ---------- */
let versionExterne = 0;
const version = () => `${docs.version ? docs.version() : 0}:${versionExterne}`;
const MEMO = [
  { test: (r) => r.path === '/api/etat', ttl: 10000 },
  { test: (r) => r.path === '/api/officiels', ttl: 5000 },
  { test: (r) => r.path === '/api/demandes/publiques', ttl: 10000 },
  { test: (r) => r.path === '/api/associations', ttl: 30000 },
  { test: (r) => r.path === '/api/avis-services/resume', ttl: 30000 },
  { test: (r) => r.path === '/api/charge', ttl: 1000, public: true }
];
const memoire = new Map();
function memo(req, res, next) {
  if (!req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') {   // toute écriture réussie invalide les lectures mémorisées (en plus du numéro de version des documents)
    res.on('finish', () => { if (res.statusCode < 400) versionExterne++; });
    return next();
  }
  const regle = CONFIG.cache && MEMO.find((r) => r.test(req));
  if (!regle) return next();
  const gz = /\bgzip\b/.test(String(req.headers['accept-encoding'] || '')) ? 1 : 0;
  const qui = regle.public ? '*' : req.user ? `${req.user.id}:${req.user.role}` : 'visiteur';
  const cle = `${req.path}|${qui}|${gz}`;   // les règles testent req.path : la query ne doit pas multiplier les entrées
  const v = version();
  const e = memoire.get(cle);
  if (e && e.v === v && Date.now() - e.t < regle.ttl) {
    m.cacheHits++;
    res.setHeader('Content-Type', e.type);
    if (e.enc) { res.setHeader('Content-Encoding', e.enc); res.setHeader('Vary', 'Accept-Encoding'); }
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Content-Length', e.corps.length);
    return res.end(e.corps);
  }
  m.cacheMiss++;
  res.setHeader('X-Cache', 'MISS');
  const send = res.send;
  res.send = function (corps) {
    res.send = send;
    if (res.statusCode === 200 && corps != null && !res.locals.deleste) {
      const buf = Buffer.isBuffer(corps) ? corps : Buffer.from(typeof corps === 'string' ? corps : JSON.stringify(corps));
      memoire.delete(cle);
      memoire.set(cle, { v, t: Date.now(), corps: buf, enc: res.getHeader('Content-Encoding') || '', type: res.getHeader('Content-Type') || 'application/json; charset=utf-8' });
      if (memoire.size > 1500) memoire.delete(memoire.keys().next().value);
    }
    return send.call(this, corps);
  };
  next();
}

/* ---------- Lecture et pilotage ---------- */
function etatPublic() {
  const n = niveau();
  return { niveau: n, degrade: n !== 'normal', force: !!(force && force.jusqu > Date.now()), depuis: new Date(force && force.jusqu > Date.now() ? force.depuis : autoDepuis).toISOString(),
    message: n === 'normal' ? '' : 'Forte affluence : l’essentiel reste disponible.', reessayerDans: n === 'critique' ? 30 : n === 'forte' ? 15 : 0 };
}
function details() {
  const r60 = latences(60000), r10 = latences(10000);
  const mem = process.memoryUsage();
  const total = m.cacheHits + m.cacheMiss;
  return Object.assign(etatPublic(), {
    auto, forceJusqu: force && force.jusqu > Date.now() ? new Date(force.jusqu).toISOString() : null, forcePar: force ? force.par : '',
    boucle: { ...m.lag, maxDepuisDemarrage: m.lagMax }, enCours: m.enCours, enCoursMax: m.enCoursMax,
    file: [...files.values()].reduce((s, e) => s + e.file.length, 0),
    requetes: { total: m.total, parSeconde: Math.round(r10.n / 10), api60s: r60.n }, latence: { s60: r60, s10: r10 },
    delestees: m.delestees, refusIp: m.refusIp, expirees: m.expirees, erreurs5xx: m.erreurs5xx, limitees429: m.limitees429,
    parChemin: [...m.parChemin.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([chemin, n]) => ({ chemin, n })),
    cache: { actif: CONFIG.cache, hits: m.cacheHits, miss: m.cacheMiss, taux: total ? Math.round((100 * m.cacheHits) / total) : 0, entrees: memoire.size },
    memoire: { rssMo: Math.round(mem.rss / 1048576), tasMo: Math.round(mem.heapUsed / 1048576) }, depuisDemarrage: Math.round((Date.now() - m.demarre) / 1000),
    seuils: { lagForte: CONFIG.lagForte, lagCritique: CONFIG.lagCritique, enCoursForte: CONFIG.enCoursForte, enCoursCritique: CONFIG.enCoursCritique, parIp: CONFIG.parIp, delaiMax: CONFIG.delaiMax },
    classes: { essentiel: ['connexion', 'état de la plateforme', 'état des services', 'alertes et messages officiels', 'déposer une demande', 'notifications', 'version simple', 'pages et fichiers'],
      lourd: ['diagnostic de sobriété', 'indicateurs', 'flux Webcup', 'exports', 'journaux'], secondaire: ['soutiens', 'participation', 'avis', 'demandes semblables', 'contributions', 'récapitulatifs'] },
    historique
  });
}

const exiger = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ erreur: 'Connexion requise.' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ erreur: 'Accès refusé pour votre profil.' });
  next();
};
router.get('/api/charge', (req, res) => { res.set('Cache-Control', 'no-store'); res.json(etatPublic()); });
router.get('/api/charge/details', exiger('agent', 'admin'), (req, res) => { res.set('Cache-Control', 'no-store'); res.json(details()); });
router.post('/api/charge/forcer', exiger('admin'), (req, res) => {
  const b = req.body || {};
  const avant = force && force.jusqu > Date.now() ? force.niveau : 'auto';
  if (b.mode === 'auto') force = null;
  else if (b.mode === 'forte' || b.mode === 'critique') {
    const minutes = Math.max(1, Math.min(120, Math.round(Number(b.minutes) || 15)));
    force = { niveau: b.mode, jusqu: Date.now() + minutes * 60000, depuis: Date.now(), par: `${req.user.prenom} ${req.user.nom}` };
  } else return res.status(400).json({ erreur: 'Mode inconnu : auto, forte ou critique.' });
  versionExterne++;
  audit(req.user, { categorie: 'plateforme', action: b.mode === 'auto' ? 'Retour au mode automatique' : 'Mode dégradé forcé', objetId: 'charge', objetLibelle: 'État de la plateforme',
    avant, apres: b.mode === 'auto' ? 'auto' : `${b.mode} (${Math.round((force.jusqu - Date.now()) / 60000)} min)`, motif: String(b.motif || '').slice(0, 200) || 'Démonstration de la tenue en charge' });
  res.json(details());
});

// Pour les tests et le serveur : délai maximal des connexions HTTP
function regler(serveur) {
  if (!serveur || typeof serveur !== 'object') return;
  try { serveur.requestTimeout = 30000; serveur.headersTimeout = 20000; serveur.keepAliveTimeout = 5000; } catch { /* serveur géré par Passenger */ }
}

module.exports = { mesurer, proteger, memo, router, regler, niveau, details, classe };
