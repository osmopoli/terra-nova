/* Terra Nova — vague 13 : Centre de sécurité (F69) et habilitations aux données réservées (F70)
   - F70 : une habilitation accordée par l'administrateur, en plus du rôle, ouvre l'accès aux données
     administratives réservées (dossier : situation, quotient familial, n° d'allocataire, note du service ;
     téléphone des habitants). Ces champs ne sont JAMAIS envoyés par GET /api/etat ni par les écritures
     (filtrage serveur dans src/bouclier.js) : un agent habilité les affiche un par un, avec un motif obligatoire,
     et chaque consultation est journalisée (qui, quand, pourquoi, quels champs).
   - F69 : journal des tentatives bloquées et protections actives pour l'administrateur ; « mes protections »
     pour l'habitant (consultations de son dossier, deuxième étape, appareils). */
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, journal, audit, notifier, uid, maintenant } = require('../donnees');
const bouclier = require('../bouclier');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const nom = (u) => `${u.prenom} ${u.nom}`;
const roleDe = (p) => (A.parDoc(p.id) || {}).role || p.role;
// Habilité : administrateur, ou agent à qui l'administrateur a accordé l'habilitation
const estHabilite = (u) => !!u && (u.role === 'admin' || (u.role === 'agent' && !!(u.habilitation && u.habilitation.active)));

const CHAMPS_DOSSIER = ['naissance', 'situation', 'quotientFamilial', 'numeroAllocataire', 'aides', 'noteService'];
const MOTIFS = ['instruction', 'contact', 'eligibilite', 'habitant', 'urgence', 'autre'];

/* ---------- F70 : afficher une donnée réservée (motif obligatoire, journalisé) ---------- */
router.post('/api/sensible/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const cible = docs.get('utilisateurs', req.params.id);
  if (!cible) return erreur(res, 404, 'Compte introuvable.');
  const b = req.body || {};
  if (!estHabilite(req.user)) {
    journal('acces_sensible_refuse', req.user.email, `${nom(cible)} (non habilité)`);
    return bouclier.bloquer(req, res, 403, 'acces', 'Accès réservé aux agents habilités. Demandez une habilitation à l’administrateur.', `consultation refusée : ${nom(cible)}`);
  }
  const motif = MOTIFS.includes(b.motif) ? b.motif : '';
  const precision = String(b.precision || '').trim().slice(0, 300);
  if (!motif) return erreur(res, 400, 'Indiquez pourquoi vous consultez ces données.');
  if (motif === 'autre' && precision.length < 10) return erreur(res, 400, 'Précisez le motif (10 caractères minimum).');
  const champs = (Array.isArray(b.champs) ? b.champs : ['telephone', 'dossier']).filter((c) => c === 'telephone' || c === 'dossier');
  if (!champs.length) return erreur(res, 400, 'Aucun champ demandé.');
  const acces = docs.put('acces_sensibles', { id: uid('acs'), date: maintenant(), agentId: req.user.id, agentNom: nom(req.user), agentRole: req.user.role,
    cibleId: cible.id, cibleNom: nom(cible), champs, motif, precision });
  audit(req.user, { categorie: 'donnees', action: 'Consultation de données réservées', objetId: cible.id, objetLibelle: nom(cible), apres: champs.join(', '), motif: precision || motif });
  res.locals.reveler = true;   // seule réponse de l'API qui contient ces champs en clair
  const donnees = {};
  if (champs.includes('telephone')) donnees.telephone = cible.telephone || '';
  if (champs.includes('dossier')) donnees.dossier = Object.fromEntries(CHAMPS_DOSSIER.map((k) => [k, (cible.dossier || {})[k] || '']));
  res.json({ ok: true, acces: { id: acces.id, date: acces.date }, donnees });
});

/* ---------- F70 : habilitations (administrateur) ---------- */
router.get('/api/habilitations', A.exigerRole('admin'), (req, res) => {
  const personnel = docs.tous('utilisateurs').map((p) => Object.assign(p, { role: roleDe(p) })).filter((p) => p.role === 'agent' || p.role === 'admin');
  res.json({
    personnel: personnel.map((p) => ({ id: p.id, nom: nom(p), email: p.email, role: p.role, actif: p.actif !== false,
      habilite: estHabilite(p), parRole: p.role === 'admin', habilitation: p.habilitation || null })),
    acces: docs.tous('acces_sensibles').reverse().slice(0, 500),
    motifs: MOTIFS
  });
});
router.post('/api/habilitations/:id', A.exigerRole('admin'), (req, res) => {
  const cible = docs.get('utilisateurs', req.params.id);
  if (!cible) return erreur(res, 404, 'Compte introuvable.');
  if (roleDe(cible) !== 'agent') return erreur(res, 400, 'Seuls les agents reçoivent une habilitation (les administrateurs l’ont par leur rôle).');
  const active = !!(req.body || {}).active;
  const motif = String((req.body || {}).motif || '').trim().slice(0, 300);
  if (motif.length < 5) return erreur(res, 400, 'Indiquez le motif de cette décision (mission, service…).');
  const avant = !!(cible.habilitation && cible.habilitation.active);
  const habilitation = { active, motif, par: nom(req.user), parId: req.user.id, le: maintenant() };
  docs.patch('utilisateurs', cible.id, { habilitation });
  audit(req.user, { categorie: 'compte', action: active ? 'Habilitation accordée' : 'Habilitation retirée', objetId: cible.id, objetLibelle: nom(cible), avant: avant ? 'habilité' : 'non habilité', apres: active ? 'habilité' : 'non habilité', motif });
  journal(active ? 'habilitation_accordee' : 'habilitation_retiree', cible.email, `par ${req.user.email}`);
  notifier(cible.id, active ? 'Habilitation aux données réservées accordée' : 'Habilitation aux données réservées retirée',
    active ? `Vous pouvez consulter les données administratives réservées, avec un motif à chaque consultation. Motif : ${motif}` : `Motif : ${motif}`, 'admin-comptes.html', 'importante');
  res.json({ ok: true, habilitation });
});

/* ---------- F69 : journal des tentatives bloquées et protections actives (administrateur) ---------- */
router.get('/api/bouclier', A.exigerRole('admin'), (req, res) => {
  const blocages = docs.tous('bouclier').reverse().slice(0, 1000);
  const depuis = Date.now() - 864e5;
  const recents = blocages.filter((b) => Date.parse(b.date) > depuis);
  const parType = recents.reduce((o, b) => ((o[b.type] = (o[b.type] || 0) + 1), o), {});
  const t = Date.now();
  const verrouilles = Object.entries(A.toutesSecurites()).filter(([, e]) => e.verrouJusqu > t).map(([email, e]) => ({ email, jusqu: new Date(e.verrouJusqu).toISOString() }));
  const echecs = docs.tous('journal').filter((j) => Date.parse(j.date) > depuis && ['echec_connexion', 'verrouillage', 'tentative_bloquee'].includes(j.type)).length;
  res.json({ blocages, parType, total24h: recents.length, verrouilles, echecs24h: echecs, protections: bouclier.protections(),
    acces7j: docs.tous('acces_sensibles').filter((a) => Date.parse(a.date) > t - 7 * 864e5).length });
});

/* ---------- F69 : mes protections (habitant connecté) ---------- */
router.get('/api/securite/mes-protections', A.exigerRole(...A.ROLES), (req, res) => {
  const u = req.user;
  const row = A.parDoc(u.id);
  const consultations = docs.tous('acces_sensibles').filter((a) => a.cibleId === u.id);
  const deux = row && db.prepare("SELECT actif FROM deux_etapes WHERE user_id = ?").get(row.id);
  const appareils = row ? db.prepare('SELECT COUNT(*) n FROM appareils WHERE user_id = ?').get(row.id).n : 0;
  const cles = row ? db.prepare('SELECT COUNT(*) n FROM cles_acces WHERE user_id = ?').get(row.id).n : 0;
  const echecs = docs.tous('journal').filter((j) => j.email === u.email && ['echec_connexion', 'verrouillage', 'tentative_bloquee'].includes(j.type)).length;
  res.json({
    consultations: consultations.length,
    derniereConsultation: consultations.length ? (({ date, agentRole, motif }) => ({ date, agentRole, motif }))(consultations[consultations.length - 1]) : null,
    deuxEtapes: !!(deux && deux.actif), cles, appareils, echecsBloques: echecs,
    telephoneChiffre: !!u.telephone, dossierChiffre: !!u.dossier
  });
});

module.exports = router;
module.exports.estHabilite = estHabilite;
