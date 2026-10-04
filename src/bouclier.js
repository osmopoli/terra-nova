/* Terra Nova — bouclier de sécurité (F69, Centre de sécurité numérique)
   Durcissement réel, sans rien compliquer pour l'habitant :
   - en-têtes de sécurité stricts : CSP limitée aux CDN réellement utilisés (Shoelace, Phosphor, polices, QR code),
     scripts en ligne autorisés un par un par empreinte SHA-256 calculée au démarrage, anti-cadre, nosniff,
     Referrer-Policy, Permissions-Policy, isolation de fenêtre, HSTS en production ;
   - anti-CSRF : toute écriture de l'API doit venir de Terra Nova elle-même (Sec-Fetch-Site / Origin) et être du JSON ;
   - limitation de débit par adresse IP : connexion, inscription, actions sensibles, écritures ;
   - validation stricte des données reçues (taille, profondeur, clés interdites, photos) ;
   - filtrage des réponses : jamais d'empreinte de mot de passe ; dossier administratif et téléphone d'un autre
     habitant jamais transmis (masqués) — seul l'accès motivé d'un agent habilité les révèle (F70) ;
   - journal des tentatives bloquées (collection « bouclier ») consultable par l'administrateur. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { docs, uid, maintenant } = require('./donnees');
const { illisible } = require('./chiffrement');   // valeur restée chiffrée (clé absente ou différente)

const PROD = process.env.NODE_ENV === 'production';
const ECRITURE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/* ---------- Journal des tentatives bloquées ---------- */
// IP tronquée (donnée personnelle minimisée) : 203.0.113.x / 2001:db8:85a3:…
const ipMasquee = (ip = '') => { const v = String(ip).replace(/^::ffff:/, ''); return v.includes(':') ? v.split(':').slice(0, 3).join(':') + ':…' : v.split('.').slice(0, 3).join('.') + '.x'; };
const derniers = new Map();   // anti-inondation du journal : une entrée par (type, IP, chemin) et par minute
function bloquer(req, res, statut, type, message, detail, extra) {
  res.locals.bloque = true;
  const cle = `${type}|${req.ip}|${req.path}`;
  const t = Date.now();
  if ((derniers.get(cle) || 0) < t - 60000) {
    derniers.set(cle, t);
    docs.put('bouclier', { id: uid('blq'), date: maintenant(), type, methode: req.method, chemin: req.path.slice(0, 120), ip: ipMasquee(req.ip),
      compte: req.user ? req.user.email : '', detail: String(detail || '').slice(0, 200) });
    if (derniers.size > 5000) derniers.clear();
  }
  return res.status(statut).json(Object.assign({ ok: false, erreur: message, protection: type }, extra || {}));
}
setInterval(() => { const lim = Date.now() - 120000; for (const [k, v] of derniers) if (v < lim) derniers.delete(k); }, 60000).unref();

/* ---------- En-têtes de sécurité ---------- */
// Empreintes des scripts en ligne et des gestionnaires d'attributs (onload des polices) des pages publiques
function empreintesEnLigne(racine) {
  const h = new Set();
  const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
  for (const f of fs.readdirSync(racine).filter((x) => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(racine, f), 'utf8');
    for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) h.add(sha(m[1].replace(/\r\n?/g, '\n')));   // le navigateur normalise les fins de ligne avant l'empreinte
    for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/g)) h.add(sha(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')));
  }
  return [...h];
}
const CDN_SCRIPTS = ['https://cdn.jsdelivr.net', 'https://unpkg.com', 'https://cdnjs.cloudflare.com'];
function politique(racine) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...CDN_SCRIPTS, "'unsafe-hashes'", ...empreintesEnLigne(racine)],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
    'img-src': ["'self'", 'data:', 'blob:', 'https://cdn.jsdelivr.net'],
    'connect-src': ["'self'", 'data:', 'https://cdn.jsdelivr.net'],   // data: : icônes système de Shoelace
    'media-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"]
  };
  if (PROD) directives['upgrade-insecure-requests'] = [];
  return Object.entries(directives).map(([k, v]) => [k, ...v].join(' ')).join('; ');
}
const PERMISSIONS = 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), serial=(), bluetooth=(), hid=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=(), display-capture=(), browsing-topics=(), publickey-credentials-get=(self), publickey-credentials-create=(self)';

function entetes(racine) {
  let csp = politique(racine), calculee = Date.now();
  return (req, res, next) => {
    if (!PROD && Date.now() - calculee > 5000) { csp = politique(racine); calculee = Date.now(); }   // en local : pages modifiées prises en compte
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', PERMISSIONS);
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Origin-Agent-Cluster', '?1');
    if (PROD && req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    next();
  };
}

/* ---------- Anti-CSRF : écritures uniquement depuis Terra Nova, en JSON ---------- */
function antiCsrf(req, res, next) {
  if (!ECRITURE.has(req.method) || !req.path.startsWith('/api/')) return next();
  const site = String(req.get('sec-fetch-site') || '');
  if (site && site !== 'same-origin' && site !== 'none') return bloquer(req, res, 403, 'csrf', 'Requête refusée : elle ne vient pas de Terra Nova.', `Sec-Fetch-Site: ${site}`);
  const origine = req.get('origin');
  if (origine) {
    let hote = '';
    try { hote = new URL(origine).host; } catch { /* origine illisible */ }
    const attendus = [req.get('host')];
    if (process.env.ORIGINE) try { attendus.push(new URL(process.env.ORIGINE).host); } catch { /* ignorée */ }
    if (!hote || !attendus.includes(hote)) return bloquer(req, res, 403, 'csrf', 'Requête refusée : elle ne vient pas de Terra Nova.', `Origin: ${origine.slice(0, 80)}`);
  }
  const longueur = Number(req.get('content-length') || 0);
  if ((longueur > 0 || req.get('transfer-encoding')) && !req.is('application/json')) return bloquer(req, res, 415, 'csrf', 'Format de requête refusé.', `Content-Type: ${String(req.get('content-type') || '').slice(0, 60)}`);
  next();
}

/* ---------- Limitation de débit (fenêtre glissante, en mémoire, par IP) ---------- */
const REGLES = [
  { nom: 'connexion', max: 20, fenetre: 60e3, test: (r) => r.method === 'POST' && /^\/api\/auth\/(connecter|code|cle)$/.test(r.path) },
  { nom: 'inscription', max: 8, fenetre: 10 * 60e3, test: (r) => r.method === 'POST' && /^\/api\/(auth\/inscrire|accueil\/inscrire)$/.test(r.path) },
  { nom: 'sensible', max: 20, fenetre: 60e3, test: (r) => ECRITURE.has(r.method) && /^\/api\/(auth\/(verifier|mot-de-passe|supprimer|debloquer)|securite\/|sensible\/|habilitations|accueil\/code)/.test(r.path) },
  { nom: 'guichet', max: 400, fenetre: 10 * 60e3, test: (r) => r.method === 'POST' && r.path === '/api/accueil/agent/inscrire' },
  { nom: 'recherche', max: 120, fenetre: 60e3, test: (r) => (r.method === 'GET' && r.path === '/api/recherche') || (r.method === 'POST' && /^\/api\/(orientation(\/suggestions|\/avis)?|explications)$/.test(r.path)) },   // vague 18 : recherche, assistant, avis, explications (tables anonymes)
  { nom: 'ecriture', max: 300, fenetre: 60e3, test: (r) => ECRITURE.has(r.method) && r.path.startsWith('/api/') }
];
const compteurs = new Map();   // "règle|ip" → horodatages
function limiteur(req, res, next) {
  const regle = REGLES.find((r) => r.test(req));
  if (!regle) return next();
  const cle = `${regle.nom}|${req.ip}`;
  const t = Date.now();
  const l = (compteurs.get(cle) || []).filter((x) => x > t - regle.fenetre);
  if (l.length >= regle.max) {
    const attente = Math.max(1, Math.ceil((l[0] + regle.fenetre - t) / 1000));
    res.setHeader('Retry-After', String(attente));
    return bloquer(req, res, 429, 'debit', `Trop de tentatives en peu de temps. Par sécurité, réessayez dans ${attente < 90 ? attente + ' secondes' : Math.ceil(attente / 60) + ' minutes'}.`, `règle « ${regle.nom} » (${regle.max} en ${regle.fenetre / 60000} min)`, { reessayerDans: attente });
  }
  l.push(t);
  compteurs.set(cle, l);
  next();
}
setInterval(() => { const t = Date.now(); for (const [k, l] of compteurs) if (!l.length || l[l.length - 1] < t - 15 * 60e3) compteurs.delete(k); }, 60000).unref();

/* ---------- Validation des données reçues ---------- */
const CLES_INTERDITES = new Set(['__proto__', 'constructor', 'prototype']);
const PHOTO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
function controler(v, cle, profondeur) {
  if (profondeur > 8) return 'structure trop profonde';
  if (typeof v === 'string') {
    if (cle === 'photo') return v === '' || (v.length <= 400000 && PHOTO.test(v)) ? '' : 'photo invalide';
    if (v.length > 5000) return `texte trop long (${cle})`;
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v)) return `caractères de contrôle (${cle})`;
    return '';
  }
  if (Array.isArray(v)) {
    if (v.length > 5000) return 'liste trop longue';
    for (const x of v) { const e = controler(x, cle, profondeur + 1); if (e) return e; }
    return '';
  }
  if (v && typeof v === 'object') {
    const cles = Object.keys(v);
    if (cles.length > 200) return 'trop de champs';
    for (const k of cles) {
      if (CLES_INTERDITES.has(k) || k.length > 60) return `champ interdit (${k.slice(0, 30)})`;
      const e = controler(v[k], k, profondeur + 1); if (e) return e;
    }
  }
  return '';
}
function validation(req, res, next) {
  if (!ECRITURE.has(req.method) || !req.path.startsWith('/api/')) return next();
  const longueur = Number(req.get('content-length') || 0);
  const gros = /^\/api\/docs\/(demandes|notifications)/.test(req.path);   // photo de signalement, envoi groupé d'alertes
  if (longueur > (gros ? 1024 * 1024 : 128 * 1024)) return bloquer(req, res, 413, 'validation', 'Données trop volumineuses.', `${longueur} octets`);
  const e = controler(req.body, 'corps', 0);
  if (e) return bloquer(req, res, 400, 'validation', 'Données refusées : format inattendu.', e);
  next();
}

/* ---------- Filtrage des réponses (aucun secret, F70 : champs réservés) ---------- */
const SECRETS = new Set(['password_hash', 'motdepasse', 'motdepasseDemo', 'mdp', 'codeProvisoireClair']);
const masquerTel = (t) => { const c = String(t || '').replace(/\D/g, ''); return c.length < 4 ? '••' : c.slice(0, 2) + ' •• •• •• ' + c.slice(-2); };
function filtrer(o, req, res, profondeur) {
  if (!o || typeof o !== 'object' || profondeur > 6) return;
  if (Array.isArray(o)) { for (const x of o) filtrer(x, req, res, profondeur + 1); return; }
  for (const k of Object.keys(o)) if (SECRETS.has(k)) delete o[k];
  const profil = typeof o.id === 'string' && o.id.startsWith('usr-') && 'prenom' in o;
  if (profil) {   // valeur restée chiffrée (clé de chiffrement absente ou différente) : rien d'exploitable en sortie
    if (illisible(o.telephone)) { o.telephone = ''; o.telephoneIllisible = true; }
    if (illisible(o.dossier)) o.dossier = null;
  }
  if (profil && !res.locals.reveler) {
    const moi = req.user && req.user.id === o.id;
    const staff = req.user && (req.user.role === 'agent' || req.user.role === 'admin');
    if ('dossier' in o) {
      if (staff && o.dossier && typeof o.dossier === 'object') o.dossierProtege = Object.keys(o.dossier).filter((k) => o.dossier[k] !== '' && o.dossier[k] != null);
      delete o.dossier;
    }
    if (o.telephone && !moi) { o.telephone = masquerTel(o.telephone); o.telephoneMasque = true; }
  }
  for (const k of Object.keys(o)) if (o[k] && typeof o[k] === 'object') filtrer(o[k], req, res, profondeur + 1);
}
function filtreReponses(req, res, next) {
  if (!req.path.startsWith('/api/')) return next();
  const json = res.json.bind(res);
  res.json = (obj) => { try { filtrer(obj, req, res, 0); } catch (e) { console.error('[bouclier] filtrage', e); } return json(obj); };
  next();
}

// Accès refusés (403) : visibles dans le journal du bouclier
function journalRefus(req, res, next) {
  res.on('finish', () => {
    if (res.statusCode === 403 && !res.locals.bloque && /^\/api(\.php|\/(docs|sensible|habilitations|accueil\/agent|webcup|indicateurs|demo|bouclier|contributions|officiels|associations|avis-services|demandes\/|partenaires|mobilite|usage\/|veille-securite))/.test(req.path)) {   // vague 20 : partenaires, mobilité, usage, veille
      docs.put('bouclier', { id: uid('blq'), date: maintenant(), type: 'acces', methode: req.method, chemin: req.path.slice(0, 120), ip: ipMasquee(req.ip), compte: req.user ? req.user.email : '', detail: 'accès refusé par les règles de rôle' });
    }
  });
  next();
}

/* Montage : avant(racine) avant la lecture du corps JSON, apres après le chargement de l'utilisateur */
const avant = (racine) => [entetes(racine), antiCsrf, limiteur];
const apres = [validation, filtreReponses, journalRefus];

// Liste lisible des protections actives (page Sécurité, Centre de sécurité)
const protections = () => ({
  entetes: ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'Cross-Origin-Opener-Policy'].concat(PROD ? ['Strict-Transport-Security'] : []),
  hsts: PROD, regles: REGLES.map((r) => ({ nom: r.nom, max: r.max, minutes: r.fenetre / 60000 })),
  chiffrement: 'AES-256-GCM', cleEnv: !!process.env.DATA_ENCRYPTION_KEY
});

module.exports = { avant, apres, bloquer, ipMasquee, masquerTel, protections, journalRefus };
