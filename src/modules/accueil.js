/* Terra Nova — vague 13 : accueil des nouveaux arrivants
   F71 : compte SANS adresse e-mail. L'habitant reçoit un identifiant lisible « TN-482731 » et choisit un code
         secret (6 chiffres) ou un mot de passe ; il peut aussi se connecter avec son numéro de téléphone.
         Au guichet, un agent inscrit une ou plusieurs personnes à la suite : identifiant + code provisoire
         affichés une seule fois, sur une fiche d'accueil imprimable dans la langue de la personne.
         Sécurité inchangée : code haché (scrypt), verrouillage progressif (F37), limitation de débit (F69),
         téléphone chiffré au repos et retrouvé par empreinte HMAC (jamais en clair dans un index).
   F72 : « Je viens d'arriver » — réponses au petit guide et cases cochées enregistrées dans le profil. */
const crypto = require('node:crypto');
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, journal, audit, notifier, maintenant } = require('../donnees');
const { empreinte } = require('../chiffrement');

db.exec('CREATE TABLE IF NOT EXISTS connexion_tel (empreinte TEXT PRIMARY KEY, login TEXT NOT NULL)');

const LANGUES = ['fr', 'en', 'es', 'ar'];
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const erreur = (res, code, msg) => res.status(code).json({ ok: false, erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

/* ---------- Identifiants ---------- */
const normTel = (t) => { let c = String(t || '').replace(/[^\d+]/g, ''); if (c.startsWith('+')) c = '00' + c.slice(1); return c.replace(/\D/g, ''); };
const telValide = (t) => /^[0-9 +().-]{8,20}$/.test(String(t || '').trim()) && normTel(t).length >= 8;
function genererIdentifiant() {
  for (;;) {
    const n = String(crypto.randomInt(100000, 1000000));
    if (!A.parEmail('tn-' + n)) return { affiche: 'TN-' + n, login: 'tn-' + n };
  }
}
// Compte retrouvé par numéro (empreinte HMAC), avec repli sur le profil (comptes semés, base réinitialisée)
function loginParTelephone(tel) {
  const n = normTel(tel);
  if (n.length < 8) return '';
  const e = empreinte('tel:' + n);
  const r = db.prepare('SELECT login FROM connexion_tel WHERE empreinte = ?').get(e);
  const lie = r && A.parEmail(r.login);
  const profilLie = lie && docs.get('utilisateurs', lie.doc_id);
  if (profilLie && normTel(profilLie.telephone) === n) return r.login;   // numéro toujours d'actualité (sinon : recherche ci-dessous)
  const p = docs.tous('utilisateurs').find((u) => u.sansEmail && u.telephone && normTel(u.telephone) === n);
  if (!p) return '';
  db.prepare('INSERT OR REPLACE INTO connexion_tel (empreinte, login) VALUES (?, ?)').run(e, p.email);
  return p.email;
}
// Saisie de connexion → identifiant interne : e-mail, « TN-482731 » (avec ou sans tiret) ou numéro de téléphone
function resoudreLogin(saisie) {
  const s = String(saisie || '').trim();
  if (s.includes('@')) return s.toLowerCase();
  const m = s.match(/^tn[\s-]?(\d{6})$/i);
  if (m) return 'tn-' + m[1];
  if (telValide(s)) return loginParTelephone(s) || s.toLowerCase();
  return s.toLowerCase();
}

/* ---------- Code secret : 6 chiffres non triviaux, ou mot de passe robuste ---------- */
function validerCode(code) {
  const c = String(code || '');
  if (/^\d+$/.test(c)) {
    if (c.length !== 6) return 'Le code secret doit avoir exactement 6 chiffres.';
    const suite = '0123456789012345', inverse = '9876543210987654';
    if (/^(\d)\1+$/.test(c) || suite.includes(c) || inverse.includes(c) || /^(\d\d)\1\1$/.test(c) || /^(\d\d\d)\1$/.test(c)) return 'Ce code est trop facile à deviner. Évitez les suites (123456) et les répétitions (111111).';
    return '';
  }
  const manques = A.validerMotDePasse(c);
  return manques.length ? `Mot de passe trop faible : ${manques.join(', ')}. Ou choisissez un code secret de 6 chiffres.` : '';
}
function codeProvisoire() {
  for (;;) { const c = String(crypto.randomInt(0, 1e6)).padStart(6, '0'); if (!validerCode(c)) return c; }
}

/* ---------- Création d'un compte sans e-mail ---------- */
function creerSansEmail(d, code, extra) {
  const id = genererIdentifiant();
  const tel = texte(d.telephone, 20);
  const profil = A.creerCompte(Object.assign({
    prenom: texte(d.prenom, 60), nom: texte(d.nom, 60), email: id.login, identifiant: id.affiche, sansEmail: true, role: 'citoyen',
    quartier: QUARTIERS.includes(d.quartier) ? d.quartier : '', telephone: tel, langue: LANGUES.includes(d.langue) ? d.langue : 'fr',
    premiereConnexion: true, profilComplet: false, alertesQuartier: true
  }, extra || {}), code);
  if (tel) db.prepare('INSERT OR REPLACE INTO connexion_tel (empreinte, login) VALUES (?, ?)').run(empreinte('tel:' + normTel(tel)), id.login);
  return { profil, identifiant: id.affiche };
}
function controlerPersonne(d) {
  if (!texte(d.prenom, 60) || !texte(d.nom, 60)) return 'Le prénom et le nom sont obligatoires.';
  if (String(d.prenom || '').length > 60 || String(d.nom || '').length > 60) return 'Prénom ou nom trop long.';
  if (d.telephone && !telValide(d.telephone)) return 'Le numéro de téléphone ne doit contenir que des chiffres, des espaces et le signe +.';
  if (d.telephone && loginParTelephone(d.telephone)) return 'Ce numéro est déjà relié à un compte. Connectez-vous avec ce numéro, ou demandez de l’aide à l’accueil de la mairie.';
  return '';
}

// F71 — inscription libre sans e-mail (limitée par IP dans le bouclier)
router.post('/api/accueil/inscrire', (req, res) => {
  const b = req.body || {};
  const e = controlerPersonne(b);
  if (e) return erreur(res, 400, e);
  const ec = validerCode(b.code);
  if (ec) return erreur(res, 400, ec);
  const { profil, identifiant } = creerSansEmail(b, b.code);
  A.ouvrirSession(res, A.parEmail(profil.email).id);
  journal('inscription', profil.email, 'compte sans e-mail');
  notifier(profil.id, 'Bienvenue sur Terra Nova', `Votre identifiant est ${identifiant}. Notez-le : il remplace l’adresse e-mail pour vous connecter.`, 'bienvenue.html#guide', 'info');
  res.json({ ok: true, identifiant, utilisateur: profil });
});

// F71 — inscription au guichet par un agent, une ou plusieurs personnes à la suite (50 au plus par envoi)
router.post('/api/accueil/agent/inscrire', A.exigerRole('agent', 'admin'), (req, res) => {
  const liste = Array.isArray((req.body || {}).personnes) ? req.body.personnes : [];
  if (!liste.length) return erreur(res, 400, 'Aucune personne à inscrire.');
  if (liste.length > 50) return erreur(res, 400, '50 personnes au plus par envoi.');
  const agent = `${req.user.prenom} ${req.user.nom}`;
  const resultats = liste.map((d, i) => {
    d = d && typeof d === 'object' ? d : {};
    const e = controlerPersonne(d);
    if (e) return { ligne: i + 1, ok: false, prenom: texte(d.prenom, 60), nom: texte(d.nom, 60), erreur: e };
    const code = codeProvisoire();
    const { profil, identifiant } = creerSansEmail(d, code, { codeProvisoire: true, inscritPar: agent, inscritLe: maintenant(), situation: ['seul', 'couple', 'famille'].includes(d.situation) ? d.situation : '' });
    journal('inscription', profil.email, `au guichet par ${req.user.email}`);
    audit(req.user, { categorie: 'compte', action: 'Inscription au guichet', objetId: profil.id, objetLibelle: `${profil.prenom} ${profil.nom}`, apres: identifiant });
    notifier(profil.id, 'Bienvenue sur Terra Nova', 'Votre compte a été créé à l’accueil de la mairie. Choisissez votre propre code secret, puis suivez le guide « Je viens d’arriver ».', 'bienvenue.html#guide', 'info');
    return { ligne: i + 1, ok: true, id: profil.id, identifiant, code, prenom: profil.prenom, nom: profil.nom, langue: profil.langue, avecTelephone: !!profil.telephone };
  });
  res.json({ ok: true, resultats });
});

// F71 — remplacer le code provisoire (ou changer de code après confirmation du mot de passe actuel)
router.post('/api/accueil/code', A.exigerRole(...A.ROLES), (req, res) => {
  if (!req.user.codeProvisoire && !A.estVerifie(req)) return erreur(res, 403, 'Confirmez d’abord votre code actuel.');
  const ec = validerCode((req.body || {}).nouveau);
  if (ec) return erreur(res, 400, ec);
  db.prepare('UPDATE users SET password_hash = ? WHERE doc_id = ?').run(A.hacher(req.body.nouveau), req.user.id);
  docs.patch('utilisateurs', req.user.id, { codeProvisoire: false });
  journal('mdp_change', req.user.email, 'code secret choisi par l’habitant');
  res.json({ ok: true });
});

/* ---------- F72 : guide « Je viens d'arriver » enregistré dans le profil ---------- */
const SITUATIONS = ['seul', 'couple', 'famille'];
const BESOINS = ['logement', 'travail', 'sante', 'ecole', 'deplacer', 'papiers', 'aide'];
const ETAPES = ['compte', 'etat-civil', 'logement', 'emploi', 'sante', 'medecin', 'ecole', 'transports', 'social', 'alertes', 'carte', 'langue', 'code'];
router.put('/api/accueil/guide', A.exigerRole(...A.ROLES), (req, res) => {
  const b = req.body || {};
  const r = b.reponses || {};
  const guide = {
    reponses: { situation: SITUATIONS.includes(r.situation) ? r.situation : '', besoins: (Array.isArray(r.besoins) ? r.besoins : []).filter((x) => BESOINS.includes(x)).slice(0, 7), email: r.email === 'non' ? 'non' : r.email === 'oui' ? 'oui' : '' },
    etapes: (Array.isArray(b.etapes) ? b.etapes : []).filter((x) => ETAPES.includes(x)).slice(0, 13),
    faites: (Array.isArray(b.faites) ? b.faites : []).filter((x) => ETAPES.includes(x)).slice(0, 13),
    maj: maintenant()
  };
  docs.patch('utilisateurs', req.user.id, { guideArrivee: guide });
  res.json({ ok: true, guide });
});

module.exports = router;
module.exports.resoudreLogin = resoudreLogin;
