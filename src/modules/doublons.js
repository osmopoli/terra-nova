// Vague 14 (F75) : repérer vite les demandes qui parlent du même problème et ce qui demande de l'attention.
// Calcul côté serveur, sans bibliothèque : texte normalisé (minuscules, sans accents, mots vides retirés, pluriels ramenés),
// pondération TF-IDF et similarité cosinus, combinée avec le même service, le même quartier et des dates proches.
// Les paires au-dessus du seuil forment des groupes (union-find). Un agent peut rattacher les doublons à une demande principale :
// répondre une fois à la principale met à jour et prévient tous les habitants des demandes rattachées.
const router = require('express').Router();
const { docs, audit, notifier, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const nomDe = (u) => `${u.prenom} ${u.nom}`;
const OUVERTES = new Set(['recue', 'en_cours']);
const JOUR = 864e5;

const VIDES = new Set(('le la les un une des du de d l au aux et ou en dans sur sous par pour avec sans chez ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs ' +
  'je tu il elle on nous vous ils elles me te se y a ai as avons avez ont est sont etre suis es etes etait ete fait faire depuis plus moins tres tout tous toute toutes ' +
  'pas ne n qui que quoi dont ou quand comment car mais donc ni si deja encore aussi bien merci bonjour svp sil plait madame monsieur jour jours fois depuis hier soir matin ' +
  'qu c s j m t devant pres cote niveau quartier rue allee avenue place numero n°').split(/\s+/));

function jetons(txt) {
  return String(txt || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter((m) => m.length >= 3 && !VIDES.has(m) && !/^\d+$/.test(m))
    .map((m) => (m.length > 4 ? m.replace(/(aux|eaux|s|x)$/, (s) => (s === 'aux' ? 'al' : s === 'eaux' ? 'eau' : '')) : m));
}

// Vecteurs TF-IDF sur l'ensemble des demandes ouvertes (IDF lissé)
function vecteurs(liste) {
  const tf = liste.map((d) => { const v = new Map(); for (const m of jetons(`${d.objet} ${d.objet} ${d.message} ${d.lieu || ''}`)) v.set(m, (v.get(m) || 0) + 1); return v; });
  const df = new Map();
  tf.forEach((v) => v.forEach((_, m) => df.set(m, (df.get(m) || 0) + 1)));
  const N = liste.length;
  return tf.map((v) => {
    const w = new Map(); let norme = 0;
    v.forEach((n, m) => { const x = (1 + Math.log(n)) * Math.log(1 + N / df.get(m)); w.set(m, x); norme += x * x; });
    return { w, norme: Math.sqrt(norme) || 1 };
  });
}
function cosinus(a, b) {
  let s = 0;
  const [p, g] = a.w.size < b.w.size ? [a, b] : [b, a];
  p.w.forEach((x, m) => { const y = g.w.get(m); if (y) s += x * y; });
  return s / (a.norme * b.norme);
}
const quartierDe = (d) => d.quartier || ((d.userId && docs.get('utilisateurs', d.userId)) || {}).quartier || '';

// Score de ressemblance entre deux demandes (0 à 1) et raisons lisibles par l'agent
function ressemblance(a, b, va, vb) {
  const texteSim = cosinus(va, vb);
  const memeService = !!a.serviceId && a.serviceId === b.serviceId;
  const qa = quartierDe(a), qb = quartierDe(b);
  const memeQuartier = !!qa && qa === qb;
  const ecartJours = Math.abs(Date.parse(a.cree) - Date.parse(b.cree)) / JOUR;
  const proximite = ecartJours <= 3 ? 1 : ecartJours >= 21 ? 0 : 1 - (ecartJours - 3) / 18;
  const score = 0.6 * texteSim + 0.15 * (memeService ? 1 : 0) + 0.15 * (memeQuartier ? 1 : 0) + 0.1 * proximite;
  return { score, texteSim, memeService, memeQuartier, ecartJours };
}
const SEUIL = 0.5, SEUIL_TEXTE = 0.25;

// Groupes de demandes semblables parmi les demandes ouvertes (les demandes déjà rattachées rejoignent le groupe de leur principale)
function groupes() {
  const toutes = docs.tous('demandes');
  const parId = new Map(toutes.map((d) => [d.id, d]));
  const ouvertes = toutes.filter((d) => OUVERTES.has(d.statut) && !d.principale);
  const v = vecteurs(ouvertes);
  const parent = ouvertes.map((_, i) => i);
  const racine = (i) => (parent[i] === i ? i : (parent[i] = racine(parent[i])));
  const liens = [];
  for (let i = 0; i < ouvertes.length; i++) {
    for (let j = i + 1; j < ouvertes.length; j++) {
      const a = ouvertes[i], b = ouvertes[j];
      if (a.type === 'demarche' || b.type === 'demarche') continue;   // une démarche administrative est personnelle : jamais fusionnée
      if (a.serviceId && b.serviceId && a.serviceId !== b.serviceId) continue;
      const r = ressemblance(a, b, v[i], v[j]);
      if (r.score >= SEUIL && r.texteSim >= SEUIL_TEXTE) { parent[racine(i)] = racine(j); liens.push([a.id, b.id, r]); }
    }
  }
  const paquets = new Map();
  ouvertes.forEach((d, i) => { const r = racine(i); if (!paquets.has(r)) paquets.set(r, []); paquets.get(r).push(d); });
  // une principale avec des rattachées forme toujours un groupe, même seule parmi les ouvertes
  const res = [];
  for (const membres of paquets.values()) {
    const rattachees = membres.flatMap((d) => (d.liees || []).map((id) => parId.get(id)).filter(Boolean));
    if (membres.length + rattachees.length < 2) continue;
    // demande principale proposée : déjà principale, sinon la plus ancienne (premier signalement)
    const triees = membres.slice().sort((x, y) => (y.liees || []).length - (x.liees || []).length || x.cree.localeCompare(y.cree));
    const principale = triees[0];
    const ids = new Set(membres.map((d) => d.id));
    const scores = liens.filter(([x, y]) => ids.has(x) && ids.has(y)).map(([, , r]) => r.score);
    const tousMembres = membres.concat(rattachees);
    const quartiers = [...new Set(tousMembres.map(quartierDe).filter(Boolean))];
    const mots = new Map();
    membres.forEach((d) => new Set(jetons(d.objet)).forEach((m) => mots.set(m, (mots.get(m) || 0) + 1)));
    res.push({
      id: 'GRP-' + principale.id, principale: principale.id, taille: tousMembres.length,
      demandes: membres.map((d) => d.id), rattachees: rattachees.map((d) => d.id), aRattacher: membres.filter((d) => d.id !== principale.id && !(principale.liees || []).includes(d.id)).map((d) => d.id),
      serviceId: principale.serviceId || '', quartiers, objet: principale.objet,
      motsCles: [...mots.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m]) => m),
      score: scores.length ? Math.round(100 * Math.max(...scores)) / 100 : 1,
      premier: tousMembres.reduce((m, d) => (d.cree < m ? d.cree : m), principale.cree),
      dernier: tousMembres.reduce((m, d) => (d.cree > m ? d.cree : m), principale.cree),
      urgente: tousMembres.some((d) => d.priorite === 'haute' || d.priorite === 'urgente'),
      habitants: new Set(tousMembres.map((d) => d.userId || d.contactEmail || d.id)).size
    });
  }
  return res.sort((a, b) => b.taille - a.taille || a.premier.localeCompare(b.premier));
}

router.get('/api/demandes/groupes', A.exigerRole('agent', 'admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ calcule: maintenant(), seuil: SEUIL, groupes: groupes() });
});

// Demandes semblables à une demande précise (tiroir de traitement), même en dessous du seuil de groupe
router.get('/api/demandes/:id/semblables', A.exigerRole('agent', 'admin'), (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d) return erreur(res, 404, 'Demande introuvable.');
  const autres = docs.tous('demandes').filter((x) => x.id !== d.id && (OUVERTES.has(x.statut) || x.principale === d.id || (d.liees || []).includes(x.id)));
  const v = vecteurs([d].concat(autres));
  res.set('Cache-Control', 'no-store');
  res.json(autres.map((x, i) => ({ id: x.id, r: ressemblance(d, x, v[0], v[i + 1]), x }))
    .filter(({ x, r }) => x.principale === d.id || (r.score >= 0.4 && r.texteSim >= 0.2 && x.type !== 'demarche' && d.type !== 'demarche'))
    .sort((a, b) => b.r.score - a.r.score).slice(0, 8)
    .map(({ x, r }) => ({ id: x.id, objet: x.objet, statut: x.statut, quartier: quartierDe(x), serviceId: x.serviceId, cree: x.cree, rattachee: x.principale === d.id,
      principale: x.principale || '', estPrincipale: (x.liees || []).length > 0, score: Math.round(r.score * 100) / 100, memeService: r.memeService, memeQuartier: r.memeQuartier, ecartJours: Math.round(r.ecartJours * 10) / 10 })));
});

// Rattacher des doublons à une demande principale (personnel uniquement)
router.post('/api/demandes/:id/lier', A.exigerRole('agent', 'admin'), (req, res) => {
  const p = docs.get('demandes', req.params.id);
  if (!p) return erreur(res, 404, 'Demande principale introuvable.');
  if (p.principale) return erreur(res, 409, `Cette demande est déjà rattachée à ${p.principale} : choisissez la demande principale.`);
  const ids = [...new Set((Array.isArray((req.body || {}).ids) ? req.body.ids : []).map(String))].filter((id) => id !== p.id).slice(0, 50);
  if (!ids.length) return erreur(res, 400, 'Choisissez au moins une demande à rattacher.');
  const cibles = ids.map((id) => docs.get('demandes', id));
  if (cibles.some((x) => !x)) return erreur(res, 404, 'Une des demandes est introuvable.');
  if (cibles.some((x) => x.type === 'demarche')) return erreur(res, 400, 'Une démarche administrative est personnelle : elle ne peut pas être rattachée.');
  if (cibles.some((x) => (x.liees || []).length)) return erreur(res, 409, 'Une des demandes est elle-même principale d’un groupe : rattachez plutôt ce groupe à elle.');
  const ailleurs = cibles.find((x) => x.principale && x.principale !== p.id);
  if (ailleurs) return erreur(res, 409, `La demande ${ailleurs.id} est déjà rattachée à ${ailleurs.principale}.`);
  const par = nomDe(req.user);
  for (const x of cibles) {
    if (x.principale === p.id) continue;
    docs.patch('demandes', x.id, { principale: p.id, statut: p.statut === 'recue' ? x.statut : p.statut, agent: p.agent || x.agent || par,
      historique: (x.historique || []).concat([{ date: maintenant(), statut: p.statut === 'recue' ? x.statut : p.statut,
        note: `Votre demande concerne le même problème que la demande ${p.id} : elles sont traitées ensemble. Vous recevrez la même réponse, sans rien refaire.`, par }]) });
    if (x.userId) notifier(x.userId, `Votre demande ${x.id} est traitée avec d’autres`, `D’autres habitants ont signalé le même problème (« ${p.objet} »). Les demandes sont regroupées : vous serez prévenu de chaque réponse.`, 'suivi.html?id=' + x.id, 'info');
  }
  const liees = [...new Set((p.liees || []).concat(ids))];
  const maj = docs.patch('demandes', p.id, { liees, historique: (p.historique || []).concat([{ date: maintenant(), statut: p.statut, note: `${ids.length} demande(s) d’autres habitants sur le même problème rattachée(s) à celle-ci : une seule réponse pour tous.`, par, interne: true }]) });
  audit(req.user, { categorie: 'demande', action: 'Rattachement de demandes semblables', objetId: p.id, objetLibelle: p.objet, avant: `${(p.liees || []).length} rattachée(s)`, apres: `${liees.length} rattachée(s)`, motif: ids.join(', ') });
  res.json({ ok: true, principale: maj, rattachees: liees });
});

router.post('/api/demandes/:id/delier', A.exigerRole('agent', 'admin'), (req, res) => {
  const x = docs.get('demandes', req.params.id);
  if (!x || !x.principale) return erreur(res, 404, 'Cette demande n’est rattachée à aucune autre.');
  const p = docs.get('demandes', x.principale);
  docs.patch('demandes', x.id, { principale: '', historique: (x.historique || []).concat([{ date: maintenant(), statut: x.statut, note: 'Votre demande est de nouveau traitée séparément.', par: nomDe(req.user) }]) });
  if (p) docs.patch('demandes', p.id, { liees: (p.liees || []).filter((id) => id !== x.id) });
  audit(req.user, { categorie: 'demande', action: 'Détachement d’une demande', objetId: x.id, objetLibelle: x.objet, avant: `rattachée à ${x.principale}`, apres: 'séparée' });
  res.json({ ok: true });
});

/* Répondre une fois : quand le personnel change l'état de la demande principale ou y ajoute une réponse, les demandes rattachées
   suivent (même état, même note) et chaque habitant concerné est prévenu. Appelé par la route PATCH /api/docs/demandes/:id. */
function propager(avant, apres, acteur) {
  if (!apres || !(apres.liees || []).length) return 0;
  const hA = avant.historique || [], hB = apres.historique || [];
  const nouvelles = hB.slice(hA.length).filter((h) => !h.interne);
  const changeStatut = apres.statut !== avant.statut;
  if (!changeStatut && !nouvelles.length) return 0;
  const derniere = nouvelles[nouvelles.length - 1] || { note: '' };
  let n = 0;
  for (const id of apres.liees) {
    const x = docs.get('demandes', id);
    if (!x || x.principale !== apres.id) continue;
    const note = derniere.note ? `${derniere.note} (réponse commune à la demande ${apres.id})` : `Mise à jour commune à la demande ${apres.id}.`;
    docs.patch('demandes', x.id, { statut: apres.statut, agent: apres.agent || x.agent, historique: (x.historique || []).concat([{ date: maintenant(), statut: apres.statut, note, par: derniere.par || (acteur ? nomDe(acteur) : 'Service') }]) });
    if (x.userId) notifier(x.userId, `Votre demande ${x.id} avance`, `Nouveau statut : ${({ recue: 'Reçue', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' })[apres.statut] || apres.statut}${derniere.note ? ' — ' + derniere.note : ''}`, 'suivi.html?id=' + x.id, apres.statut === 'traitee' ? 'importante' : 'info');
    n++;
  }
  return n;
}

module.exports = router;
module.exports.propager = propager;
module.exports.groupes = groupes;
module.exports._jetons = jetons;
