// Vague 12 : « Participer » — consultations du Haut Conseil (F65), avis consultatifs sur les projets (F66),
// projets de la ville (F67) et idées des habitants (F68). Toutes les règles de droits sont appliquées ici :
// un habitant = un avis par consultation (une nouvelle réponse remplace l'ancienne, même reçu),
// seuls agents / admins créent, clôturent, publient une décision, mettent à jour un projet ou traitent une idée.
const router = require('express').Router();
const { docs, audit, notifier, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const nomDe = (u) => `${u.prenom} ${u.nom}`;
const num = (prefixe, nom) => `${prefixe}-${String(docs.prochainNumero(nom, 0)).padStart(4, '0')}`;

const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const OPTIONS_PROJET = [{ id: 'favorable', libelle: 'Favorable' }, { id: 'mitige', libelle: 'Mitigé' }, { id: 'defavorable', libelle: 'Défavorable' }];
const STATUTS_PROJET = { etude: 'À l’étude', travaux: 'En travaux', termine: 'Terminé' };
const STATUTS_IDEE = { recue: 'Reçue', etude: 'À l’étude', retenue: 'Retenue', non_retenue: 'Non retenue' };
const CATEGORIES_IDEE = ['cadre', 'mobilite', 'environnement', 'culture', 'solidarite', 'numerique', 'autre'];

/* ---------- Consultations ---------- */
const RANG = { ouverte: 0, close: 1, decidee: 2 };   // ouvertes d'abord (échéance la plus proche), puis closes, puis décidées
function etatConsultation(c) {
  if (c.decision) return 'decidee';
  if (c.statut === 'close' || Date.parse(c.echeance) <= Date.now()) return 'close';
  return 'ouverte';
}
function vueConsultation(c, u, tousAvis) {
  const staff = A.estPersonnel(u);
  const avis = tousAvis.filter((a) => a.consultationId === c.id);
  const etat = etatConsultation(c);
  const v = { ...c, etat, participants: avis.length };
  delete v.creePar;
  // les résultats ne sont publiés qu'après la clôture, pour ne pas influencer les réponses (le personnel les suit en direct)
  if (etat !== 'ouverte' || staff) v.resultats = c.options.map((o) => ({ option: o.id, n: avis.filter((a) => a.option === o.id).length }));
  if (staff) v.commentaires = avis.filter((a) => a.commentaire).map((a) => ({ option: a.option, commentaire: a.commentaire, date: a.maj || a.cree }));
  if (u && u.role === 'citoyen') v.monAvis = avis.find((a) => a.userId === u.id) || null;
  return v;
}

/* ---------- Idées ---------- */
const ideePublique = (i) => ({ id: i.id, titre: i.titre, quartier: i.quartier, categorie: i.categorie, statut: i.statut, motif: i.statut === 'non_retenue' || i.statut === 'retenue' ? i.motif || '' : '', cree: i.cree });

/* ---------- Lecture : tout ce que le profil peut voir de la participation ---------- */
router.get('/api/participation', (req, res) => {
  const u = req.user;
  const staff = A.estPersonnel(u);
  const tousAvis = docs.tous('avis');
  const idees = docs.tous('idees');
  const consultations = docs.tous('consultations').map((c) => vueConsultation(c, u, tousAvis))
    .sort((a, b) => RANG[a.etat] - RANG[b.etat] || (a.etat === 'ouverte' ? a.echeance.localeCompare(b.echeance) : b.cree.localeCompare(a.cree)));
  const projets = docs.tous('projets').map((p) => ({ ...p, consultations: consultations.filter((c) => c.projetId === p.id).map((c) => ({ id: c.id, titre: c.titre, etat: c.etat })) }));
  const nomAuteur = (id) => { const p = id && docs.get('utilisateurs', id); return p ? nomDe(p) : '—'; };
  res.set('Cache-Control', 'no-store');
  res.json({
    consultations, projets,
    ideesPubliques: idees.filter((i) => i.statut !== 'recue').map(ideePublique).reverse(),
    mesIdees: u && u.role === 'citoyen' ? idees.filter((i) => i.userId === u.id).reverse() : [],
    ideesRecues: staff ? idees.map((i) => ({ ...i, auteur: nomAuteur(i.userId) })).reverse() : []
  });
});

// Ma participation (espace citoyen) : mes reçus d'avis et mes idées
router.get('/api/participation/moi', A.exigerRole('citoyen'), (req, res) => {
  const u = req.user;
  const avis = docs.tous('avis').filter((a) => a.userId === u.id).map((a) => {
    const c = docs.get('consultations', a.consultationId);
    const o = c && c.options.find((x) => x.id === a.option);
    return { ...a, consultation: c ? { id: c.id, titre: c.titre, type: c.type, etat: etatConsultation(c), echeance: c.echeance } : null, reponse: o ? o.libelle : a.option };
  }).reverse();
  res.set('Cache-Control', 'no-store');
  res.json({ avis, idees: docs.tous('idees').filter((i) => i.userId === u.id).reverse() });
});

// F65 : création d'une consultation (personnel uniquement)
router.post('/api/consultations', A.exigerRole('agent', 'admin'), (req, res) => {
  const b = req.body || {};
  const type = b.type === 'projet' ? 'projet' : 'decision';
  const titre = texte(b.titre, 160);
  const question = texte(b.question, 300);
  const contexte = texte(b.contexte, 3000);
  const echeance = Date.parse(b.echeance);
  const projet = b.projetId ? docs.get('projets', b.projetId) : null;
  if (titre.length < 5 || question.length < 5) return erreur(res, 400, 'Indiquez un titre et une question (5 caractères minimum).');
  if (!contexte) return erreur(res, 400, 'Expliquez le contexte en quelques phrases.');
  if (!echeance || echeance <= Date.now()) return erreur(res, 400, 'La date limite doit être dans le futur.');
  if (b.projetId && !projet) return erreur(res, 400, 'Projet introuvable.');
  let options = OPTIONS_PROJET;
  if (type === 'decision') {
    const libelles = (Array.isArray(b.options) ? b.options : []).map((o) => texte(o, 120)).filter(Boolean);
    if (libelles.length < 2 || libelles.length > 6) return erreur(res, 400, 'Proposez entre 2 et 6 réponses possibles.');
    options = libelles.map((libelle, i) => ({ id: 'o' + (i + 1), libelle }));
  }
  const c = docs.put('consultations', { id: num('CON', 'consultations'), cree: maintenant(), type, titre, question, contexte, options,
    projetId: projet ? projet.id : '', quartier: QUARTIERS.includes(b.quartier) ? b.quartier : 'Toute la ville',
    decideur: texte(b.decideur, 120) || 'Haut Conseil de la Ville', ouverture: maintenant(), echeance: new Date(echeance).toISOString(),
    statut: 'ouverte', decision: null, creePar: req.user.id });
  audit(req.user, { categorie: 'consultation', action: 'Ouverture d’une consultation', objetId: c.id, objetLibelle: c.titre, apres: `Ouverte jusqu’au ${c.echeance.slice(0, 10)}`, motif: c.question });
  res.json(vueConsultation(c, req.user, []));
});

// F65 / F66 : donner (ou modifier) son avis — un seul avis par habitant et par consultation
router.post('/api/consultations/:id/avis', A.exigerRole('citoyen'), (req, res) => {
  const c = docs.get('consultations', req.params.id);
  if (!c) return erreur(res, 404, 'Consultation introuvable.');
  if (etatConsultation(c) !== 'ouverte') return erreur(res, 409, 'Cette consultation est close : il n’est plus possible de donner ou de modifier un avis.');
  const b = req.body || {};
  const option = c.options.find((o) => o.id === b.option);
  if (!option) return erreur(res, 400, 'Choisissez une des réponses proposées.');
  const commentaire = texte(b.commentaire, 500);
  const avant = docs.tous('avis').find((a) => a.consultationId === c.id && a.userId === req.user.id);
  let avis;
  if (avant) {
    avis = docs.patch('avis', avant.id, { option: option.id, commentaire, maj: maintenant(), modifications: (avant.modifications || 0) + 1 });
    notifier(req.user.id, `Avis ${avis.id} modifié`, `Votre nouvelle réponse « ${option.libelle} » remplace la précédente pour « ${c.titre} ».`, 'participer.html#' + c.id, 'info');
  } else {
    avis = docs.put('avis', { id: num('AVI', 'avis'), cree: maintenant(), maj: maintenant(), consultationId: c.id, userId: req.user.id, option: option.id, commentaire, modifications: 0 });
    notifier(req.user.id, `Avis ${avis.id} enregistré`, `Votre réponse « ${option.libelle} » à « ${c.titre} » est enregistrée. Vous serez prévenu de la décision du ${c.decideur}.`, 'participer.html#' + c.id, 'info');
  }
  res.json({ ok: true, modifie: !!avant, avis, reponse: option.libelle, participants: docs.tous('avis').filter((a) => a.consultationId === c.id).length });
});

// F65 : clôture anticipée ou à l'échéance (personnel)
router.post('/api/consultations/:id/clore', A.exigerRole('agent', 'admin'), (req, res) => {
  const c = docs.get('consultations', req.params.id);
  if (!c) return erreur(res, 404, 'Consultation introuvable.');
  if (c.statut === 'close') return erreur(res, 409, 'Cette consultation est déjà close.');
  const maj = docs.patch('consultations', c.id, { statut: 'close', clotureLe: maintenant() });
  const avis = docs.tous('avis').filter((a) => a.consultationId === c.id);
  audit(req.user, { categorie: 'consultation', action: 'Clôture d’une consultation', objetId: c.id, objetLibelle: c.titre, avant: 'Ouverte', apres: 'Close', motif: `${avis.length} avis reçus` });
  for (const a of avis) notifier(a.userId, `Consultation close : ${c.titre}`, `Les résultats sont publiés. Le ${c.decideur} va rendre sa décision.`, 'participer.html#' + c.id, 'info');
  res.json(vueConsultation(maj, req.user, docs.tous('avis')));
});

// F65 : décision finale et « comment vos avis ont été pris en compte » (personnel)
router.post('/api/consultations/:id/decision', A.exigerRole('agent', 'admin'), (req, res) => {
  const c = docs.get('consultations', req.params.id);
  if (!c) return erreur(res, 404, 'Consultation introuvable.');
  if (etatConsultation(c) === 'ouverte') return erreur(res, 409, 'Clôturez d’abord la consultation avant de publier la décision.');
  const b = req.body || {};
  const decision = texte(b.decision, 2000);
  const priseEnCompte = texte(b.priseEnCompte, 2000);
  if (decision.length < 10 || priseEnCompte.length < 10) return erreur(res, 400, 'Rédigez la décision et la façon dont les avis ont été pris en compte (10 caractères minimum chacun).');
  const maj = docs.patch('consultations', c.id, { statut: 'close', clotureLe: c.clotureLe || maintenant(), decision: { texte: decision, priseEnCompte, date: maintenant(), par: nomDe(req.user) } });
  audit(req.user, { categorie: 'consultation', action: 'Publication d’une décision', objetId: c.id, objetLibelle: c.titre, avant: 'Close', apres: 'Décision publiée', motif: decision });
  for (const a of docs.tous('avis').filter((x) => x.consultationId === c.id)) {
    notifier(a.userId, `Décision publiée : ${c.titre}`, `Le ${c.decideur} a rendu sa décision. Découvrez comment votre avis ${a.id} a été pris en compte.`, 'participer.html#' + c.id, 'importante');
  }
  res.json(vueConsultation(maj, req.user, docs.tous('avis')));
});

/* ---------- F67 : avancement d'un projet (personnel) ---------- */
router.patch('/api/projets/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const p = docs.get('projets', req.params.id);
  if (!p) return erreur(res, 404, 'Projet introuvable.');
  const b = req.body || {};
  const statut = STATUTS_PROJET[b.statut] ? b.statut : p.statut;
  const avancement = b.avancement === undefined || b.avancement === '' ? p.avancement : Math.max(0, Math.min(100, Math.round(Number(b.avancement))));
  if (!Number.isFinite(avancement)) return erreur(res, 400, 'L’avancement est un pourcentage entre 0 et 100.');
  const prochaineEtape = b.prochaineEtape === undefined ? p.prochaineEtape : texte(b.prochaineEtape, 300);
  const note = texte(b.note, 500);
  const fin = statut === 'termine' ? 100 : avancement;
  const maj = docs.patch('projets', p.id, { statut, avancement: fin, prochaineEtape, majLe: maintenant(),
    historique: (p.historique || []).concat([{ date: maintenant(), statut, avancement: fin, note: note || 'Avancement mis à jour.', par: nomDe(req.user) }]) });
  audit(req.user, { categorie: 'projet', action: 'Mise à jour d’un projet', objetId: p.id, objetLibelle: p.titre,
    avant: `${STATUTS_PROJET[p.statut]} · ${p.avancement} %`, apres: `${STATUTS_PROJET[statut]} · ${fin} %`, motif: note });
  // les habitants qui ont donné leur avis sur ce projet sont prévenus quand il change d'étape
  if (statut !== p.statut) {
    const consultations = docs.tous('consultations').filter((c) => c.projetId === p.id).map((c) => c.id);
    const habitants = new Set(docs.tous('avis').filter((a) => consultations.includes(a.consultationId)).map((a) => a.userId));
    for (const id of habitants) notifier(id, `Le projet « ${p.titre} » avance`, `Nouvelle étape : ${STATUTS_PROJET[statut]}.${note ? ' ' + note : ''}`, 'participer.html#' + p.id, 'info');
  }
  res.json(maj);
});

/* ---------- F68 : idées des habitants ---------- */
router.post('/api/idees', A.exigerRole('citoyen'), (req, res) => {
  const b = req.body || {};
  const titre = texte(b.titre, 120);
  const description = texte(b.description, 2000);
  if (titre.length < 5) return erreur(res, 400, 'Donnez un titre à votre idée (5 caractères minimum).');
  if (description.length < 20) return erreur(res, 400, 'Décrivez votre idée en quelques phrases (20 caractères minimum).');
  const i = docs.put('idees', { id: num('IDE', 'idees'), cree: maintenant(), userId: req.user.id, titre, description,
    quartier: QUARTIERS.includes(b.quartier) ? b.quartier : 'Toute la ville', categorie: CATEGORIES_IDEE.includes(b.categorie) ? b.categorie : 'autre',
    statut: 'recue', motif: '', historique: [{ date: maintenant(), statut: 'recue', note: 'Idée enregistrée et transmise au Service Projets.', par: 'Système' }] });
  notifier(req.user.id, `Idée ${i.id} bien reçue`, `« ${i.titre} » est transmise au Service Projets. Vous serez prévenu à chaque changement de statut.`, 'participer.html#' + i.id, 'info');
  res.json(i);
});

router.patch('/api/idees/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const i = docs.get('idees', req.params.id);
  if (!i) return erreur(res, 404, 'Idée introuvable.');
  const b = req.body || {};
  if (!STATUTS_IDEE[b.statut]) return erreur(res, 400, 'Statut inconnu.');
  const motif = texte(b.motif, 1000);
  if (b.statut === 'non_retenue' && motif.length < 10) return erreur(res, 400, 'Expliquez à l’habitant pourquoi son idée n’est pas retenue (10 caractères minimum).');
  const maj = docs.patch('idees', i.id, { statut: b.statut, motif: motif || (b.statut === i.statut ? i.motif : ''),
    historique: i.historique.concat([{ date: maintenant(), statut: b.statut, note: motif, par: nomDe(req.user) }]) });
  audit(req.user, { categorie: 'idee', action: 'Traitement d’une idée', objetId: i.id, objetLibelle: i.titre, avant: STATUTS_IDEE[i.statut], apres: STATUTS_IDEE[b.statut], motif });
  if (i.userId) notifier(i.userId, `Votre idée ${i.id} : ${STATUTS_IDEE[b.statut]}`, motif || `« ${i.titre} » change de statut.`, 'participer.html#' + i.id, b.statut === 'recue' || b.statut === 'etude' ? 'info' : 'importante');
  res.json(maj);
});

module.exports = router;
