// Vague 15 (F80) : repérer et classer les dossiers prioritaires dans l'espace des agents.
// Niveau calculé par le serveur (Critique / Haute / Normale / Basse) à partir de critères lisibles : mots d'urgence,
// service concerné (santé, eau et énergie, aide sociale…), ancienneté, demandes semblables rattachées ou groupées (F75),
// personne vulnérable, soutiens d'autres habitants, urgence déclarée. Chaque point du score a sa raison, affichée à l'agent.
// Un agent peut corriger le niveau avec une justification obligatoire : la correction est conservée sur le dossier et
// inscrite au journal d'audit (F47). Rôles contrôlés par le serveur : citoyen 403, visiteur 401.
const router = require('express').Router();
const { docs, audit, maintenant } = require('../donnees');
const A = require('../auth');

const NIVEAUX = ['critique', 'haute', 'normale', 'basse'];
const SEUILS = { critique: 75, haute: 40, normale: 15 };
const OUVERTES = new Set(['recue', 'en_cours']);
const JOUR = 864e5;
const sansAccent = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Mots d'urgence (comparés sans accents, mot entier ou début de mot)
const MOTS_CRITIQUES = ['gaz', 'incendie', 'feu', 'fumee', 'electrocut', 'fil electrique', 'cable electrique', 'cable tombe', 'blesse', 'blessure', 'effondr', 'inond',
  'noyade', 'agression', 'malaise', 'evanoui', 'explosion', 'court-circuit', 'urgence vitale', 'personne agee seule', 'sans eau depuis'];
const MOTS_HAUTS = ['urgent', 'danger', 'fuite', 'coupure', 'panne', 'sans eau', 'sans electricite', 'chauffage', 'ascenseur', 'trou', 'chute', 'tombe', 'enfant', 'ecole',
  'medicament', 'soin', 'odeur', 'rat', 'insalubre', 'moisissure', 'expulsion'];
const SERVICES = { sante: 20, 'eau-energie': 15, social: 12, logement: 8, voirie: 5, education: 5 };
const cherche = (texte, mots) => mots.find((m) => new RegExp(`(^|[^a-z0-9])${m.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`).test(texte));

function calculer(d, ctx) {
  const raisons = [];
  const ajouter = (code, points, extra) => raisons.push(Object.assign({ code, points }, extra || {}));
  const texte = sansAccent(`${d.objet} ${d.message} ${d.lieu || ''}`);
  if (!OUVERTES.has(d.statut)) {
    ajouter('terminee', 0);
    return { niveau: 'basse', score: 0, raisons };
  }
  const motC = cherche(texte, MOTS_CRITIQUES);
  if (motC) ajouter('mot', 45, { mot: motC });
  else { const motH = cherche(texte, MOTS_HAUTS); if (motH) ajouter('mot', 15, { mot: motH }); }
  if (SERVICES[d.serviceId]) ajouter('service', SERVICES[d.serviceId], { service: d.serviceId });
  if (d.priorite === 'haute' || d.priorite === 'urgente') ajouter('declaree', 15);
  const auteur = d.userId ? ctx.utilisateurs.get(d.userId) : null;
  if (auteur && auteur.vulnerable) ajouter('vulnerable', 25);
  const attente = Math.floor((Date.now() - Date.parse(d.cree)) / JOUR);
  if (attente >= 10) ajouter('attente', 30, { jours: attente });
  else if (attente >= 5) ajouter('attente', 20, { jours: attente });
  else if (attente >= 2) ajouter('attente', 10, { jours: attente });
  const g = ctx.groupeDe.get(d.id);
  const taille = Math.max(g ? g.taille : 0, (d.liees || []).length + 1);
  if (taille >= 3) ajouter('groupe', 15, { n: taille });
  else if (taille === 2) ajouter('groupe', 8, { n: taille });
  const soutiens = (d.soutiens || []).length;
  if (soutiens >= 3) ajouter('soutiens', 10, { n: soutiens });
  else if (soutiens >= 1) ajouter('soutiens', 4, { n: soutiens });
  if (d.type === 'contact' && !raisons.some((r) => r.code === 'mot')) ajouter('question', -10);
  const score = raisons.reduce((s, r) => s + r.points, 0);
  const niveau = score >= SEUILS.critique ? 'critique' : score >= SEUILS.haute ? 'haute' : score >= SEUILS.normale ? 'normale' : 'basse';
  return { niveau, score, raisons };
}

// Calcul pour toutes les demandes, mémorisé tant qu'aucune donnée ne change (les groupes F75 sont coûteux)
let memo = null;
function tout() {
  const v = docs.version();
  if (memo && memo.v === v && Date.now() - memo.t < 60000) return memo.r;
  const demandes = docs.tous('demandes');
  const utilisateurs = new Map(docs.tous('utilisateurs').map((u) => [u.id, u]));
  const groupeDe = new Map();
  try { for (const g of require('./doublons').groupes()) for (const id of g.demandes.concat(g.rattachees)) groupeDe.set(id, g); } catch (e) { console.error('[priorites] groupes', e.message); }
  const ctx = { utilisateurs, groupeDe };
  const r = new Map();
  for (const d of demandes) {
    const c = calculer(d, ctx);
    const manuel = d.prioriteDossier && NIVEAUX.includes(d.prioriteDossier.niveau) ? d.prioriteDossier : null;
    r.set(d.id, { niveau: manuel ? manuel.niveau : c.niveau, auto: c.niveau, score: c.score, raisons: c.raisons, manuel, agent: d.agent || '', ouverte: OUVERTES.has(d.statut) });
  }
  memo = { v, t: Date.now(), r };
  return r;
}

router.get('/api/demandes/priorites', A.exigerRole('agent', 'admin'), (req, res) => {
  const r = tout();
  const moi = `${req.user.prenom} ${req.user.nom}`;
  const compte = { critique: 0, haute: 0, normale: 0, basse: 0 };
  const mes = [], aPrendre = [];
  for (const [id, p] of r) {
    if (!p.ouverte) continue;
    compte[p.niveau]++;
    if (p.niveau === 'critique' || p.niveau === 'haute') (p.agent === moi ? mes : !p.agent ? aPrendre : []).push(id);
  }
  const ordre = (a, b) => NIVEAUX.indexOf(r.get(a).niveau) - NIVEAUX.indexOf(r.get(b).niveau) || r.get(b).score - r.get(a).score;
  res.set('Cache-Control', 'no-store');
  res.json({ calcule: maintenant(), seuils: SEUILS, compte, mes: mes.sort(ordre), aPrendre: aPrendre.sort(ordre), niveaux: Object.fromEntries(r) });
});

// Corriger le niveau d'un dossier (ou revenir au calcul automatique) avec une justification, journalisée
router.post('/api/demandes/:id/priorite', A.exigerRole('agent', 'admin'), (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d) return res.status(404).json({ erreur: 'Demande introuvable.' });
  const b = req.body || {};
  const niveau = String(b.niveau || '');
  const justification = String(b.justification || '').trim().slice(0, 400);
  if (![...NIVEAUX, 'auto'].includes(niveau)) return res.status(400).json({ erreur: 'Niveau inconnu : critique, haute, normale, basse ou auto.' });
  if (justification.length < 10) return res.status(400).json({ erreur: 'Expliquez pourquoi vous changez la priorité (10 caractères minimum).' });
  const avant = (tout().get(d.id) || {}).niveau || 'normale';
  const prioriteDossier = niveau === 'auto' ? null
    : { niveau, justification, par: `${req.user.prenom} ${req.user.nom}`, parId: req.user.id, date: maintenant() };
  docs.patch('demandes', d.id, { prioriteDossier });
  const apres = (tout().get(d.id) || {}).niveau;
  audit(req.user, { categorie: 'demande', action: niveau === 'auto' ? 'Priorité rendue au calcul automatique' : 'Priorité du dossier modifiée', objetId: d.id, objetLibelle: d.objet,
    avant, apres: niveau === 'auto' ? `auto (${apres})` : niveau, motif: justification });
  res.json({ ok: true, id: d.id, priorite: tout().get(d.id) });
});

module.exports = router;
module.exports.calculer = calculer;
module.exports.tout = tout;
