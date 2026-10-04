/* Terra Nova — vague 16 : formulaires protégés (F81) et envois sans doublon (F82).
   F81 (Centre de cybersécurité) : protection « invisible d'abord » de tous les formulaires publics (demande, contact, signalement,
   démarche, inscription, idées, avis, avis sur un service, soutien, message à la mairie, question sur les données) :
   - champ piège invisible (ni visible, ni atteignable au clavier, ignoré des lecteurs d'écran et du remplissage automatique) ;
   - jeton signé (HMAC) remis avec le formulaire : nonce propre à chaque formulaire, heure d'émission → temps de remplissage minimal ;
   - signaux de comportement (touches, clics, saisies, collages, remplissage automatique), jamais de traçage ;
   - suspect → petite vérification humaine accessible (même question que la connexion F37, vérifiée par le serveur) ;
   - robot évident (piège rempli, jeton falsifié, rafale d'envois suspects) → refus + journal du bouclier, catégorie « robot ».
   F82 (Citoyen) : clé d'idempotence par envoi (en-tête Idempotency-Key) gardée 24 h → un renvoi rend le MÊME résultat
   (même numéro, même accusé) ; demande presque identique du même habitant en peu de temps → « Vous avez déjà envoyé
   cette demande (NT-xxxx) il y a 2 minutes », avec la possibilité d'envoyer quand même (en-tête X-TN-Confirmer: doublon). */
const router = require('express').Router();
const crypto = require('node:crypto');
const db = require('../db');
const { docs } = require('../donnees');
const { deriver } = require('../chiffrement');
const A = require('../auth');
const bouclier = require('../bouclier');

db.exec(`
CREATE TABLE IF NOT EXISTS formulaires_nonces (nonce TEXT PRIMARY KEY, expire INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS idempotence (cle TEXT PRIMARY KEY, statut INTEGER NOT NULL, corps TEXT NOT NULL, expire INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS robots_stats (jour TEXT NOT NULL, cle TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (jour, cle));
`);
const q = {
  nonce: db.prepare('SELECT 1 FROM formulaires_nonces WHERE nonce = ?'),
  consommer: db.prepare('INSERT OR IGNORE INTO formulaires_nonces (nonce, expire) VALUES (?, ?)'),
  idem: db.prepare('SELECT statut, corps, expire FROM idempotence WHERE cle = ?'),
  idemPut: db.prepare('INSERT OR REPLACE INTO idempotence (cle, statut, corps, expire) VALUES (?, ?, ?, ?)'),
  stat: db.prepare('INSERT INTO robots_stats (jour, cle, n) VALUES (?, ?, 1) ON CONFLICT(jour, cle) DO UPDATE SET n = n + 1'),
  stats: db.prepare('SELECT jour, cle, n FROM robots_stats WHERE jour >= ? ORDER BY jour'),
  menage: [db.prepare('DELETE FROM formulaires_nonces WHERE expire < ?'), db.prepare('DELETE FROM idempotence WHERE expire < ?')]
};
setInterval(() => { const t = Date.now(); q.menage.forEach((m) => m.run(t)); }, 10 * 60e3).unref();

const SECRET = deriver('formulaires-v16');
const signer = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('base64url').slice(0, 27);
const egal = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const jour = (t) => new Date(t || Date.now()).toISOString().slice(0, 10);
const compter = (cle) => { try { q.stat.run(jour(), String(cle).slice(0, 60)); } catch (e) { console.error('[formulaires] stats', e.message); } };

const DELAI_MIN = 3000;              // en dessous : remplissage trop rapide pour une personne → vérification
const VALIDITE = 4 * 3600e3;         // un formulaire ouvert plus de 4 h demande une vérification (jeton expiré)
const IDEM_DUREE = 24 * 3600e3;      // une clé d'idempotence est retenue 24 h
const DOUBLON_FENETRE = 15 * 60e3;   // demande presque identique du même habitant : 15 min

/* ---------- Formulaires protégés (POST uniquement) ---------- */
const PROTEGES = [
  { re: /^\/api\/docs\/demandes$/, nom: 'demande', doublon: true },
  { re: /^\/api\/contributions$/, nom: 'contribution' },
  { re: /^\/api\/auth\/inscrire$/, nom: 'inscription' },
  { re: /^\/api\/accueil\/inscrire$/, nom: 'inscription-sans-email' },
  { re: /^\/api\/idees$/, nom: 'idee' },
  { re: /^\/api\/consultations\/[^/]+\/avis$/, nom: 'avis-consultation' },
  { re: /^\/api\/avis-services$/, nom: 'avis-service' },
  { re: /^\/api\/demandes\/[^/]+\/soutenir$/, nom: 'soutien' },
  { re: /^\/api\/demandes\/[^/]+\/messages$/, nom: 'message-habitant' }
];
const regleDe = (req) => (req.method === 'POST' ? PROTEGES.find((r) => r.re.test(req.path)) : null);

/* ---------- Jeton signé du formulaire ---------- */
const nomForm = (f) => (String(f || 'page').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'page');
function emettre(f) {
  const base = `v1.${nomForm(f)}.${Date.now()}.${crypto.randomBytes(9).toString('base64url')}`;
  return `${base}.${signer(base)}`;
}
function lireJeton(j) {
  const p = String(j || '').split('.');
  if (p.length !== 5 || p[0] !== 'v1') return { valide: false };
  return { f: p[1], t: Number(p[2]), n: p[3], valide: egal(signer(p.slice(0, 4).join('.')), p[4]) };
}

/* ---------- Vérification humaine (même question que la connexion F37, mais vérifiée par le serveur) ---------- */
function defi() {
  const a = 1 + crypto.randomInt(9), b = 1 + crypto.randomInt(9);
  const base = `d1.${Date.now() + 15 * 60e3}.${crypto.randomBytes(9).toString('base64url')}`;
  return { jeton: `${base}.${signer(base + '|' + (a + b))}`, a, b };
}
function verifierDefi(entete) {
  const v = String(entete || '');
  const i = v.lastIndexOf(':');
  if (i < 0) return 'absent';
  const p = v.slice(0, i).split('.'), rep = parseInt(v.slice(i + 1), 10);
  if (p.length !== 4 || p[0] !== 'd1' || !Number.isFinite(rep)) return 'faux';
  if (Number(p[1]) < Date.now() || q.nonce.get('d:' + p[2])) return 'faux';
  if (!egal(signer(`d1.${p[1]}.${p[2]}|${rep}`), p[3])) return 'faux';
  q.consommer.run('d:' + p[2], Number(p[1]));
  return 'ok';
}

// Signaux de comportement envoyés par le navigateur : « k=3;p=2;i=5;f=2;c=0;a=0;cl=1;d=12000 »
function signaux(entete) {
  if (!entete) return null;
  const s = {};
  String(entete).split(';').forEach((x) => { const [k, v] = x.split('='); if (/^[a-z]{1,2}$/.test(k)) s[k] = Math.max(0, Math.min(1e7, Number(v) || 0)); });
  s.total = ['k', 'p', 'i', 'f', 'c', 'a', 'cl'].reduce((n, k) => n + (s[k] || 0), 0);
  return s;
}

/* ---------- Friction progressive par adresse IP (en mémoire) ---------- */
const suspects = new Map();   // ip → { robots: [t], echecs: [t], pause: t }
const PAUSE = 5 * 60e3, FENETRE = 10 * 60e3;
function etatIp(ip) {
  const t = Date.now();
  const e = suspects.get(ip) || { robots: [], echecs: [], pause: 0 };
  e.robots = e.robots.filter((x) => x > t - FENETRE); e.echecs = e.echecs.filter((x) => x > t - FENETRE);
  suspects.set(ip, e);
  if (suspects.size > 5000) suspects.clear();
  return e;
}
setInterval(() => { const t = Date.now(); for (const [k, e] of suspects) if (e.pause < t && !e.robots.some((x) => x > t - FENETRE) && !e.echecs.some((x) => x > t - FENETRE)) suspects.delete(k); }, 60e3).unref();

const RAISONS = {
  'jeton-absent': 'formulaire sans jeton', 'jeton-expire': 'formulaire ouvert depuis trop longtemps', 'trop-rapide': 'rempli trop vite',
  'jeton-rejoue': 'jeton déjà utilisé', 'signaux-absents': 'aucun signal du navigateur', 'aucune-interaction': 'aucune interaction (clavier, souris, saisie)'
};

function evaluer(req) {
  if (String(req.get('x-tn-piege') || '').trim()) return { robot: 'piege', detail: 'champ invisible rempli' };
  const brut = req.get('x-tn-jeton');
  const raisons = [];
  let jeton = null;
  if (!brut) raisons.push('jeton-absent');
  else {
    jeton = lireJeton(brut);
    if (!jeton.valide) return { robot: 'jeton-falsifie', detail: 'jeton de formulaire falsifié' };
    const age = Date.now() - jeton.t;
    if (!(age >= 0) || age > VALIDITE) raisons.push('jeton-expire');
    else if (age < DELAI_MIN) raisons.push('trop-rapide');
    if (q.nonce.get('f:' + jeton.n)) raisons.push('jeton-rejoue');
  }
  const s = signaux(req.get('x-tn-signaux'));
  if (!s) raisons.push('signaux-absents');
  else if (s.total === 0) raisons.push('aucune-interaction');
  return { raisons, jeton };
}

/* ---------- F82 : demande presque identique du même habitant ---------- */
const recentsVisiteurs = new Map();   // numéro de demande → IP (visiteurs sans compte, en mémoire)
const motsDe = (d) => new Set(require('./doublons')._jetons(`${d.objet || ''} ${d.message || ''}`));
const brutDe = (d) => String(`${d.objet || ''} ${d.message || ''}`).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
function proches(a, b) {
  if ((a.type || 'contact') !== (b.type || 'contact') || (a.serviceId || '') !== (b.serviceId || '')) return false;
  if (a.type === 'signalement' && (a.quartier || '') !== (b.quartier || '')) return false;
  if (brutDe(a) === brutDe(b)) return true;
  const x = motsDe(a), y = motsDe(b);
  if (!x.size || !y.size) return false;
  let commun = 0; x.forEach((m) => y.has(m) && commun++);
  return commun / (x.size + y.size - commun) >= 0.75;
}
function doublonDemande(req) {
  const b = req.body;
  if (!b || Array.isArray(b) || typeof b !== 'object') return null;
  const limite = new Date(Date.now() - DOUBLON_FENETRE).toISOString();
  const email = String(b.contactEmail || '').trim().toLowerCase();
  const mien = (d) => (req.user ? d.userId === req.user.id
    : !d.userId && !!email && String(d.contactEmail || '').toLowerCase() === email && recentsVisiteurs.get(d.id) === req.ip);
  return docs.tous('demandes').filter((d) => d.cree >= limite && mien(d) && proches(b, d)).pop() || null;
}
const ilYa = (iso) => { const m = Math.floor((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? 'il y a moins d’une minute' : `il y a ${m} minute${m > 1 ? 's' : ''}`; };

/* ---------- Garde : montée avant les routes de l'API ---------- */
function garde(req, res, next) {
  const regle = regleDe(req);
  if (!regle) return next();
  const staff = A.estPersonnel(req.user);

  // 1. Idempotence : même clé, même habitant, même formulaire → même résultat (aucun doublon créé)
  const cle = String(req.get('idempotency-key') || '');
  const cleOk = /^[A-Za-z0-9._:-]{8,120}$/.test(cle);
  const empreinte = cleOk ? crypto.createHash('sha256').update(`${req.user ? 'u:' + req.user.id : 'ip:' + req.ip}|${req.path}|${cle}`).digest('hex') : '';
  if (empreinte) {
    const r = q.idem.get(empreinte);
    if (r && r.expire > Date.now()) {
      compter('idempotent'); compter('idempotent:' + regle.nom);
      res.set('Idempotency-Replayed', 'true');
      return res.status(r.statut).json(JSON.parse(r.corps));
    }
  }

  // 2. Anti-robots (le personnel connecté n'est pas concerné)
  let jeton = null;
  if (!staff) {
    const ip = req.ip;
    const e = etatIp(ip);
    if (e.pause > Date.now()) {
      const min = Math.ceil((e.pause - Date.now()) / 60000);
      res.setHeader('Retry-After', String(Math.ceil((e.pause - Date.now()) / 1000)));
      compter('refus:pause'); compter('refus-form:' + regle.nom);
      return bouclier.bloquer(req, res, 429, 'robot', `Trop d’envois suspects depuis votre connexion. Par sécurité, réessayez dans ${min} minute${min > 1 ? 's' : ''}.`, `pause anti-robots · formulaire « ${regle.nom} »`);
    }
    const ev = evaluer(req);
    if (ev.robot) {
      e.robots.push(Date.now());
      if (e.robots.length >= 3) e.pause = Date.now() + PAUSE;
      compter('refus:' + ev.robot); compter('refus-form:' + regle.nom);
      return bouclier.bloquer(req, res, 400, 'robot', 'Envoi refusé : il ressemble à un envoi automatique. Si vous êtes une personne, rechargez la page puis réessayez.', `${ev.detail} · formulaire « ${regle.nom} »`);
    }
    if (ev.raisons.length) {
      const v = verifierDefi(req.get('x-tn-verification'));
      if (v !== 'ok') {
        if (v === 'faux') { e.echecs.push(Date.now()); if (e.echecs.length >= 5) e.pause = Date.now() + PAUSE; compter('verification-ratee'); }
        ev.raisons.forEach((r) => compter('friction:' + r)); compter('friction-form:' + regle.nom);
        return res.status(428).json({ ok: false, protection: 'verification', verification: defi(), raisons: ev.raisons.map((r) => RAISONS[r] || r),
          erreur: v === 'faux' ? 'Ce n’est pas la bonne réponse. Voici une nouvelle question.' : 'Une petite vérification est demandée avant l’envoi : répondez à la question pour confirmer que vous êtes une personne.' });
      }
      compter('verifie');
    } else compter('accepte');
    jeton = ev.jeton;
  }

  // 3. Demande presque identique envoyée peu avant par la même personne
  if (regle.doublon && String(req.get('x-tn-confirmer') || '') !== 'doublon') {
    const d = doublonDemande(req);
    if (d) {
      compter('doublon');
      return res.status(409).json({ ok: false, doublon: { id: d.id, cree: d.cree, objet: d.objet, minutes: Math.floor((Date.now() - Date.parse(d.cree)) / 60000) },
        erreur: `Vous avez déjà envoyé cette demande (${d.id}) ${ilYa(d.cree)}.` });
    }
  }

  // 4. Après une réponse réussie : jeton consommé, résultat retenu pour la clé d'idempotence
  const json = res.json.bind(res);
  res.json = (obj) => {
    const sortie = json(obj);
    const statut = res.statusCode;
    if (statut >= 200 && statut < 300 && !res.locals.bloque) {
      try {
        if (jeton && jeton.n) q.consommer.run('f:' + jeton.n, jeton.t + VALIDITE + 3600e3);
        if (empreinte) q.idemPut.run(empreinte, statut, JSON.stringify(obj), Date.now() + IDEM_DUREE);
        if (regle.doublon && !req.user && obj && /^NT-/.test(obj.id || '')) { recentsVisiteurs.set(obj.id, req.ip); if (recentsVisiteurs.size > 2000) recentsVisiteurs.delete(recentsVisiteurs.keys().next().value); }
      } catch (e) { console.error('[formulaires] mémorisation', e.message); }
    }
    return sortie;
  };
  next();
}

/* ---------- Routes ---------- */
const emissions = new Map();   // limite douce des jetons : 120 par 10 min et par IP
router.get('/api/formulaires/jeton', (req, res) => {
  const t = Date.now();
  const l = (emissions.get(req.ip) || []).filter((x) => x > t - 10 * 60e3);
  if (l.length >= 120) return bouclier.bloquer(req, res, 429, 'robot', 'Trop de formulaires ouverts en peu de temps. Réessayez dans quelques minutes.', 'rafale de jetons de formulaire');
  l.push(t); emissions.set(req.ip, l);
  if (emissions.size > 5000) emissions.clear();
  res.set('Cache-Control', 'no-store');
  res.json({ jeton: emettre(req.query.f), delaiMinSecondes: DELAI_MIN / 1000 });
});

// Centre de sécurité (administrateur) : envois automatiques bloqués, vérifications, renvois sans doublon
router.get('/api/formulaires/robots', A.exigerRole('admin'), (req, res) => {
  const t = Date.now();
  const lignes = q.stats.all(jour(t - 6 * 864e5));
  const somme = (pred) => lignes.filter(pred).reduce((n, l) => n + l.n, 0);
  const aujourdhui = jour(t);
  const groupe = (prefixe, filtre) => lignes.filter((l) => l.cle.startsWith(prefixe) && (!filtre || filtre(l))).reduce((o, l) => ((o[l.cle.slice(prefixe.length)] = (o[l.cle.slice(prefixe.length)] || 0) + l.n), o), {});
  const parJour = {};
  for (let i = 6; i >= 0; i--) parJour[jour(t - i * 864e5)] = { refus: 0, verifications: 0 };
  lignes.forEach((l) => { const j = parJour[l.jour]; if (!j) return; if (/^refus:/.test(l.cle)) j.refus += l.n; if (/^friction-form:/.test(l.cle)) j.verifications += l.n; });
  const robots = docs.tous('bouclier').filter((b) => b.type === 'robot').reverse();
  res.set('Cache-Control', 'no-store');
  res.json({
    aujourdhui: { refus: somme((l) => l.jour === aujourdhui && /^refus:/.test(l.cle)), verifications: somme((l) => l.jour === aujourdhui && /^friction-form:/.test(l.cle)),
      reussies: somme((l) => l.jour === aujourdhui && l.cle === 'verifie'), acceptes: somme((l) => l.jour === aujourdhui && l.cle === 'accepte') },
    semaine: { refus: somme((l) => /^refus:/.test(l.cle)), verifications: somme((l) => /^friction-form:/.test(l.cle)), reussies: somme((l) => l.cle === 'verifie'),
      ratees: somme((l) => l.cle === 'verification-ratee'), acceptes: somme((l) => l.cle === 'accepte'), renvois: somme((l) => l.cle === 'idempotent'), doublons: somme((l) => l.cle === 'doublon') },
    raisonsRefus: groupe('refus:'), raisonsVerification: groupe('friction:'), formulairesRefus: groupe('refus-form:'), formulairesVerification: groupe('friction-form:'),
    parJour, recents: robots.slice(0, 50), total: robots.length, ipEnPause: [...suspects.values()].filter((e) => e.pause > t).length
  });
});

module.exports = router;
module.exports.garde = garde;
module.exports.emettre = emettre;
