// Vague 14 (F73) : « Message officiel » du Haut Conseil de la Ville, construit sur les annonces et alertes (D06, D18, F29-F31).
// Les agents / admins publient un titre, un message simple, « ce que vous devez faire », un public (toute la ville ou un quartier)
// et une période (immédiate ou programmée). Le serveur décide qui le voit et quand : un message programmé n'est jamais
// envoyé avant son heure, un message terminé ou retiré disparaît. « J'ai compris » est enregistré par compte (et par appareil côté navigateur).
const router = require('express').Router();
const { docs, audit, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const LANGUES = ['en', 'es', 'ar'];
const COL = 'officiels';

function etatDe(m, t = Date.now()) {
  if (m.statut === 'retire') return 'retire';
  if (Date.parse(m.debut) > t) return 'programme';
  if (Date.parse(m.fin) <= t) return 'termine';
  return 'actif';
}
// Un message concerne-t-il ce profil ? Visiteur : tous les messages (le quartier est indiqué) ; habitant : toute la ville + son quartier
// vague 21 (F101) : une crise localisée est montrée à tous (critique pour le quartier touché, information pour les autres)
const concerne = (m, u) => !!m.crise || m.audience === 'Toute la ville' || !u || u.role !== 'citoyen' || u.quartier === m.audience;

function vuePublique(m, u) {
  return { id: m.id, titre: m.titre, message: m.message, actions: m.actions, audience: m.audience, debut: m.debut, fin: m.fin,
    traductions: m.traductions || {}, signataire: m.signataire, compris: !!u && (m.accuses || []).some((a) => a.userId === u.id),
    monQuartier: !!u && u.role === 'citoyen' && (m.audience === u.quartier || (!!m.crise && m.crise.quartiers.includes(u.quartier))),
    ...vueCrise(m, u) };   // vague 21 (F101)
}
/* vague 21 (F101) : crise localisée (src/modules/crise.js) : rétablissement estimé, dernière mise à jour, points d'accueil ;
   critique (fenêtre sans fermeture automatique) seulement pour les habitants du quartier touché */
function vueCrise(m, u) {
  if (!m.crise) return {};
  const c = m.crise;
  const tempete = c.type === 'tempete-solaire';   // vague 22 (F104) : tempête solaire → critique pour tout le monde (visiteurs et personnel compris)
  return { crise: { type: c.type, quartiers: c.quartiers, retablissement: c.retablissement, majLe: c.majLe, progression: c.progression, points: c.points || [], statut: c.statut,
    ...(tempete ? { perturbations: c.perturbations, duree: c.duree } : {}) },
    critique: tempete || (!!u && u.role === 'citoyen' && c.quartiers.includes(u.quartier)) };
}
const actifsPour = (u) => docs.tous(COL).filter((m) => etatDe(m) === 'actif' && concerne(m, u)).sort((a, b) => b.debut.localeCompare(a.debut));

// Lecture publique : les messages en cours qui concernent le profil (interrogée toutes les 30 s par chaque page)
router.get('/api/officiels', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ maintenant: maintenant(), messages: actifsPour(req.user).map((m) => vuePublique(m, req.user)) });
});

// Personnel : tous les messages (programmés, en cours, terminés, retirés) avec le nombre de « J'ai compris »
router.get('/api/officiels/tous', A.exigerRole('agent', 'admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(docs.tous(COL).map((m) => ({ ...m, etat: etatDe(m), nbCompris: (m.accuses || []).length + (m.accusesAppareils || 0), accuses: undefined }))
    .sort((a, b) => b.cree.localeCompare(a.cree)));
});

function lireActions(v) {
  const l = (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : typeof v === 'string' ? v.split('\n') : []).map((x) => texte(x, 160)).filter(Boolean);
  return l.slice(0, 6);
}

router.post('/api/officiels', A.exigerRole('agent', 'admin'), (req, res) => {
  const b = req.body || {};
  const titre = texte(b.titre, 120);
  const message = texte(b.message, 1200);
  const actions = lireActions(b.actions);
  const audience = QUARTIERS.includes(b.audience) ? b.audience : 'Toute la ville';
  const debut = b.immediat === false && b.debut ? Date.parse(b.debut) : Date.now();
  const fin = Date.parse(b.fin);
  if (titre.length < 5) return erreur(res, 400, 'Donnez un titre clair (5 caractères minimum).');
  if (message.length < 10) return erreur(res, 400, 'Écrivez le message en quelques phrases simples (10 caractères minimum).');
  if (!actions.length) return erreur(res, 400, 'Indiquez au moins une chose à faire pour les habitants (« Ce que vous devez faire »).');
  if (!Number.isFinite(debut)) return erreur(res, 400, 'La date de début est invalide.');
  if (b.immediat === false && debut < Date.now() - 5 * 60e3) return erreur(res, 400, 'Un message programmé doit commencer dans le futur (ou choisissez « Tout de suite »).');
  if (!Number.isFinite(fin) || fin <= Math.max(debut, Date.now())) return erreur(res, 400, 'La fin doit être après le début et dans le futur.');
  if (fin - debut > 60 * 864e5) return erreur(res, 400, 'Un message officiel dure 60 jours au plus.');
  const traductions = {};
  for (const l of LANGUES) {
    const tr = (b.traductions || {})[l] || {};
    const tt = texte(tr.titre, 120), tm = texte(tr.message, 1200), ta = lireActions(tr.actions);
    if (tt || tm || ta.length) traductions[l] = { titre: tt, message: tm, actions: ta };
  }
  const n = docs.prochainNumero(COL, 0);
  const m = docs.put(COL, { id: `OFF-${String(n).padStart(4, '0')}`, cree: maintenant(), titre, message, actions, audience,
    debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString(), traductions, signataire: 'Haut Conseil de la Ville',
    statut: 'publie', accuses: [], accusesAppareils: 0, creePar: req.user.id, auteur: `${req.user.prenom} ${req.user.nom}` });
  const etat = etatDe(m);
  audit(req.user, { categorie: 'annonce', action: etat === 'actif' ? 'Publication d’un message officiel' : 'Programmation d’un message officiel', objetId: m.id, objetLibelle: m.titre,
    apres: `${audience} · du ${m.debut.slice(0, 16).replace('T', ' ')} au ${m.fin.slice(0, 16).replace('T', ' ')}`, motif: actions.join(' / ') });
  res.json({ ...m, etat });
});

router.post('/api/officiels/:id/retirer', A.exigerRole('agent', 'admin'), (req, res) => {
  const m = docs.get(COL, req.params.id);
  if (!m) return erreur(res, 404, 'Message introuvable.');
  if (etatDe(m) === 'retire' || etatDe(m) === 'termine') return erreur(res, 409, 'Ce message n’est déjà plus affiché.');
  const maj = docs.patch(COL, m.id, { statut: 'retire', retireLe: maintenant(), retirePar: `${req.user.prenom} ${req.user.nom}` });
  audit(req.user, { categorie: 'annonce', action: 'Retrait d’un message officiel', objetId: m.id, objetLibelle: m.titre, avant: etatDe(m), apres: 'retire', motif: texte((req.body || {}).motif, 300) });
  res.json({ ...maj, etat: 'retire' });
});

// « J'ai compris » : enregistré pour le compte connecté ; un visiteur est compté par appareil (le navigateur garde la trace).
// Visiteurs : une seule écriture par (IP masquée, message) sur 24 h, pour que le compteur ne soit pas gonflable en boucle.
const { ipMasquee } = require('../bouclier');
const comprisAnonymes = new Map();   // "ip|message" → horodatage
const COMPRIS_FENETRE = 24 * 3600e3;
setInterval(() => { const t = Date.now(); for (const [k, v] of comprisAnonymes) if (t - v > COMPRIS_FENETRE) comprisAnonymes.delete(k); }, 3600e3).unref();
router.post('/api/officiels/:id/compris', (req, res) => {
  const m = docs.get(COL, req.params.id);
  if (!m || etatDe(m) !== 'actif') return erreur(res, 404, 'Ce message n’est plus en cours.');
  const u = req.user;
  if (u) {
    if (!(m.accuses || []).some((a) => a.userId === u.id)) docs.patch(COL, m.id, { accuses: (m.accuses || []).concat([{ userId: u.id, date: maintenant() }]) });
  } else if (!(req.body || {}).dejaCompte) {
    const cle = `${ipMasquee(req.ip)}|${m.id}`;
    if (Date.now() - (comprisAnonymes.get(cle) || 0) > COMPRIS_FENETRE) { comprisAnonymes.set(cle, Date.now()); docs.patch(COL, m.id, { accusesAppareils: (m.accusesAppareils || 0) + 1 }); }
  }
  res.json({ ok: true, compris: true, date: maintenant() });
});

module.exports = router;
module.exports.actifsPour = actifsPour;
module.exports.vuePublique = vuePublique;   // vague 21 : même vue pour le « pouls » (src/continuite.js)
