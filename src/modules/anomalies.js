/* Terra Nova — vague 17 (F85, Centre de cybersécurité) : détection d'activité inhabituelle et réponses proportionnées.
   Le serveur observe chaque requête de l'API (sans rien enregistrer de son contenu) et tient deux sortes de repères :
   - habitudes de chaque compte, conservées en base (table comportement_base) : heures de connexion, réseaux (adresse
     tronquée, pays si l'hébergeur le fournit), navigateurs et systèmes utilisés ;
   - fenêtres glissantes en mémoire par compte et par adresse IP : rafales de requêtes, refus 401/403, pages 404 en série,
     échecs de connexion, lectures en masse de données d'autres habitants (données réservées F70, exports nominatifs).
   Chaque signal ajoute des points à un score de risque (30 minutes glissantes). Réponses automatiques, proportionnées :
   - 30 et plus (« à surveiller ») : confirmation du mot de passe exigée pour les actions sensibles (données réservées,
     rôles, exports nominatifs, sauvegardes, réparations…) ; l'habitant reçoit « Activité inhabituelle sur votre compte »
     avec « C'était moi » / « Ce n'était pas moi » ; un incident est ouvert dans le Centre de sécurité ;
   - 60 et plus (« élevé ») : ralentissement temporaire (10 min) des requêtes non essentielles ; administrateurs prévenus ;
   - 85 et plus (« critique ») sur un compte : toutes ses sessions sont fermées (reconnexion obligatoire).
   L'usage normal ne change pas : rien n'est ralenti ni demandé tant que le score reste bas, et l'essentiel (connexion,
   état de la plateforme, dépôt d'une demande, urgences, alertes) n'est jamais ralenti. Seuils réglables par variables
   d'environnement ANOMALIE_*. */
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, journal, notifier, audit, uid, maintenant } = require('../donnees');
const { ipMasquee } = require('../bouclier');
const incidents = require('../incidents');

db.exec('CREATE TABLE IF NOT EXISTS comportement_base (cle TEXT PRIMARY KEY, data TEXT NOT NULL, maj TEXT NOT NULL);');
const qBase = { lire: db.prepare('SELECT data FROM comportement_base WHERE cle = ?'), ecrire: db.prepare('INSERT INTO comportement_base (cle, data, maj) VALUES (?, ?, ?) ON CONFLICT(cle) DO UPDATE SET data = excluded.data, maj = excluded.maj') };

const N = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : d);
const SEUILS = { surveille: N(process.env.ANOMALIE_SEUIL_SURVEILLE, 30), eleve: N(process.env.ANOMALIE_SEUIL_ELEVE, 60), critique: N(process.env.ANOMALIE_SEUIL_CRITIQUE, 85) };
const RAFALE = N(process.env.ANOMALIE_RAFALE_MINUTE, 240);   // requêtes API par minute pour un même compte ou une même adresse
const FENETRE_SCORE = 30 * 60e3, DUREE_RALENTI = 10 * 60e3;

const PARTIES = { connexion: 'Connexion', api: 'API', donnees: 'Données réservées', exports: 'Exports', sauvegardes: 'Sauvegardes', demandes: 'Demandes', comptes: 'Comptes' };
const LIBELLES = {
  refus: 'Nombreux accès refusés (401/403)', introuvables: 'Nombreuses pages ou données introuvables (404)', rafale: 'Rafale de requêtes',
  'echecs-connexion': 'Échecs de connexion répétés', heure: 'Connexion à une heure inhabituelle', reseau: 'Connexion depuis un réseau inhabituel',
  pays: 'Connexion depuis un autre pays', appareil: 'Navigateur ou système inhabituel', lectures: 'Lecture en masse de données d’autres habitants',
  'exports-nominatifs': 'Exports nominatifs répétés', 'pas-moi': 'L’habitant indique que ce n’était pas lui'
};

/* ---------- Sujets suivis (en mémoire) ---------- */
const sujets = new Map();   // 'u:<docId>' | 'ip:<ip>' → { cle, type, libelle, userId, signaux, evts, ralentiJusqu, revoqueLe, niveau, incidentId, alerteLe, mesures }
function sujet(cle, type, libelle, userId) {
  let s = sujets.get(cle);
  if (!s) { s = { cle, type, libelle, userId: userId || null, signaux: [], evts: { req: [], refus: [], nf: [], echecs: [], lectures: new Map(), exports: [] }, ralentiJusqu: 0, niveau: 'normal', mesures: [] }; sujets.set(cle, s); }
  if (libelle) s.libelle = libelle;
  return s;
}
const fenetre = (l, ms) => { const lim = Date.now() - ms; while (l.length && l[0] < lim) l.shift(); return l; };
const score = (s) => { const lim = Date.now() - FENETRE_SCORE; s.signaux = s.signaux.filter((x) => x.t > lim); return s.signaux.reduce((n, x) => n + x.points, 0); };
const niveauDe = (n) => (n >= SEUILS.critique ? 'critique' : n >= SEUILS.eleve ? 'eleve' : n >= SEUILS.surveille ? 'surveille' : 'normal');
const RANG = { normal: 0, surveille: 1, eleve: 2, critique: 3 };
const GRAVITE = { surveille: 'moyenne', eleve: 'haute', critique: 'critique' };
setInterval(() => {   // ménage : sujets calmes depuis 1 h
  const lim = Date.now() - 3600e3;
  for (const [k, s] of sujets) if (!s.signaux.some((x) => x.t > lim) && s.ralentiJusqu < Date.now() && !s.evts.req.some((t) => t > lim)) sujets.delete(k);
  if (sujets.size > 20000) sujets.clear();
}, 5 * 60e3).unref();

// Un signal n'est compté qu'une fois par fenêtre (pas d'emballement du score pour une même rafale)
function signaler(s, code, points, detail, partie, req) {
  const t = Date.now();
  if (s.signaux.some((x) => x.code === code && x.palier === points && t - x.t < 5 * 60e3)) return;
  s.signaux.push({ t, code, points, palier: points, detail: String(detail || '').slice(0, 200), partie: partie || 'api' });
  repondre(s, req, code, detail, partie);
}

/* ---------- Réponses proportionnées ---------- */
function repondre(s, req, code, detail, partie) {
  const avant = s.niveau;
  const n = score(s);
  const niveau = niveauDe(n);
  s.niveau = niveau;
  const parties = [...new Set(s.signaux.map((x) => PARTIES[x.partie] || x.partie))];
  if (niveau === 'normal') return;
  const actions = [];
  if (RANG[niveau] > RANG[avant]) {
    if (RANG[avant] < 1) actions.push('Confirmation du mot de passe exigée pour les actions sensibles');
    if (RANG[niveau] >= 2 && RANG[avant] < 2) { s.ralentiJusqu = Date.now() + DUREE_RALENTI; actions.push('Ralentissement temporaire des requêtes non essentielles (10 min)'); }
    if (niveau === 'critique' && s.type === 'compte' && s.userId) {
      const row = A.parDoc(s.userId);
      if (row) {
        const fermees = db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id).changes;
        s.revoqueLe = Date.now();
        actions.push(`Sessions du compte fermées (${fermees}) : reconnexion obligatoire`);
        notifier(s.userId, 'Votre compte a été protégé', 'Une activité très inhabituelle a été détectée : toutes vos sessions ont été fermées par sécurité. Reconnectez-vous ; si ce n’était pas vous, changez votre mot de passe.', 'compte.html', 'alerte');
        journal('sessions_revoquees', row.email, `score ${n}`);
      }
    } else if (niveau === 'critique') { s.ralentiJusqu = Date.now() + 3 * DUREE_RALENTI; actions.push('Ralentissement prolongé de cette adresse (30 min)'); }
    s.mesures = s.mesures.concat(actions.map((texte) => ({ date: maintenant(), texte }))).slice(-20);
  }
  const inc = incidents.signaler({ cle: 'anomalie:' + s.cle, titre: `Activité inhabituelle · ${s.libelle}`, gravite: GRAVITE[niveau], parties,
    sujet: { type: s.type, libelle: s.libelle, cle: s.cle }, evenement: `${LIBELLES[code] || code}${detail ? ' — ' + detail : ''} (score ${n})`, action: actions.join(' · ') || '' });
  s.incidentId = inc.id;
  if (RANG[niveau] > RANG[avant] && s.type === 'compte' && s.userId && niveau !== 'critique') alerterHabitant(s, req);
}

// « Activité inhabituelle sur votre compte » : une alerte à confirmer (au plus une toutes les 30 min)
function alerterHabitant(s, req) {
  if (s.alerteLe && Date.now() - s.alerteLe < 30 * 60e3) return;
  s.alerteLe = Date.now();
  const raisons = [...new Set(s.signaux.map((x) => x.code))];
  const a = docs.put('activites', { id: uid('act'), userId: s.userId, date: maintenant(), raisons, libelles: raisons.map((r) => LIBELLES[r] || r), statut: 'a_confirmer',
    appareil: req ? familleAppareil(req.headers['user-agent']) : '', reseau: req ? ipMasquee(req.ip) : '', incidentId: s.incidentId || '' });
  notifier(s.userId, 'Activité inhabituelle sur votre compte', `${a.libelles.join(', ')}. Était-ce vous ? Répondez depuis « Alertes » ou la page Sécurité de vos données.`, 'securite.html#activite', 'alerte');
}

/* ---------- Habitudes des comptes (base) ---------- */
const familleAppareil = (ua = '') => {
  const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /curl|wget|python|node|go-http|java/i.test(ua) ? 'Outil automatique' : 'Navigateur';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'système inconnu';
  return `${nav} · ${os}`;
};
const reseauDe = (ip = '') => { const v = String(ip).replace(/^::ffff:/, ''); return v.includes(':') ? v.split(':').slice(0, 3).join(':') : v.split('.').slice(0, 2).join('.') + '.x.x'; };
const paysDe = (req) => String(req.get('cf-ipcountry') || req.get('x-country-code') || req.get('x-pays') || '').toUpperCase().slice(0, 2);
const heureDe = () => Number(new Date().toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: process.env.TZ_VILLE || 'Indian/Mayotte' })) % 24;
const lireBase = (userId) => { const r = qBase.lire.get('u:' + userId); try { return r ? JSON.parse(r.data) : null; } catch { return null; } };
const ecrireBase = (userId, b) => qBase.ecrire.run('u:' + userId, JSON.stringify(b), maintenant());

function apresConnexion(req, profil) {
  const b = lireBase(profil.id) || { connexions: 0, heures: Array(24).fill(0), reseaux: {}, appareils: {}, pays: {} };
  const s = sujet('u:' + profil.id, 'compte', `${profil.prenom} ${profil.nom} (${profil.email})`, profil.id);
  const h = heureDe(), reseau = reseauDe(req.ip), appareil = familleAppareil(req.headers['user-agent']), pays = paysDe(req);
  if (b.connexions >= 8) {
    const voisines = b.heures[h] + b.heures[(h + 23) % 24] + b.heures[(h + 1) % 24];
    if (voisines / b.connexions < 0.03) signaler(s, 'heure', 15, `${h} h (habituellement jamais à cette heure)`, 'connexion', req);
  }
  if (b.connexions >= 3) {
    if (pays && Object.keys(b.pays).length && !b.pays[pays]) signaler(s, 'pays', 25, `pays ${pays}`, 'connexion', req);
    else if (!b.reseaux[reseau]) signaler(s, 'reseau', 15, `réseau ${reseau}`, 'connexion', req);
    if (!b.appareils[appareil]) signaler(s, 'appareil', 10, appareil, 'connexion', req);
  }
  b.connexions++; b.heures[h]++;
  b.reseaux[reseau] = (b.reseaux[reseau] || 0) + 1; b.appareils[appareil] = (b.appareils[appareil] || 0) + 1; if (pays) b.pays[pays] = (b.pays[pays] || 0) + 1;
  for (const k of ['reseaux', 'appareils', 'pays']) { const e = Object.entries(b[k]).sort((x, y) => y[1] - x[1]).slice(0, 20); b[k] = Object.fromEntries(e); }
  ecrireBase(profil.id, b);
}

/* ---------- Actions sensibles : confirmation du mot de passe si le risque est élevé ---------- */
const SENSIBLES = [
  { m: 'POST', re: /^\/api\/sensible\//, partie: 'donnees' }, { m: 'POST', re: /^\/api\/habilitations\//, partie: 'comptes' },
  { m: 'PATCH', re: /^\/api\/docs\/utilisateurs\//, partie: 'comptes', staff: true }, { m: 'POST', re: /^\/api\/services\/[^/]+\/(desactiver|reactiver)$/, partie: 'api' },
  { m: 'POST', re: /^\/api\/exports\/fichier$/, partie: 'exports' }, { m: 'GET', re: /^\/api\/sauvegardes\/[^/]+\/telecharger$/, partie: 'sauvegardes' },
  { m: 'POST', re: /^\/api\/sauvegardes$/, partie: 'sauvegardes' }, { m: 'POST', re: /^\/api\/integrite\/reparer$/, partie: 'donnees' },
  { m: 'POST', re: /^\/api\/demo\/reinitialiser$/, partie: 'api' }, { m: 'POST', re: /^\/api\/auth\/debloquer$/, partie: 'comptes' },
  { m: 'POST', re: /^\/api\/accueil\/agent\/inscrire$/, partie: 'comptes' }, { m: 'POST', re: /^\/api\/auth\/supprimer$/, partie: 'comptes' }
];
const sensible = (req) => SENSIBLES.find((r) => r.m === req.method && r.re.test(req.path) && (!r.staff || A.estPersonnel(req.user)));
function risque(req) {
  const su = req.user ? sujets.get('u:' + req.user.id) : null, si = sujets.get('ip:' + req.ip);
  return Math.max(su ? score(su) : 0, si ? score(si) : 0);
}
const ralenti = (req) => { const t = Date.now(); const su = req.user && sujets.get('u:' + req.user.id), si = sujets.get('ip:' + req.ip); return (su && su.ralentiJusqu > t) || (si && si.ralentiJusqu > t); };
const REAUTH = { ok: false, reauth: true, protection: 'confirmation', erreur: 'Par sécurité, confirmez votre mot de passe pour cette action : une activité inhabituelle a été remarquée.' };
// Utilisé par les routes qui exigent toujours la confirmation (téléchargement d'une sauvegarde, export nominatif)
const exigerConfirmation = (req, res) => { if (A.estVerifie(req)) return true; res.status(428).json(Object.assign({}, REAUTH, { erreur: 'Confirmez votre mot de passe pour cette action sensible.' })); return false; };

/* ---------- Surveillance de chaque requête de l'API (monté après le chargement du profil) ---------- */
const ESSENTIEL = (req) => { try { return require('../charge').classe(req) === 'essentiel'; } catch { return false; } };
function surveiller(req, res, next) {
  if (!req.path.startsWith('/api/') || req.path === '/api/health') return next();
  const cle = req.user ? 'u:' + req.user.id : 'ip:' + req.ip;
  const s = sujet(cle, req.user ? 'compte' : 'ip', req.user ? `${req.user.prenom} ${req.user.nom} (${req.user.email})` : `adresse ${ipMasquee(req.ip)}`, req.user ? req.user.id : null);
  const t = Date.now();
  s.evts.req.push(t);
  if (fenetre(s.evts.req, 60e3).length > RAFALE) signaler(s, 'rafale', 30, `${s.evts.req.length} requêtes en une minute`, 'api', req);

  res.on('finish', () => {
    const c = res.statusCode;
    if ((c === 401 || c === 403) && !res.locals.reauthDemandee) {
      s.evts.refus.push(Date.now());
      const nb = fenetre(s.evts.refus, 5 * 60e3).length;
      if (nb >= 10) signaler(s, 'refus', 30, `${nb} accès refusés en 5 minutes`, /sensible|habilitations/.test(req.path) ? 'donnees' : 'api', req);
      if (nb >= 25) signaler(s, 'refus', 25, `${nb} accès refusés en 5 minutes`, 'api', req);
      if (nb >= 50) signaler(s, 'refus', 35,`${nb} accès refusés en 5 minutes`, 'api', req);
    }
    if (c === 404) {
      s.evts.nf.push(Date.now());
      const nb = fenetre(s.evts.nf, 5 * 60e3).length;
      if (nb >= 20) signaler(s, 'introuvables', 25, `${nb} adresses introuvables en 5 minutes`, /demandes|suivi|accuse/.test(req.path) ? 'demandes' : 'api', req);
    }
    if (c === 200 && req.method === 'POST' && /^\/api\/sensible\/[^/]+$/.test(req.path)) {
      const l = s.evts.lectures; l.set(req.path.split('/').pop(), Date.now());
      for (const [k, v] of l) if (v < Date.now() - 10 * 60e3) l.delete(k);
      if (l.size >= 5) signaler(s, 'lectures', 35, `${l.size} dossiers réservés différents affichés en 10 minutes`, 'donnees', req);
    }
    if (c === 200 && req.method === 'POST' && req.path === '/api/exports/fichier' && res.locals.exportNominatif) {
      s.evts.exports.push(Date.now());
      if (fenetre(s.evts.exports, 10 * 60e3).length >= 3) signaler(s, 'exports-nominatifs', 20, `${s.evts.exports.length} exports nominatifs en 10 minutes`, 'exports', req);
    }
  });

  // Connexion : échecs par adresse, habitudes du compte en cas de succès
  if (req.method === 'POST' && req.path === '/api/auth/connecter') {
    const json = res.json.bind(res);
    res.json = (obj) => {
      try {
        if (obj && obj.ok && obj.utilisateur && obj.utilisateur.id) apresConnexion(req, obj.utilisateur);
        else if (obj && obj.ok === false && !obj.deuxEtapes) {
          const si = sujet('ip:' + req.ip, 'ip', `adresse ${ipMasquee(req.ip)}`);
          si.evts.echecs.push(Date.now());
          const nb = fenetre(si.evts.echecs, 10 * 60e3).length;
          if (nb >= 8) signaler(si, 'echecs-connexion', 30, `${nb} échecs de connexion en 10 minutes`, 'connexion', req);
        }
      } catch (e) { console.error('[anomalies] connexion', e.message); }
      return json(obj);
    };
  }

  // Action sensible alors que le risque est élevé : confirmation du mot de passe d'abord
  const sens = sensible(req);
  if (sens && req.user && risque(req) >= SEUILS.surveille && !A.estVerifie(req)) {
    res.locals.reauthDemandee = true;
    incidents.signaler({ cle: 'anomalie:' + cle, titre: `Activité inhabituelle · ${s.libelle}`, gravite: 'moyenne', parties: [PARTIES[sens.partie]], sujet: { type: s.type, libelle: s.libelle, cle },
      evenement: `Action sensible demandée : ${req.method} ${req.path.slice(0, 80)}`, action: 'Confirmation du mot de passe demandée avant de poursuivre' });
    return res.status(428).json(REAUTH);
  }
  // Ralentissement temporaire : jamais pour l'essentiel
  if (ralenti(req) && !ESSENTIEL(req)) { res.locals.ralenti = true; return setTimeout(next, 800 + Math.floor(Math.random() * 1200)); }
  next();
}

/* ---------- Routes : habitant ---------- */
const connecte = A.exigerRole(...A.ROLES);
router.get('/api/activite', connecte, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(docs.tous('activites').filter((a) => a.userId === req.user.id).reverse().slice(0, 10));
});
router.post('/api/activite/:id/reponse', connecte, (req, res) => {
  const a = docs.get('activites', req.params.id);
  if (!a || a.userId !== req.user.id) return res.status(404).json({ erreur: 'Alerte introuvable.' });
  if (a.statut !== 'a_confirmer') return res.status(409).json({ erreur: 'Vous avez déjà répondu à cette alerte.' });
  const rep = (req.body || {}).reponse;
  if (!['moi', 'pas_moi'].includes(rep)) return res.status(400).json({ erreur: 'Réponse attendue : moi ou pas_moi.' });
  const s = sujet('u:' + req.user.id, 'compte', `${req.user.prenom} ${req.user.nom} (${req.user.email})`, req.user.id);
  let fermees = 0;
  if (rep === 'moi') {
    s.signaux = []; s.niveau = 'normal'; s.ralentiJusqu = 0;   // l'habitant confirme : les mesures sont levées, ses habitudes sont déjà apprises
    if (a.incidentId) incidents.ajouterAction(a.incidentId, `${req.user.prenom} ${req.user.nom} confirme « C’était moi » : mesures levées.`);
  } else {
    const row = A.parDoc(req.user.id);
    if (row) fermees = db.prepare('DELETE FROM sessions WHERE user_id = ? AND token <> ?').run(row.id, req.jeton || '').changes;
    s.signaux.push({ t: Date.now(), code: 'pas-moi', points: 0, palier: 0, detail: 'déclaré par l’habitant', partie: 'connexion' });
    const inc = incidents.signaler({ cle: 'anomalie:u:' + req.user.id, titre: `Activité inhabituelle · ${req.user.prenom} ${req.user.nom} (${req.user.email})`, gravite: 'haute', parties: ['Connexion', 'Comptes'],
      sujet: { type: 'compte', libelle: `${req.user.prenom} ${req.user.nom} (${req.user.email})`, cle: 'u:' + req.user.id },
      evenement: 'L’habitant indique « Ce n’était pas moi »', action: `Autres sessions fermées (${fermees}) ; changement de mot de passe conseillé à l’habitant` });
    a.incidentId = a.incidentId || inc.id;
    journal('activite_contestee', req.user.email, `${fermees} session(s) fermée(s)`);
  }
  const maj = docs.patch('activites', a.id, { statut: rep, reponduLe: maintenant(), sessionsFermees: fermees, incidentId: a.incidentId || '' });
  audit(req.user, { categorie: 'compte', action: rep === 'moi' ? 'Activité inhabituelle confirmée par l’habitant' : 'Activité inhabituelle contestée par l’habitant', objetId: req.user.id, objetLibelle: `${req.user.prenom} ${req.user.nom}`, apres: rep, motif: (a.libelles || []).join(', ') });
  res.json({ ok: true, activite: maj, sessionsFermees: fermees });
});

/* ---------- Routes : Centre de sécurité (administrateur) ---------- */
const admin = A.exigerRole('admin');
const vueSujet = (s) => ({ cle: s.cle, type: s.type, libelle: s.libelle, score: score(s), niveau: niveauDe(score(s)), ralentiJusqu: s.ralentiJusqu > Date.now() ? new Date(s.ralentiJusqu).toISOString() : null,
  revoqueLe: s.revoqueLe ? new Date(s.revoqueLe).toISOString() : null, incidentId: s.incidentId || '', mesures: s.mesures.slice(-5),
  signaux: s.signaux.map((x) => ({ date: new Date(x.t).toISOString(), code: x.code, libelle: LIBELLES[x.code] || x.code, points: x.points, detail: x.detail, partie: PARTIES[x.partie] || x.partie })) });
router.get('/api/incidents', admin, (req, res) => {
  const l = docs.tous('incidents').sort((a, b) => String(b.maj).localeCompare(String(a.maj)));
  res.set('Cache-Control', 'no-store');
  res.json({ incidents: l.slice(0, 200), ouverts: l.filter((i) => i.statut === 'ouvert').length,
    surveillance: [...sujets.values()].filter((s) => score(s) > 0 || s.ralentiJusqu > Date.now()).map(vueSujet).sort((a, b) => b.score - a.score).slice(0, 50),
    seuils: SEUILS, rafaleMinute: RAFALE });
});
router.post('/api/incidents/:id/resoudre', admin, (req, res) => {
  const inc = docs.get('incidents', req.params.id);
  if (!inc) return res.status(404).json({ erreur: 'Incident introuvable.' });
  if (inc.statut === 'resolu') return res.status(409).json({ erreur: 'Cet incident est déjà résolu.' });
  const note = String((req.body || {}).note || '').trim();
  if (note.length < 5) return res.status(400).json({ erreur: 'Décrivez en quelques mots ce qui a été fait (5 caractères minimum).' });
  res.json(incidents.resoudre(inc.id, req.user, note));
});
router.post('/api/incidents/sujets/lever', admin, (req, res) => {
  const s = sujets.get(String((req.body || {}).cle || ''));
  if (!s) return res.status(404).json({ erreur: 'Aucune mesure en cours pour ce sujet.' });
  s.signaux = []; s.niveau = 'normal'; s.ralentiJusqu = 0;
  if (s.incidentId) incidents.ajouterAction(s.incidentId, `Mesures levées par ${req.user.prenom} ${req.user.nom}`);
  audit(req.user, { categorie: 'securite', action: 'Mesures de protection levées', objetId: s.cle, objetLibelle: s.libelle, motif: String((req.body || {}).motif || '').slice(0, 200) });
  res.json({ ok: true });
});

module.exports = router;
module.exports.surveiller = surveiller;
module.exports.exigerConfirmation = exigerConfirmation;
module.exports.risque = risque;
