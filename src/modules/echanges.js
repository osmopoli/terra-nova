/* Terra Nova — vague 16 (F84) : les agents répondent directement aux habitants, fil d'échanges par demande.
   - Agent / admin : POST /api/demandes/:id/repondre — message à l'habitant (réponses types facultatives), changement de statut
     facultatif, journalisé dans l'audit ; l'habitant est notifié. Sur une demande principale (F75), la réponse part aussi aux
     demandes rattachées (« répondre une fois » : on réutilise doublons.propager, puis le message rejoint le fil de chacune).
   - Habitant : POST /api/demandes/:id/messages — répondre à la mairie depuis son suivi (sa demande seulement, jamais clôturée).
   - Réponses types : GET /api/reponses-types (personnel).
   Les droits sont contrôlés ici (citoyen 403 sur les routes agents, agent 403 sur la route habitant). */
const router = require('express').Router();
const { docs, audit, notifier, uid, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const nomDe = (u) => `${u.prenom} ${u.nom}`;
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const STATUTS = { recue: 'Reçue', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' };

router.get('/api/reponses-types', A.exigerRole('agent', 'admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(docs.tous('reponsesTypes').sort((a, b) => (a.ordre || 0) - (b.ordre || 0)));
});

router.post('/api/demandes/:id/repondre', A.exigerRole('agent', 'admin'), (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d) return erreur(res, 404, 'Demande introuvable.');
  const b = req.body || {};
  const message = texte(b.message, 2000);
  if (message.length < 5) return erreur(res, 400, 'Écrivez votre réponse à l’habitant (5 caractères minimum).');
  const statut = b.statut && STATUTS[b.statut] ? b.statut : d.statut;
  const par = nomDe(req.user), date = maintenant();
  const modele = b.modele && docs.get('reponsesTypes', String(b.modele)) ? String(b.modele) : '';
  const echange = { id: uid('ech'), date, auteur: 'agent', par, parId: req.user.id, message, statut: statut !== d.statut ? statut : '', modele };
  const avant = d;
  const apres = docs.patch('demandes', d.id, { statut, agent: d.agent || par, echanges: (d.echanges || []).concat([echange]),
    historique: (d.historique || []).concat([{ date, statut, note: message, par, echange: echange.id }]) });
  if (d.userId) notifier(d.userId, `Réponse de la mairie à votre demande ${d.id}`,
    `${message.length > 220 ? message.slice(0, 220) + '…' : message}${statut !== d.statut ? ` (nouveau statut : ${STATUTS[statut]})` : ''} — Vous pouvez répondre depuis le suivi de votre demande.`,
    `suivi.html?id=${encodeURIComponent(d.id)}#echanges`, 'importante');
  audit(req.user, { categorie: 'demande', action: 'Réponse à l’habitant', objetId: d.id, objetLibelle: d.objet, avant: STATUTS[d.statut], apres: STATUTS[statut],
    motif: (modele ? `[réponse type ${modele}] ` : '') + message.slice(0, 300) });
  // F75 : répondre une fois sur la demande principale suffit pour toutes les demandes rattachées
  let communes = 0;
  if ((apres.liees || []).length && b.liees !== false) {
    communes = require('./doublons').propager(avant, apres, req.user);
    for (const id of apres.liees) {
      const x = docs.get('demandes', id);
      if (x && x.principale === apres.id) docs.patch('demandes', x.id, { echanges: (x.echanges || []).concat([Object.assign({}, echange, { id: uid('ech'), commun: apres.id })]) });
    }
  }
  const sansCompte = !d.userId && d.contactEmail ? d.contactEmail : '';
  res.json({ ok: true, demande: docs.get('demandes', d.id), communes, sansCompte });
});

router.post('/api/demandes/:id/messages', A.exigerRole('citoyen'), (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d || d.userId !== req.user.id) return erreur(res, 404, 'Demande introuvable.');   // ne révèle pas les demandes des autres
  if (d.statut === 'cloturee') return erreur(res, 409, 'Cette demande est clôturée : pour une nouvelle question, faites une nouvelle demande.');
  const message = texte((req.body || {}).message, 2000);
  if (message.length < 2) return erreur(res, 400, 'Écrivez votre message (2 caractères minimum).');
  const par = nomDe(req.user), date = maintenant();
  const echange = { id: uid('ech'), date, auteur: 'habitant', par, parId: req.user.id, message };
  const apres = docs.patch('demandes', d.id, { echanges: (d.echanges || []).concat([echange]),
    historique: (d.historique || []).concat([{ date, statut: d.statut, note: 'Message de l’habitant : ' + message, par, echange: echange.id }]) });
  audit(req.user, { categorie: 'demande', action: 'Message de l’habitant', objetId: d.id, objetLibelle: d.objet, motif: message.slice(0, 300) });
  // l'agent qui a répondu en dernier est prévenu ; sinon la demande apparaît « Réponse en attente » chez les agents
  const dernier = (d.echanges || []).filter((e) => e.auteur === 'agent').pop();
  if (dernier && dernier.parId && docs.get('utilisateurs', dernier.parId)) {
    notifier(dernier.parId, `Nouveau message sur la demande ${d.id}`, `${par} : ${message.length > 180 ? message.slice(0, 180) + '…' : message}`, `agent-demandes.html?q=${encodeURIComponent(d.id)}`, 'info');
  }
  res.json({ ok: true, demande: apres });
});

module.exports = router;
