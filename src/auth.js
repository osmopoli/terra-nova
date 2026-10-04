// D01 / D03 : comptes et connexion · D08 / D09 : rôles et contrôle d'accès · F37 : protection anti-intrusion.
// Mots de passe hachés (scrypt), session par cookie httpOnly. Le rôle fait foi côté serveur.
const crypto = require('node:crypto');
const db = require('./db');
const { docs, journal, notifier, uid, maintenant } = require('./donnees');

const SESSION_JOURS = 7;
const ROLES = ['citoyen', 'agent', 'admin'];
const SEUIL_VERIF = 3;          // après 3 échecs : vérification humaine demandée
const SEUIL_BLOCAGE = 5;        // après 5 échecs : verrouillage temporaire
const DUREE_BLOCAGE = 5 * 60 * 1000;
const VERIF_VALIDITE = 10 * 60 * 1000;   // une vérification de mot de passe autorise une action sensible pendant 10 min

function hacher(mdp) {
  const sel = crypto.randomBytes(16).toString('hex');
  return `${sel}:${crypto.scryptSync(mdp, sel, 64).toString('hex')}`;
}
function verifier(mdp, stocke) {
  const [sel, h] = String(stocke).split(':');
  if (!sel || !h) return false;
  const c = crypto.scryptSync(String(mdp), sel, 64);
  return crypto.timingSafeEqual(c, Buffer.from(h, 'hex'));
}
function validerMotDePasse(mdp) {
  const manques = [];
  if (String(mdp).length < 8) manques.push('8 caractères minimum');
  if (!/[A-Z]/.test(mdp)) manques.push('une majuscule');
  if (!/[0-9]/.test(mdp)) manques.push('un chiffre');
  return manques;
}

const parEmail = (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase());
const parDoc = (docId) => db.prepare('SELECT * FROM users WHERE doc_id = ?').get(String(docId));

// Crée l'identifiant + le document de profil
function creerCompte(profil, motdepasse) {
  const email = profil.email.trim().toLowerCase();
  const doc = Object.assign({ id: profil.id || uid('usr'), cree: profil.cree || maintenant(), actif: true, premiereConnexion: true, profilComplet: false, vulnerable: false }, profil, { email });
  db.prepare('INSERT INTO users (email, name, password_hash, role, doc_id) VALUES (?, ?, ?, ?, ?)')
    .run(email, `${doc.prenom} ${doc.nom}`, hacher(motdepasse), doc.role || 'citoyen', doc.id);
  docs.put('utilisateurs', doc);
  return doc;
}

/* ---------- Sessions ---------- */
const verifies = new Map();   // jeton de session → horodatage de la dernière vérification de mot de passe
function ouvrirSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, Date.now() + SESSION_JOURS * 864e5);
  res.cookie('tn_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === '1' : process.env.NODE_ENV === 'production', maxAge: SESSION_JOURS * 864e5 });
  return token;
}
function fermerSession(req, res) {
  if (req.jeton) { db.prepare('DELETE FROM sessions WHERE token = ?').run(req.jeton); verifies.delete(req.jeton); }
  res.clearCookie('tn_session');
}
const cookies = (h = '') => Object.fromEntries(h.split(';').filter(Boolean).map((c) => { const i = c.indexOf('='); return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())]; }));

// req.user = profil complet (document) avec le rôle serveur ; null si visiteur ou compte désactivé
function chargerUtilisateur(req, res, next) {
  req.jeton = cookies(req.headers.cookie).tn_session || null;
  req.user = null;
  if (req.jeton) {
    const row = db.prepare('SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(req.jeton);
    if (row && row.expires_at > Date.now()) {
      const profil = docs.get('utilisateurs', row.doc_id);
      if (profil && profil.actif !== false) req.user = Object.assign(profil, { role: row.role, _uid: row.id });
    } else if (row) db.prepare('DELETE FROM sessions WHERE token = ?').run(req.jeton);
  }
  next();
}
const estPersonnel = (u) => !!u && (u.role === 'agent' || u.role === 'admin');
function exigerRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ erreur: 'Connexion requise.' });
    if (!roles.includes(req.user.role)) { journal('acces_refuse', req.user.email, req.originalUrl); return res.status(403).json({ erreur: 'Accès refusé pour votre profil.' }); }
    next();
  };
}
const marquerVerifie = (req) => req.jeton && verifies.set(req.jeton, Date.now());
const estVerifie = (req) => !!req.jeton && Date.now() - (verifies.get(req.jeton) || 0) < VERIF_VALIDITE;

/* ---------- F37 : état anti-intrusion ---------- */
const VIDE = { echecs: 0, verrouJusqu: 0, blocages: 0, echecsDepuisConnexion: 0, ips: {} };   // ips : échecs par appareil (empreinte du cookie tn_appareil) ; verrouIps : appareils visés par le verrou
function etatSecurite(email) {
  const r = db.prepare('SELECT etat FROM securite WHERE email = ?').get(String(email || '').toLowerCase());
  return r ? JSON.parse(r.etat) : { ...VIDE };
}
function majSecurite(email, etat) {
  db.prepare('INSERT INTO securite (email, etat) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET etat = excluded.etat').run(String(email).toLowerCase(), JSON.stringify(etat));
}
const toutesSecurites = () => Object.fromEntries(db.prepare('SELECT email, etat FROM securite').all().map((r) => [r.email, JSON.parse(r.etat)]));

// Même contrat que l'ancien store navigateur : { ok, erreur, verification, verrouJusqu, restantes, alerteSecurite, utilisateur }
function connecter(req, res, email, motdepasse, verificationReussie) {
  email = require('./modules/accueil').resoudreLogin(email);   // F71 : e-mail, identifiant TN-xxxxxx ou numéro de téléphone
  const etat = etatSecurite(email);
  const t = Date.now();
  // Le verrou ne frappe que l'appareil (cookie tn_appareil) d'où viennent les échecs : ni un tiers à distance, ni les autres
  // habitants du même réseau (Wi-Fi d'une mairie, d'une école, d'un foyer) ne sont bloqués. Les rafales sans cookie sont
  // freinées par le bouclier (20 connexions/min par IP). La « vérification humaine » est journalisée mais ne protège rien.
  const ip = require('./bouclier').ipMasquee(req && req.ip);
  const cle = res && req ? require('./renfort').identifiantAppareil(req, res) : ip;
  etat.ips = Object.assign({}, etat.ips && typeof etat.ips === 'object' ? etat.ips : {});   // copie : VIDE reste intact
  if (verificationReussie) journal('verification_humaine', email, ip);
  if (etat.verrouJusqu > t && Array.isArray(etat.verrouIps) && etat.verrouIps.includes(cle)) {
    journal('tentative_bloquee', email, ip);
    return { ok: false, verrouJusqu: etat.verrouJusqu, erreur: 'Trop de tentatives. Connexion temporairement bloquée pour protéger ce compte.' };
  }
  const row = parEmail(email);
  const profil = row && docs.get('utilisateurs', row.doc_id);
  if (!row || !verifier(motdepasse || '', row.password_hash) || !profil || profil.actif === false) {
    etat.echecs++; etat.echecsDepuisConnexion = (etat.echecsDepuisConnexion || 0) + 1;
    etat.ips[cle] = (etat.ips[cle] || 0) + 1;
    if (Object.keys(etat.ips).length > 50) etat.ips = { [cle]: etat.ips[cle] };   // borne mémoire
    let rep = { ok: false, erreur: 'Identifiant ou mot de passe incorrect.' };
    if (profil && profil.actif === false && row && verifier(motdepasse || '', row.password_hash)) rep.erreur = 'Ce compte est désactivé. Contactez la mairie.';
    if (etat.echecs >= SEUIL_BLOCAGE) {
      etat.blocages = (etat.blocages || 0) + 1;
      etat.verrouJusqu = t + DUREE_BLOCAGE * etat.blocages;
      etat.verrouIps = Object.keys(etat.ips);   // seuls les appareils d'où viennent les échecs sont bloqués
      etat.echecs = 0; etat.ips = {};
      rep = { ok: false, verrouJusqu: etat.verrouJusqu, erreur: 'Trop de tentatives. Connexion temporairement bloquée pour protéger ce compte.' };
      journal('verrouillage', email, `${(DUREE_BLOCAGE * etat.blocages) / 60000} min (${ip})`);
      if (profil) notifier(profil.id, 'Tentatives de connexion inhabituelles', 'Votre compte a été protégé après plusieurs essais de mot de passe incorrects. Si ce n’était pas vous, changez votre mot de passe.', 'compte.html', 'alerte');
    } else {
      rep.restantes = SEUIL_BLOCAGE - etat.echecs;
      rep.verification = etat.echecs >= SEUIL_VERIF;
      journal('echec_connexion', email, ip);
    }
    majSecurite(email, etat);
    return rep;
  }
  const alerteSecurite = etat.echecsDepuisConnexion || 0;
  majSecurite(email, { ...VIDE });
  // ouverture de session, deuxième étape (F53) et alerte nouvel appareil (F54) : voir renfort.js
  return require('./renfort').apresMotDePasse(req, res, row, profil, alerteSecurite);
}

// Comptes de démonstration de l'équipe (en plus de ceux de demo-seed.json) : variables d'environnement facultatives
const MDP_EXEMPLE = ['admin1234', 'agent1234'];   // valeurs de .env.example : jamais en production
const PROD = process.env.NODE_ENV === 'production';
function comptesEquipe() {
  const seeds = [
    { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, prenom: 'Administrateur', nom: 'Terra Nova', role: 'admin' },
    { email: process.env.AGENT_EMAIL, password: process.env.AGENT_PASSWORD, prenom: 'Agent', nom: 'municipal', role: 'agent' }
  ];
  for (const s of seeds) {
    if (!s.email || !s.password || parEmail(s.email)) continue;
    if (PROD && MDP_EXEMPLE.includes(s.password)) { console.warn(`[auth] ${s.email} non créé : mot de passe d'exemple refusé en production`); continue; }
    creerCompte({ prenom: s.prenom, nom: s.nom, email: s.email, role: s.role, quartier: 'Centre', telephone: '', premiereConnexion: false, profilComplet: true }, s.password);
  }
}

// Comptes de démonstration publics (README) : en production, ADMIN_PASSWORD remplace le mot de passe de admin@nova.test
// et AGENT_PASSWORD celui des agents de démo, à chaque démarrage (base déjà semée comprise). Les sessions ouvertes
// avec l'ancien mot de passe sont fermées. Les comptes citoyens de démo restent inchangés.
function motsDePasseDemo() {
  const cibles = [['ADMIN_PASSWORD', ['admin@nova.test']], ['AGENT_PASSWORD', ['agent@nova.test', 'social@nova.test']]];
  for (const [variable, emails] of cibles) {
    const mdp = process.env[variable];
    if (!mdp) { if (PROD) console.warn(`[auth] ${variable} non défini : ${emails.join(', ')} garde(nt) le mot de passe public du README`); continue; }
    if (MDP_EXEMPLE.includes(mdp)) { console.warn(`[auth] ${variable} : valeur d'exemple ignorée, comptes de démo inchangés`); continue; }
    for (const email of emails) {
      const row = parEmail(email);
      if (!row || verifier(mdp, row.password_hash)) continue;
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hacher(mdp), row.id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id);
      console.log(`[auth] mot de passe de ${email} remplacé par ${variable}`);
    }
  }
}

module.exports = {
  ROLES, SEUIL_VERIF, SEUIL_BLOCAGE, hacher, verifier, validerMotDePasse, parEmail, parDoc, creerCompte,
  ouvrirSession, fermerSession, chargerUtilisateur, exigerRole, estPersonnel, marquerVerifie, estVerifie,
  etatSecurite, majSecurite, toutesSecurites, connecter, comptesEquipe, motsDePasseDemo, VIDE
};
