/* Terra Nova — renfort de la connexion (vague 9)
   D02 : connexion sans mot de passe par clé d'accès (WebAuthn / passkey : Windows Hello, empreinte, code du téléphone)
   F53 : vérification en deux étapes par code à usage unique (TOTP, application d'authentification)
   F54 : alerte lorsqu'un nouvel appareil se connecte au compte
   Aucune dépendance : la cryptographie passe par node:crypto. */
const crypto = require('node:crypto');
const db = require('./db');
const { docs, journal, notifier, maintenant } = require('./donnees');
const A = require('./auth');

db.exec(`
CREATE TABLE IF NOT EXISTS deux_etapes (
  user_id INTEGER PRIMARY KEY,
  secret TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 0,
  secours TEXT NOT NULL DEFAULT '[]',
  dernier_pas INTEGER NOT NULL DEFAULT 0,
  active_le TEXT
);
CREATE TABLE IF NOT EXISTS cles_acces (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cle_publique TEXT NOT NULL,
  algo INTEGER NOT NULL,
  compteur INTEGER NOT NULL DEFAULT 0,
  nom TEXT NOT NULL,
  cree TEXT NOT NULL,
  utilisee TEXT
);
CREATE TABLE IF NOT EXISTS appareils (
  user_id INTEGER NOT NULL,
  appareil TEXT NOT NULL,
  libelle TEXT NOT NULL,
  premiere TEXT NOT NULL,
  derniere TEXT NOT NULL,
  PRIMARY KEY (user_id, appareil)
);
`);
const colonnesSessions = db.prepare('PRAGMA table_info(sessions)').all().map((c) => c.name);
if (!colonnesSessions.includes('appareil')) db.exec('ALTER TABLE sessions ADD COLUMN appareil TEXT');

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const deB64u = (s) => Buffer.from(String(s || ''), 'base64url');
const sha256 = (d) => crypto.createHash('sha256').update(d).digest();
const egal = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);

/* Défis et étapes en attente : courts, en mémoire, à usage unique */
const attentes = new Map();
function garder(type, valeur, dureeMs) {
  const cle = crypto.randomBytes(24).toString('base64url');
  attentes.set(cle, { type, valeur, fin: Date.now() + dureeMs });
  return cle;
}
function reprendre(type, cle, consommer = true) {
  const a = attentes.get(String(cle || ''));
  if (!a || a.type !== type || a.fin < Date.now()) { attentes.delete(cle); return null; }
  if (consommer) attentes.delete(cle);
  return a;
}
setInterval(() => { const t = Date.now(); for (const [k, a] of attentes) if (a.fin < t) attentes.delete(k); }, 60000).unref();

/* ---------- F54 : appareils ---------- */
function libelleAppareil(ua = '') {
  const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'système inconnu';
  return `${nav} sur ${os}`;
}
const cookies = (h = '') => Object.fromEntries(h.split(';').filter(Boolean).map((c) => { const i = c.indexOf('='); return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())]; }));
// identifiant d'appareil : cookie aléatoire longue durée ; en base, seule son empreinte est conservée
function identifiantAppareil(req, res) {
  let id = cookies(req.headers.cookie).tn_appareil;
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    id = crypto.randomBytes(16).toString('hex');
    res.cookie('tn_appareil', id, { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === '1' : process.env.NODE_ENV === 'production', maxAge: 400 * 864e5 });
  }
  return sha256(id).toString('hex').slice(0, 32);
}

/* Ouverture de session commune à toutes les méthodes (mot de passe, code, clé d'accès) */
function ouvrirSessionComplete(req, res, row, profil, methode) {
  const appareil = identifiantAppareil(req, res);
  const jeton = A.ouvrirSession(res, row.id);
  db.prepare('UPDATE sessions SET appareil = ? WHERE token = ?').run(appareil, jeton);
  const quand = maintenant();
  const libelle = libelleAppareil(req.headers['user-agent']);
  const connu = db.prepare('SELECT 1 FROM appareils WHERE user_id = ? AND appareil = ?').get(row.id, appareil);
  const premierAppareil = !db.prepare('SELECT 1 FROM appareils WHERE user_id = ? LIMIT 1').get(row.id);
  if (connu) db.prepare('UPDATE appareils SET derniere = ?, libelle = ? WHERE user_id = ? AND appareil = ?').run(quand, libelle, row.id, appareil);
  else {
    db.prepare('INSERT INTO appareils (user_id, appareil, libelle, premiere, derniere) VALUES (?, ?, ?, ?, ?)').run(row.id, appareil, libelle, quand, quand);
    if (!premierAppareil) {
      const date = new Date(quand).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });
      notifier(profil.id, 'Nouvel appareil connecté à votre compte',
        `${libelle}, le ${date}. Si c’est vous, il n’y a rien à faire. Sinon, retirez cet appareil et changez votre mot de passe depuis « Mon compte ».`,
        'compte.html#appareils', 'alerte');
      journal('nouvel_appareil', profil.email, libelle);
    }
  }
  const u = docs.patch('utilisateurs', profil.id, { derniereConnexion: quand });
  journal('connexion', profil.email, methode === 'mdp' ? '' : methode === 'cle' ? 'clé d’accès' : 'code à usage unique');
  return { ok: true, utilisateur: Object.assign(u, { role: row.role }), nouvelAppareil: !connu && !premierAppareil };
}

/* ---------- F53 : TOTP (RFC 6238, 6 chiffres, pas de 30 s) ---------- */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32(buf) {
  let bits = 0, val = 0, out = '';
  for (const o of buf) { val = (val << 8) | o; bits += 8; while (bits >= 5) { out += ALPHABET[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits) out += ALPHABET[(val << (5 - bits)) & 31];
  return out;
}
function deBase32(s) {
  let bits = 0, val = 0; const out = [];
  for (const c of String(s).replace(/[\s=]/g, '').toUpperCase()) { const i = ALPHABET.indexOf(c); if (i < 0) continue; val = (val << 5) | i; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; } }
  return Buffer.from(out);
}
function codeTotp(secret, pas) {
  const compteur = Buffer.alloc(8); compteur.writeBigUInt64BE(BigInt(pas));
  const h = crypto.createHmac('sha1', deBase32(secret)).update(compteur).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
}
// accepte le pas courant ± 1 (décalage d'horloge) et refuse de rejouer un code déjà utilisé
function verifierTotp(ligne, code) {
  code = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) return 0;
  const pas = Math.floor(Date.now() / 30000);
  for (const p of [pas, pas - 1, pas + 1]) if (p > ligne.dernier_pas && egal(Buffer.from(codeTotp(ligne.secret, p)), Buffer.from(code))) return p;
  return 0;
}
const ligneDeuxEtapes = (userId) => db.prepare('SELECT * FROM deux_etapes WHERE user_id = ?').get(userId);
const deuxEtapesActive = (userId) => !!(ligneDeuxEtapes(userId) || {}).actif;
// code TOTP ou code de secours (usage unique) ; renvoie 'totp' | 'secours' | ''
function controlerCode(userId, code) {
  const l = ligneDeuxEtapes(userId); if (!l) return '';
  const pas = verifierTotp(l, code);
  if (pas) { db.prepare('UPDATE deux_etapes SET dernier_pas = ? WHERE user_id = ?').run(pas, userId); return 'totp'; }
  const brut = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (brut.length !== 10) return '';
  const empreinte = sha256(brut).toString('hex');
  const secours = JSON.parse(l.secours);
  if (!secours.includes(empreinte)) return '';
  db.prepare('UPDATE deux_etapes SET secours = ? WHERE user_id = ?').run(JSON.stringify(secours.filter((s) => s !== empreinte)), userId);
  return 'secours';
}

/* Après un mot de passe correct (appelé par auth.connecter) : deuxième étape si elle est activée */
function apresMotDePasse(req, res, row, profil, alerteSecurite) {
  if (deuxEtapesActive(row.id)) {
    const etape = garder('etape', { userId: row.id, essais: 0, alerteSecurite }, 5 * 60000);
    journal('deux_etapes_demandee', profil.email);
    return { ok: false, deuxEtapes: true, etape };
  }
  return Object.assign(ouvrirSessionComplete(req, res, row, profil, 'mdp'), { alerteSecurite });
}

/* ---------- D02 : clés d'accès (WebAuthn) ----------
   Le navigateur fournit la clé publique au format SPKI (getPublicKey()) : pas besoin de décoder le CBOR. */
const rpId = (req) => process.env.RP_ID || req.hostname;
const origineAttendue = (req) => process.env.ORIGINE || `${process.env.NODE_ENV === 'production' ? 'https' : req.protocol}://${req.get('host')}`;
function lireDonneesClient(req, clientDataJSON, type, defiAttendu) {
  let c; try { c = JSON.parse(deB64u(clientDataJSON).toString('utf8')); } catch { return 'Réponse de la clé illisible.'; }
  if (c.type !== type) return 'Réponse de la clé inattendue.';
  if (c.challenge !== defiAttendu) return 'Ce défi a expiré : recommencez.';
  if (c.origin !== origineAttendue(req)) return 'Origine de la demande non reconnue.';
  return '';
}
function lireDonneesAuthentificateur(req, authenticatorData) {
  const a = deB64u(authenticatorData);
  if (a.length < 37) return { erreur: 'Données de la clé incomplètes.' };
  if (!egal(a.subarray(0, 32), sha256(rpId(req)))) return { erreur: 'Cette clé appartient à un autre site.' };
  const drapeaux = a[32];
  if (!(drapeaux & 0x01)) return { erreur: 'Présence de l’utilisateur non confirmée.' };
  if (!(drapeaux & 0x04)) return { erreur: 'Le déverrouillage de l’appareil (code, empreinte ou visage) est requis.' };
  return { brut: a, compteur: a.readUInt32BE(33) };
}

/* ---------- Routes ---------- */
const express = require('express');
const router = express.Router();
const moi = (req) => A.parDoc(req.user.id);
const connecte = A.exigerRole(...A.ROLES);
const exigerVerification = (req, res, next) => (A.estVerifie(req) ? next() : res.status(403).json({ erreur: 'Confirmez d’abord votre mot de passe.', verification: true }));

// Résumé pour la page « Mon compte »
router.get('/api/securite/etat', connecte, (req, res) => {
  const row = moi(req);
  const l = ligneDeuxEtapes(row.id);
  const jetonAppareil = req.jeton && (db.prepare('SELECT appareil FROM sessions WHERE token = ?').get(req.jeton) || {}).appareil;
  res.json({
    deuxEtapes: { active: !!(l && l.actif), depuis: l && l.actif ? l.active_le : null, codesSecours: l && l.actif ? JSON.parse(l.secours).length : 0 },
    cles: db.prepare('SELECT id, nom, cree, utilisee FROM cles_acces WHERE user_id = ? ORDER BY cree').all(row.id),
    appareils: db.prepare('SELECT appareil, libelle, premiere, derniere FROM appareils WHERE user_id = ? ORDER BY derniere DESC').all(row.id)
      .map((a) => Object.assign(a, { actuel: a.appareil === jetonAppareil })),
    verifie: A.estVerifie(req)
  });
});

// F53 — préparer : nouveau secret (inactif tant qu'un premier code n'a pas été validé)
router.post('/api/securite/deux-etapes/preparer', connecte, exigerVerification, (req, res) => {
  const row = moi(req);
  if (deuxEtapesActive(row.id)) return res.status(409).json({ erreur: 'La vérification en deux étapes est déjà active.' });
  const secret = base32(crypto.randomBytes(20));
  db.prepare('INSERT INTO deux_etapes (user_id, secret, actif) VALUES (?, ?, 0) ON CONFLICT(user_id) DO UPDATE SET secret = excluded.secret, actif = 0, secours = \'[]\', dernier_pas = 0').run(row.id, secret);
  const lien = `otpauth://totp/${encodeURIComponent('Terra Nova:' + row.email)}?secret=${secret}&issuer=${encodeURIComponent('Terra Nova')}&digits=6&period=30`;
  res.json({ secret: secret.match(/.{1,4}/g).join(' '), lien });
});
router.post('/api/securite/deux-etapes/activer', connecte, (req, res) => {
  const row = moi(req);
  const l = ligneDeuxEtapes(row.id);
  if (!l || l.actif) return res.status(409).json({ erreur: 'Commencez par scanner le code.' });
  const pas = verifierTotp(l, req.body.code);
  if (!pas) return res.json({ ok: false, erreur: 'Ce code ne correspond pas. Saisissez les 6 chiffres affichés en ce moment dans votre application.' });
  const codes = Array.from({ length: 8 }, () => { const c = base32(crypto.randomBytes(7)).slice(0, 10); return c; });
  db.prepare('UPDATE deux_etapes SET actif = 1, dernier_pas = ?, secours = ?, active_le = ? WHERE user_id = ?')
    .run(pas, JSON.stringify(codes.map((c) => sha256(c).toString('hex'))), maintenant(), row.id);
  journal('deux_etapes_activee', row.email);
  notifier(req.user.id, 'Vérification en deux étapes activée', 'Un code de votre application vous sera demandé à chaque connexion avec mot de passe.', 'compte.html#securite-connexion', 'info');
  res.json({ ok: true, codesSecours: codes.map((c) => c.slice(0, 5) + '-' + c.slice(5)) });
});
router.post('/api/securite/deux-etapes/desactiver', connecte, exigerVerification, (req, res) => {
  const row = moi(req);
  if (!controlerCode(row.id, req.body.code)) return res.json({ ok: false, erreur: 'Code incorrect : la vérification en deux étapes reste active.' });
  db.prepare('DELETE FROM deux_etapes WHERE user_id = ?').run(row.id);
  journal('deux_etapes_desactivee', row.email);
  notifier(req.user.id, 'Vérification en deux étapes désactivée', 'Votre compte n’est plus protégé que par votre mot de passe. Si ce n’est pas vous, changez-le tout de suite.', 'compte.html#securite-connexion', 'alerte');
  res.json({ ok: true });
});

// Connexion, deuxième étape : code de l'application ou code de secours
router.post('/api/auth/code', (req, res) => {
  const a = reprendre('etape', req.body.etape, false);
  if (!a) return res.json({ ok: false, expire: true, erreur: 'Cette étape a expiré. Reprenez la connexion depuis le début.' });
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(a.valeur.userId);
  const profil = row && docs.get('utilisateurs', row.doc_id);
  if (!profil || profil.actif === false) { attentes.delete(req.body.etape); return res.json({ ok: false, expire: true, erreur: 'Compte indisponible.' }); }
  const methode = controlerCode(row.id, req.body.code);
  if (!methode) {
    a.valeur.essais++;
    journal('echec_code', row.email);
    if (a.valeur.essais >= 5) {
      attentes.delete(req.body.etape);
      notifier(profil.id, 'Codes de vérification incorrects', 'Plusieurs codes faux ont été saisis après votre mot de passe. Si ce n’était pas vous, changez votre mot de passe.', 'compte.html', 'alerte');
      return res.json({ ok: false, expire: true, erreur: 'Trop de codes incorrects. Reprenez la connexion depuis le début.' });
    }
    return res.json({ ok: false, erreur: 'Code incorrect.', restantes: 5 - a.valeur.essais });
  }
  attentes.delete(req.body.etape);
  const rep = ouvrirSessionComplete(req, res, row, profil, 'code');
  if (methode === 'secours') rep.secoursRestants = JSON.parse(ligneDeuxEtapes(row.id).secours).length;
  res.json(Object.assign(rep, { alerteSecurite: a.valeur.alerteSecurite }));
});

// D02 — enregistrer une clé d'accès (compte connecté + mot de passe confirmé récemment)
router.post('/api/securite/cles/options', connecte, exigerVerification, (req, res) => {
  const row = moi(req);
  const defi = b64u(crypto.randomBytes(32));
  attentes.set('creation:' + row.id, { type: 'creation', valeur: { defi }, fin: Date.now() + 5 * 60000 });
  res.json({
    challenge: defi,
    rp: { name: 'Terra Nova', id: rpId(req) },
    user: { id: b64u(Buffer.from(req.user.id)), name: row.email, displayName: `${req.user.prenom} ${req.user.nom}` },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
    excludeCredentials: db.prepare('SELECT id FROM cles_acces WHERE user_id = ?').all(row.id).map((c) => ({ type: 'public-key', id: c.id })),
    attestation: 'none',
    timeout: 120000
  });
});
router.post('/api/securite/cles', connecte, (req, res) => {
  const row = moi(req);
  const b = req.body || {};
  const a = attentes.get('creation:' + row.id); attentes.delete('creation:' + row.id);
  if (!a || a.fin < Date.now()) return res.json({ ok: false, erreur: 'La demande a expiré : recommencez.' });
  const e1 = lireDonneesClient(req, b.clientDataJSON, 'webauthn.create', a.valeur.defi);
  if (e1) return res.json({ ok: false, erreur: e1 });
  const auth = lireDonneesAuthentificateur(req, b.authenticatorData);
  if (auth.erreur) return res.json({ ok: false, erreur: auth.erreur });
  if (![-7, -257].includes(b.publicKeyAlgorithm)) return res.json({ ok: false, erreur: 'Type de clé non pris en charge.' });
  try { crypto.createPublicKey({ key: deB64u(b.publicKey), format: 'der', type: 'spki' }); } catch { return res.json({ ok: false, erreur: 'Clé publique invalide.' }); }
  if (!/^[A-Za-z0-9_-]{16,1400}$/.test(String(b.id || ''))) return res.json({ ok: false, erreur: 'Identifiant de clé invalide.' });
  if (db.prepare('SELECT 1 FROM cles_acces WHERE id = ?').get(b.id)) return res.json({ ok: false, erreur: 'Cette clé est déjà enregistrée.' });
  const nom = String(b.nom || '').trim().slice(0, 60) || libelleAppareil(req.headers['user-agent']);
  db.prepare('INSERT INTO cles_acces (id, user_id, cle_publique, algo, compteur, nom, cree) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(b.id, row.id, b.publicKey, b.publicKeyAlgorithm, auth.compteur, nom, maintenant());
  journal('cle_ajoutee', row.email, nom);
  notifier(req.user.id, 'Clé d’accès ajoutée', `« ${nom} » permet maintenant de vous connecter sans mot de passe. Si ce n’est pas vous, retirez-la depuis « Mon compte ».`, 'compte.html#securite-connexion', 'info');
  res.json({ ok: true });
});
router.delete('/api/securite/cles/:id', connecte, exigerVerification, (req, res) => {
  const row = moi(req);
  const c = db.prepare('SELECT nom FROM cles_acces WHERE id = ? AND user_id = ?').get(req.params.id, row.id);
  if (!c) return res.status(404).json({ erreur: 'Clé introuvable.' });
  db.prepare('DELETE FROM cles_acces WHERE id = ?').run(req.params.id);
  journal('cle_retiree', row.email, c.nom);
  res.json({ ok: true });
});

// D02 — se connecter avec une clé d'accès (clé découvrable : aucun e-mail à saisir)
router.post('/api/auth/cle/options', (req, res) => {
  const defi = b64u(crypto.randomBytes(32));
  attentes.set('defi:' + defi, { type: 'connexion', valeur: defi, fin: Date.now() + 3 * 60000 });
  res.json({ challenge: defi, rpId: rpId(req), userVerification: 'required', timeout: 120000 });
});
router.post('/api/auth/cle', (req, res) => {
  const b = req.body || {};
  let defi = '';
  try { defi = JSON.parse(deB64u(b.clientDataJSON).toString('utf8')).challenge; } catch { /* lu plus bas */ }
  const a = attentes.get('defi:' + defi); attentes.delete('defi:' + defi);
  if (!a || a.fin < Date.now()) return res.json({ ok: false, erreur: 'La demande a expiré : recommencez.' });
  const e1 = lireDonneesClient(req, b.clientDataJSON, 'webauthn.get', defi);
  if (e1) return res.json({ ok: false, erreur: e1 });
  const cle = db.prepare('SELECT * FROM cles_acces WHERE id = ?').get(String(b.id || ''));
  if (!cle) return res.json({ ok: false, erreur: 'Cette clé d’accès n’est liée à aucun compte Terra Nova. Connectez-vous avec votre mot de passe, puis ajoutez-la depuis « Mon compte ».' });
  const auth = lireDonneesAuthentificateur(req, b.authenticatorData);
  if (auth.erreur) return res.json({ ok: false, erreur: auth.erreur });
  const signe = Buffer.concat([auth.brut, sha256(deB64u(b.clientDataJSON))]);
  let valide = false;
  try { valide = crypto.verify('sha256', signe, { key: deB64u(cle.cle_publique), format: 'der', type: 'spki' }, deB64u(b.signature)); } catch { valide = false; }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(cle.user_id);
  const profil = row && docs.get('utilisateurs', row.doc_id);
  if (!valide || !profil) { journal('echec_cle', row ? row.email : '?'); return res.json({ ok: false, erreur: 'La clé d’accès n’a pas pu être vérifiée.' }); }
  // compteur de signatures : s'il recule, la clé a peut-être été copiée
  if (cle.compteur > 0 && auth.compteur <= cle.compteur) {
    journal('cle_suspecte', row.email, cle.nom);
    notifier(profil.id, 'Clé d’accès refusée', `La clé « ${cle.nom} » a présenté une signature inhabituelle et a été refusée. Retirez-la et ajoutez-en une nouvelle.`, 'compte.html#securite-connexion', 'alerte');
    return res.json({ ok: false, erreur: 'Cette clé d’accès a été refusée par sécurité.' });
  }
  if (profil.actif === false) return res.json({ ok: false, erreur: 'Ce compte est désactivé. Contactez la mairie.' });
  db.prepare('UPDATE cles_acces SET compteur = ?, utilisee = ? WHERE id = ?').run(auth.compteur, maintenant(), cle.id);
  A.majSecurite(row.email, { ...A.VIDE });
  res.json(ouvrirSessionComplete(req, res, row, profil, 'cle'));
});

// F54 — retirer un appareil : ses sessions sont fermées à distance
router.delete('/api/securite/appareils/:appareil', connecte, (req, res) => {
  const row = moi(req);
  const ap = db.prepare('SELECT libelle FROM appareils WHERE user_id = ? AND appareil = ?').get(row.id, req.params.appareil);
  if (!ap) return res.status(404).json({ erreur: 'Appareil introuvable.' });
  db.prepare('DELETE FROM appareils WHERE user_id = ? AND appareil = ?').run(row.id, req.params.appareil);
  const fermees = db.prepare('DELETE FROM sessions WHERE user_id = ? AND appareil = ?').run(row.id, req.params.appareil).changes;
  journal('appareil_retire', row.email, ap.libelle);
  res.json({ ok: true, sessionsFermees: fermees });
});

module.exports = { router, apresMotDePasse, ouvrirSessionComplete, deuxEtapesActive };
