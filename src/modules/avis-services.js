// Vague 14 (F76) : « Donner mon avis » après avoir utilisé un service (demande traitée, rendez-vous passé ou fiche du service).
// Note de 1 à 5 + commentaire, reçu COM-xxxx, un seul avis par démarche terminée (modifiable, même numéro), statut visible par
// l'habitant (publié / réponse du service / non publié), notification quand le service répond. Le serveur vérifie que la démarche
// appartient bien à l'habitant et qu'elle est terminée ; les coordonnées écrites dans un commentaire sont masquées avant publication.
const router = require('express').Router();
const { docs, audit, notifier, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const nomDe = (u) => `${u.prenom} ${u.nom}`;
const COL = 'avisServices';
const nomService = (id) => { const s = docs.get('services', id); return s ? s.nom.fr : id; };

// Aucune donnée personnelle publiée : e-mails et numéros de téléphone masqués
const masquer = (s) => s.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[adresse masquée]').replace(/(?:\+|\b)\d(?:[\s.-]?\d){7,}\b/g, '[numéro masqué]');
const statutPour = (a) => (a.statut === 'masque' ? 'masque' : a.reponse ? 'repondu' : 'publie');

/* Démarches terminées de l'habitant qui peuvent recevoir un avis */
function demarchesTerminees(u) {
  const t = Date.now();
  const demandes = docs.tous('demandes').filter((d) => d.userId === u.id && (d.statut === 'traitee' || d.statut === 'cloturee') && d.serviceId)
    .map((d) => ({ procedure: 'demande:' + d.id, type: 'demande', ref: d.id, serviceId: d.serviceId, libelle: d.objet, date: ((d.historique || []).filter((h) => h.statut === d.statut).pop() || {}).date || d.cree }));
  const rdv = docs.tous('rdv').filter((r) => r.userId === u.id && r.statut !== 'annule' && Date.parse(r.debut) < t && r.serviceId)
    .map((r) => ({ procedure: 'rdv:' + r.id, type: 'rdv', ref: r.id, serviceId: r.serviceId, libelle: r.libelle || r.motif || 'Rendez-vous', date: r.debut }));
  return demandes.concat(rdv).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
// Une démarche (demande:/rdv:/service:) est-elle terminée et à cet habitant ? Renvoie sa description ou null
function verifierDemarche(u, procedure) {
  const [type, ref] = String(procedure || '').split(/:(.*)/s);
  if (type === 'service') { const s = docs.get('services', ref); return s ? { procedure: 'service:' + s.id, type, ref: s.id, serviceId: s.id, libelle: 'Utilisation du service' } : null; }
  return demarchesTerminees(u).find((d) => d.procedure === procedure) || null;
}

const vueHabitant = (a) => ({ id: a.id, cree: a.cree, maj: a.maj, serviceId: a.serviceId, procedure: a.procedure, procedureLibelle: a.procedureLibelle,
  note: a.note, commentaire: a.commentaire, statut: statutPour(a), reponse: a.reponse || null, modifications: a.modifications || 0, motifModeration: a.statut === 'masque' ? a.motifModeration || '' : '' });

function statsService(serviceId) {
  const l = docs.tous(COL).filter((a) => a.serviceId === serviceId && a.statut !== 'masque');
  const repartition = [1, 2, 3, 4, 5].map((n) => l.filter((a) => a.note === n).length);
  return { serviceId, nombre: l.length, moyenne: l.length ? Math.round((l.reduce((s, a) => s + a.note, 0) / l.length) * 10) / 10 : null, repartition,
    recents: l.filter((a) => a.commentaire).sort((a, b) => b.maj.localeCompare(a.maj)).slice(0, 5)
      .map((a) => ({ note: a.note, commentaire: a.commentaire, date: a.maj, reponse: a.reponse ? { texte: a.reponse.texte, date: a.reponse.date } : null })) };
}

// Moyenne de chaque service (cartes de la page Services)
router.get('/api/avis-services/resume', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(Object.fromEntries(docs.tous('services').map((s) => { const st = statsService(s.id); return [s.id, { nombre: st.nombre, moyenne: st.moyenne }]; })));
});
// Fiche d'un service : moyenne, répartition, commentaires publics récents (sans nom ni coordonnées) ; mes avis et démarches si connecté
router.get('/api/avis-services/service/:id', (req, res) => {
  if (!docs.get('services', req.params.id)) return erreur(res, 404, 'Service introuvable.');
  const u = req.user;
  const r = statsService(req.params.id);
  if (u && u.role === 'citoyen') {
    const mes = docs.tous(COL).filter((a) => a.userId === u.id && a.serviceId === req.params.id);
    r.mesAvis = mes.map(vueHabitant);
    r.aEvaluer = demarchesTerminees(u).filter((d) => d.serviceId === req.params.id && !mes.some((a) => a.procedure === d.procedure));
  }
  res.set('Cache-Control', 'no-store');
  res.json(r);
});
// Espace citoyen : mes avis (avec statut) et mes démarches terminées sans avis
router.get('/api/avis-services/moi', A.exigerRole('citoyen'), (req, res) => {
  const mes = docs.tous(COL).filter((a) => a.userId === req.user.id);
  res.set('Cache-Control', 'no-store');
  res.json({ avis: mes.map(vueHabitant).reverse(), aEvaluer: demarchesTerminees(req.user).filter((d) => !mes.some((a) => a.procedure === d.procedure)),
    demarches: demarchesTerminees(req.user).map((d) => ({ ...d, avis: (mes.find((a) => a.procedure === d.procedure) || {}).id || '' })) });
});

router.post('/api/avis-services', A.exigerRole('citoyen'), (req, res) => {
  const b = req.body || {};
  const d = verifierDemarche(req.user, b.procedure);
  if (!d) return erreur(res, 403, 'Vous pouvez donner votre avis seulement sur vos démarches terminées (demande traitée ou rendez-vous passé).');
  const note = Number(b.note);
  if (!Number.isInteger(note) || note < 1 || note > 5) return erreur(res, 400, 'Choisissez une note de 1 à 5 étoiles.');
  const brut = texte(b.commentaire, 800);
  const commentaire = masquer(brut);
  const avant = docs.tous(COL).find((a) => a.userId === req.user.id && a.procedure === d.procedure);
  let a;
  if (avant) {
    // Un avis retiré par un agent reste retiré (statut conservé) : seule la modération (/moderer) le republie
    a = docs.patch(COL, avant.id, { note, commentaire, maj: maintenant(), modifications: (avant.modifications || 0) + 1, statut: avant.statut });
    notifier(req.user.id, `Avis ${a.id} modifié`, `Votre nouvel avis (${note}/5) sur « ${nomService(d.serviceId)} » remplace le précédent.`
      + (a.statut === 'masque' ? ` Il reste non publié : ${a.motifModeration || 'décision du service'}.` : ''), 'espace.html#mes-avis-services', 'info');
  } else {
    const n = docs.prochainNumero(COL, 0);
    a = docs.put(COL, { id: `COM-${String(n).padStart(4, '0')}`, cree: maintenant(), maj: maintenant(), userId: req.user.id, serviceId: d.serviceId,
      procedure: d.procedure, procedureLibelle: d.libelle, note, commentaire, statut: 'publie', reponse: null, modifications: 0 });
    notifier(req.user.id, `Avis ${a.id} enregistré`, `Merci : votre avis (${note}/5) sur « ${nomService(d.serviceId)} » est publié sans votre nom. Vous serez prévenu si le service vous répond.`, 'espace.html#mes-avis-services', 'info');
  }
  res.json({ ok: true, modifie: !!avant, masque: commentaire !== brut, avis: vueHabitant(a),
    message: a.statut === 'masque' ? `Votre avis reste non publié : ${a.motifModeration || 'décision du service'}.` : '' });
});

// Personnel : tous les avis, avec l'auteur, pour répondre et modérer
router.get('/api/avis-services', A.exigerRole('agent', 'admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(docs.tous(COL).map((a) => { const p = a.userId && docs.get('utilisateurs', a.userId); return { ...a, statutHabitant: statutPour(a), auteur: p ? nomDe(p) : 'Compte supprimé' }; }).reverse());
});
router.post('/api/avis-services/:id/repondre', A.exigerRole('agent', 'admin'), (req, res) => {
  const a = docs.get(COL, req.params.id);
  if (!a) return erreur(res, 404, 'Avis introuvable.');
  const rep = texte((req.body || {}).reponse, 1000);
  if (rep.length < 5) return erreur(res, 400, 'Écrivez la réponse du service (5 caractères minimum).');
  const maj = docs.patch(COL, a.id, { reponse: { texte: masquer(rep), date: maintenant(), par: nomDe(req.user), service: nomService(a.serviceId) } });
  audit(req.user, { categorie: 'avis', action: 'Réponse à un avis sur un service', objetId: a.id, objetLibelle: nomService(a.serviceId), avant: a.reponse ? 'Réponse précédente' : 'Sans réponse', apres: 'Réponse publiée', motif: rep });
  if (a.userId) notifier(a.userId, `Le service vous répond (avis ${a.id})`, `${nomService(a.serviceId)} : « ${rep.slice(0, 160)}${rep.length > 160 ? '…' : ''} »`, 'espace.html#mes-avis-services', 'importante');
  res.json({ ...maj, statutHabitant: statutPour(maj) });
});
router.post('/api/avis-services/:id/moderer', A.exigerRole('agent', 'admin'), (req, res) => {
  const a = docs.get(COL, req.params.id);
  if (!a) return erreur(res, 404, 'Avis introuvable.');
  const statut = (req.body || {}).statut === 'masque' ? 'masque' : 'publie';
  const motif = texte((req.body || {}).motif, 300);
  if (statut === 'masque' && motif.length < 5) return erreur(res, 400, 'Indiquez pourquoi ce commentaire n’est pas publié (il est montré à l’habitant).');
  const maj = docs.patch(COL, a.id, { statut, motifModeration: statut === 'masque' ? motif : '' });
  audit(req.user, { categorie: 'avis', action: statut === 'masque' ? 'Commentaire retiré de la publication' : 'Commentaire republié', objetId: a.id, objetLibelle: nomService(a.serviceId), avant: a.statut, apres: statut, motif });
  if (a.userId && statut !== a.statut) notifier(a.userId, statut === 'masque' ? `Votre avis ${a.id} n’est pas publié` : `Votre avis ${a.id} est publié`, statut === 'masque' ? motif : 'Il est de nouveau visible sur la page du service.', 'espace.html#mes-avis-services', 'info');
  res.json({ ...maj, statutHabitant: statutPour(maj) });
});

module.exports = router;
