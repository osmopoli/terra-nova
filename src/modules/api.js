// API JSON de la plateforme : le navigateur (assets/js/store.js) lit l'état autorisé pour son profil
// et écrit document par document. Chaque écriture est contrôlée ici selon le rôle (D09).
const router = require('express').Router();
const db = require('../db');
const { docs, journal, audit, notifier, uid, maintenant } = require('../donnees');
const A = require('../auth');
const webcup = require('../webcup');
const { semer } = require('../seed');

const sans = (o, ...cles) => { const c = { ...o }; cles.forEach((k) => delete c[k]); return c; };
const personnel = (req) => A.estPersonnel(req.user);
const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });

/* ---------- Lecture : tout l'état visible par le profil courant ---------- */
function etatPour(u) {
  const staff = A.estPersonnel(u);
  const tous = (c) => docs.tous(c);
  const etat = {
    moi: u || null,
    services: tous('services'),
    annonces: tous('annonces'),
    demandes: staff ? tous('demandes') : u ? tous('demandes').filter((d) => d.userId === u.id) : [],
    // les créneaux pris par les autres sont visibles (disponibilités) sans aucune donnée personnelle
    rdv: tous('rdv').map((r) => (staff || (u && r.userId === u.id) ? r : { id: r.id, serviceId: r.serviceId, debut: r.debut, statut: r.statut, cree: r.cree })),
    notifications: u ? tous('notifications').filter((n) => n.userId === u.id) : [],
    utilisateurs: staff ? tous('utilisateurs').map((p) => { const r = A.parDoc(p.id); return Object.assign(p, { role: r ? r.role : p.role }); }) : u ? [u] : [],
    journal: staff ? tous('journal').reverse().slice(0, 300) : [],
    audit: staff ? tous('audit').reverse().slice(0, 1000) : [],
    securite: staff ? A.toutesSecurites() : u ? { [u.email]: A.etatSecurite(u.email) } : {}
  };
  if (u) etat.utilisateurs = etat.utilisateurs.map((p) => sans(p, '_uid'));
  if (etat.moi) etat.moi = sans(etat.moi, '_uid');
  return etat;
}
router.get('/api/etat', (req, res) => { res.set('Cache-Control', 'no-store'); res.json(etatPour(req.user)); });

/* ---------- Authentification ---------- */
// (pas de route « e-mail déjà pris » : elle permettait d'énumérer les comptes ; l'inscription répond elle-même, limitée par IP)

router.post('/api/auth/inscrire', (req, res) => {
  const { prenom, nom, motdepasse, quartier, telephone, alertesQuartier } = req.body || {};
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!prenom || !nom || !email || !motdepasse) return res.json({ ok: false, erreur: 'Tous les champs obligatoires doivent être remplis.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.json({ ok: false, erreur: 'Adresse e-mail invalide.' });
  if (A.parEmail(email)) return res.json({ ok: false, erreur: 'Un compte existe déjà avec cette adresse.' });
  const manques = A.validerMotDePasse(motdepasse);
  if (manques.length) return res.json({ ok: false, erreur: `Mot de passe trop faible : ${manques.join(', ')}.` });
  const u = A.creerCompte({ prenom: String(prenom).trim(), nom: String(nom).trim(), email, role: 'citoyen', quartier: quartier || 'Centre',
    telephone: telephone || '', premiereConnexion: true, profilComplet: !!(quartier && telephone), alertesQuartier: alertesQuartier !== false }, motdepasse);
  A.ouvrirSession(res, A.parEmail(email).id);
  journal('inscription', email);
  notifier(u.id, 'Bienvenue sur Terra Nova', 'Votre espace personnel est prêt. Suivez le guide pour faire vos premiers pas.', 'espace.html', 'info');
  res.json({ ok: true, utilisateur: u });
});

router.post('/api/auth/connecter', (req, res) => {
  const b = req.body || {};
  res.json(A.connecter(req, res, b.email, b.motdepasse, !!b.verificationReussie));
});
router.post('/api/auth/deconnecter', (req, res) => { A.fermerSession(req, res); res.json({ ok: true }); });

router.post('/api/auth/verifier', A.exigerRole(...A.ROLES), (req, res) => {
  const row = A.parDoc(req.user.id);
  const ok = !!row && A.verifier(req.body.motdepasse || '', row.password_hash);
  if (ok) A.marquerVerifie(req);
  res.json({ ok });
});
router.post('/api/auth/mot-de-passe', A.exigerRole(...A.ROLES), (req, res) => {
  if (!A.estVerifie(req)) return erreur(res, 403, 'Confirmez d’abord votre mot de passe actuel.');
  const manques = A.validerMotDePasse(req.body.nouveau || '');
  if (manques.length) return erreur(res, 400, `Mot de passe trop faible : ${manques.join(', ')}.`);
  db.prepare('UPDATE users SET password_hash = ? WHERE doc_id = ?').run(A.hacher(req.body.nouveau), req.user.id);
  journal('mdp_change', req.user.email);
  res.json({ ok: true });
});
// F33 : suppression du compte par son titulaire (après vérification du mot de passe)
router.post('/api/auth/supprimer', A.exigerRole('citoyen'), (req, res) => {
  if (!A.estVerifie(req)) return erreur(res, 403, 'Confirmez d’abord votre mot de passe actuel.');
  const u = req.user;
  for (const d of docs.tous('demandes').filter((x) => x.userId === u.id)) docs.patch('demandes', d.id, { userId: null, anonymise: true, contactNom: '', contactEmail: '' });
  for (const r of docs.tous('rdv').filter((x) => x.userId === u.id)) docs.suppr('rdv', r.id);
  for (const n of docs.tous('notifications').filter((x) => x.userId === u.id)) docs.suppr('notifications', n.id);
  // vague 12 : les avis restent comptés dans les résultats et les idées dans le suivi, mais sans lien avec la personne
  for (const col of ['avis', 'idees', 'avisServices']) for (const x of docs.tous(col).filter((d) => d.userId === u.id)) docs.patch(col, x.id, { userId: null, anonymise: true });
  docs.suppr('utilisateurs', u.id);
  A.fermerSession(req, res);
  db.prepare('DELETE FROM users WHERE doc_id = ?').run(u.id);
  journal('suppression_compte', u.email);
  res.json({ ok: true });
});
router.post('/api/auth/debloquer', A.exigerRole('agent', 'admin'), (req, res) => {
  A.majSecurite(req.body.email, { ...A.VIDE });
  journal('deblocage', req.body.email, `par ${req.user.email}`);
  res.json({ ok: true });
});
// Événements que le navigateur peut consigner : un citoyen ne peut ni fabriquer une connexion ni un verrouillage
const TYPES_JOURNAL_CITOYEN = ['acces_refuse', 'echec_mdp'];
const TYPES_JOURNAL_PERSONNEL = [...TYPES_JOURNAL_CITOYEN, 'desactivation', 'reactivation', 'changement_role', 'deblocage', 'evenement'];
router.post('/api/journal', A.exigerRole(...A.ROLES), (req, res) => {
  const b = req.body || {};
  const type = String(b.type || 'evenement');
  if (!(personnel(req) ? TYPES_JOURNAL_PERSONNEL : TYPES_JOURNAL_CITOYEN).includes(type)) return erreur(res, 400, 'Type d’événement non autorisé.');
  journal(type, personnel(req) ? b.email : req.user.email, String(b.detail || '').slice(0, 200));
  res.json({ ok: true });
});

/* ---------- Écritures génériques contrôlées par collection ---------- */
const CHAMPS_PROFIL = ['prenom', 'nom', 'telephone', 'quartier', 'langue', 'vulnerable', 'preferences', 'premiereConnexion', 'profilComplet', 'alertesQuartier', 'accueil'];

function regleCreation(col, req, doc) {
  const u = req.user;
  switch (col) {
    case 'demandes': {
      const n = docs.prochainNumero('demandes', 1040);
      // F52 : les soutiens ne s'ajoutent que par /api/demandes/:id/soutenir ; l'auteur est fixé par la session
      return Object.assign(sans(doc, 'statut', 'agent', 'historique', 'anonymise', 'soutiens', 'userId'), {
        id: `NT-${n}`, cree: maintenant(), userId: u ? u.id : null, statut: 'recue', agent: '',
        historique: [{ date: maintenant(), statut: 'recue', note: 'Demande enregistrée et transmise au service concerné.', par: 'Système' }]
      });
    }
    case 'annonces': return personnel(req) ? Object.assign(doc, { cree: maintenant(), auteurId: u.id }) : null;
    case 'rdv': return u ? Object.assign(personnel(req) ? doc : Object.assign(sans(doc, 'agent'), { statut: 'confirme' }), { userId: u.id, cree: maintenant() }) : null;
    case 'notifications': return u && (personnel(req) || doc.userId === u.id) ? Object.assign(doc, { lu: false, cree: maintenant() }) : null;
    case 'audit': {
      // F47 / F48 : un citoyen ne consigne que les actions sur son propre compte ; le personnel est libre
      if (!u) return null;
      if (!personnel(req) && !(doc.categorie === 'compte' && (doc.objetId === u.id || doc.objetId === u.email))) return null;
      return Object.assign(doc, { date: maintenant(), acteurId: u.id, acteurNom: `${u.prenom} ${u.nom}`, acteurRole: u.role, cree: maintenant() });
    }
    default: return null;
  }
}

function reglePatch(col, req, avant, patch) {
  const u = req.user;
  const staff = personnel(req);
  switch (col) {
    case 'utilisateurs': {
      const p = {};
      if (u && avant.id === u.id) CHAMPS_PROFIL.forEach((k) => k in patch && (p[k] = patch[k]));
      const cible = A.parDoc(avant.id);
      if (staff && cible && avant.id !== u.id) {
        if ('actif' in patch && (cible.role === 'citoyen' || u.role === 'admin')) p.actif = !!patch.actif;
        if ('role' in patch && u.role === 'admin' && A.ROLES.includes(patch.role)) {
          db.prepare('UPDATE users SET role = ? WHERE doc_id = ?').run(patch.role, avant.id);
          db.prepare('DELETE FROM sessions WHERE user_id = ?').run(cible.id);   // l'utilisateur se reconnecte avec ses nouveaux droits
          p.role = patch.role;
        }
      }
      return Object.keys(p).length ? p : null;
    }
    case 'demandes': {
      if (staff) return sans(patch, 'id', 'userId', 'cree');
      // le citoyen ne peut qu'ajouter UN complément à l'historique de SA demande : statut, auteur et date sont fixés ici
      const histo = Array.isArray(avant.historique) ? avant.historique : [];
      if (u && avant.userId === u.id && Array.isArray(patch.historique) && patch.historique.length === histo.length + 1
        && JSON.stringify(patch.historique.slice(0, histo.length)) === JSON.stringify(histo)) {
        const ajout = patch.historique[histo.length] && typeof patch.historique[histo.length] === 'object' ? patch.historique[histo.length] : {};
        return { historique: histo.concat([{ date: maintenant(), statut: avant.statut, par: `${u.prenom} ${u.nom}`, note: String(ajout.note || '').slice(0, 2000) }]) };
      }
      return null;
    }
    case 'annonces': return staff ? sans(patch, 'id', 'cree') : null;
    case 'services': {
      if (staff) {
        // F63 : la désactivation d'un service est réservée à l'administrateur (routes dédiées, journalisées) ;
        // un agent ne peut ni désactiver un service ni écraser la désactivation décidée par l'administrateur
        if ('etat' in patch && ((patch.etat && patch.etat.code === 'desactive') || (avant.etat && avant.etat.code === 'desactive'))) return null;
        return sans(patch, 'id');
      }
      if (Object.keys(patch).length === 1 && 'vues' in patch) return { vues: (avant.vues || 0) + 1 };   // compteur de consultation (F28)
      return null;
    }
    case 'rdv': {
      if (staff) return sans(patch, 'id', 'userId');
      if (u && avant.userId === u.id) { const p = {}; ['statut', 'rappel', 'motif'].forEach((k) => k in patch && (p[k] = patch[k])); if (p.statut && p.statut !== 'annule') delete p.statut; return p; }
      return null;
    }
    case 'notifications': return u && avant.userId === u.id && 'lu' in patch ? { lu: !!patch.lu } : null;
    default: return null;
  }
}

const serviceDesactive = (id) => { const s = id ? docs.get('services', String(id)) : null; return s && s.etat && s.etat.code === 'desactive' ? s : null; };
// Rendez-vous : créneau lisible et à venir, un seul rendez-vous actif par service et par créneau
function controlerRdv(brut) {
  const debut = Date.parse(brut.debut);
  if (!Number.isFinite(debut)) return { code: 400, msg: 'Date du rendez-vous invalide.' };
  if (debut < Date.now()) return { code: 400, msg: 'Ce créneau est déjà passé : choisissez un créneau à venir.' };
  if (docs.tous('rdv').some((r) => r.serviceId === brut.serviceId && r.statut !== 'annule' && Date.parse(r.debut) === debut)) return { code: 409, msg: 'Ce créneau vient d’être réservé : choisissez-en un autre.' };
  return null;
}

/* ---------- F63 : désactiver / réactiver rapidement un service défectueux (administrateur uniquement) ---------- */
const TYPES_ALTERNATIVE = ['telephone', 'guichet', 'en-ligne', 'date', 'autre'];
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
router.post('/api/services/:id/desactiver', A.exigerRole('admin'), (req, res) => {
  const s = docs.get('services', req.params.id);
  if (!s) return erreur(res, 404, 'Service introuvable.');
  const b = req.body || {};
  const motif = texte(b.motif, 300);
  const alt = b.alternative || {};
  const alternative = { type: TYPES_ALTERNATIVE.includes(alt.type) ? alt.type : 'autre', texte: texte(alt.texte, 300), valeur: texte(alt.valeur, 160) };
  if (motif.length < 5) return erreur(res, 400, 'Indiquez la raison de la désactivation (5 caractères minimum).');
  if (alternative.texte.length < 5) return erreur(res, 400, 'Indiquez la prochaine action possible pour les habitants (autre canal, téléphone, guichet, date).');
  const avant = s.etat || { code: 'ok' };
  const etat = { code: 'desactive', message: motif, retour: texte(b.retour, 160), alternative, depuis: maintenant(), par: `${req.user.prenom} ${req.user.nom}`,
    precedent: avant.code === 'desactive' ? (avant.precedent || null) : avant };
  const maj = docs.patch('services', s.id, { etat });
  audit(req.user, { categorie: 'service', action: 'Désactivation du service', objetId: s.id, objetLibelle: (s.nom && s.nom.fr) || s.id,
    avant: avant.code, apres: 'desactive', motif: `${motif}${etat.retour ? ' · Retour : ' + etat.retour : ''} · Alternative : ${alternative.texte}` });
  res.json(maj);
});
router.post('/api/services/:id/reactiver', A.exigerRole('admin'), (req, res) => {
  const s = docs.get('services', req.params.id);
  if (!s) return erreur(res, 404, 'Service introuvable.');
  if (!s.etat || s.etat.code !== 'desactive') return erreur(res, 400, 'Ce service n’est pas désactivé.');
  const maj = docs.patch('services', s.id, { etat: { code: 'ok', message: '', retour: '' } });
  audit(req.user, { categorie: 'service', action: 'Réactivation du service', objetId: s.id, objetLibelle: (s.nom && s.nom.fr) || s.id,
    avant: 'desactive', apres: 'ok', motif: texte((req.body || {}).motif, 300) || 'Service rétabli' });
  res.json(maj);
});

const COLLECTIONS = ['utilisateurs', 'demandes', 'annonces', 'services', 'rdv', 'notifications', 'audit'];

router.post('/api/docs/:col', (req, res) => {
  const col = req.params.col;
  if (!COLLECTIONS.includes(col)) return erreur(res, 404, 'Collection inconnue.');
  const liste = Array.isArray(req.body) ? req.body : [req.body];
  const crees = [];
  for (const brut of liste) {
    // F63 : un service désactivé ne peut pas être utilisé pour commencer une démarche ou réserver un rendez-vous
    const bloque = (col === 'rdv' || (col === 'demandes' && brut.type === 'demarche')) && serviceDesactive(brut.serviceId);
    if (bloque) return res.status(409).json({ erreur: `Ce service est momentanément indisponible : ${bloque.etat.message || 'démarches suspendues'}. ${(bloque.etat.alternative && bloque.etat.alternative.texte) || 'Vous pouvez écrire au service.'}`, etat: bloque.etat });
    const creneau = col === 'rdv' && req.user ? controlerRdv(brut) : null;
    if (creneau) return erreur(res, creneau.code, creneau.msg);
    const d = regleCreation(col, req, Object.assign({}, brut, col === 'demandes' ? {} : { id: brut.id || uid(col.slice(0, 3)) }));
    if (!d) return erreur(res, req.user ? 403 : 401, 'Action non autorisée pour votre profil.');
    crees.push(col === 'demandes' ? require('./accuses').apresCreation(docs.put(col, d)) : docs.put(col, d));   // F83 : accusé de réception
  }
  res.json(Array.isArray(req.body) ? crees : crees[0]);
});

router.patch('/api/docs/:col/:id', (req, res) => {
  const { col, id } = req.params;
  if (!COLLECTIONS.includes(col)) return erreur(res, 404, 'Collection inconnue.');
  const avant = docs.get(col, id);
  if (!avant) return erreur(res, 404, 'Élément introuvable.');
  const p = reglePatch(col, req, avant, req.body || {});
  if (!p) { if (req.user) journal('acces_refuse', req.user.email, `${col}/${id}`); return erreur(res, req.user ? 403 : 401, 'Action non autorisée pour votre profil.'); }
  const apres = docs.patch(col, id, p);
  // F75 : répondre une fois à la demande principale met à jour et prévient toutes les demandes rattachées
  if (col === 'demandes' && personnel(req)) require('./doublons').propager(avant, apres, req.user);
  res.json(apres);
});

router.delete('/api/docs/:col/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const { col, id } = req.params;
  if (!['annonces', 'notifications'].includes(col)) return erreur(res, 403, 'Suppression non autorisée.');
  docs.suppr(col, id);
  res.json({ ok: true });
});

/* ---------- F52 : soutenir un signalement déjà déposé par d'autres habitants ---------- */
// Liste publique et anonymisée des signalements ouverts (aucun nom, aucune coordonnée)
router.get('/api/demandes/publiques', (req, res) => {
  const u = req.user;
  const ouvertes = docs.tous('demandes').filter((d) => d.type === 'signalement' && d.statut !== 'cloturee');
  res.json(ouvertes.map((d) => ({ id: d.id, objet: d.objet, message: d.message, lieu: d.lieu, quartier: d.quartier, serviceId: d.serviceId, categorie: d.categorie || '',
    statut: d.statut, cree: d.cree, soutiens: (d.soutiens || []).length, soutenuParMoi: !!u && (d.soutiens || []).some((s) => s.userId === u.id),
    estAMoi: !!u && d.userId === u.id })).sort((a, b) => b.soutiens - a.soutiens || b.cree.localeCompare(a.cree)));
});
router.post('/api/demandes/:id/soutenir', A.exigerRole('citoyen'), (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d || d.type !== 'signalement') return erreur(res, 404, 'Signalement introuvable.');
  if (d.userId === req.user.id) return erreur(res, 400, 'Vous êtes l’auteur de ce signalement.');
  const soutiens = d.soutiens || [];
  const deja = soutiens.some((s) => s.userId === req.user.id);
  const liste = deja ? soutiens.filter((s) => s.userId !== req.user.id) : soutiens.concat([{ userId: req.user.id, date: maintenant(), commentaire: String((req.body || {}).commentaire || '').slice(0, 280) }]);
  const maj = docs.patch('demandes', d.id, { soutiens: liste });
  if (!deja) {
    notifier(req.user.id, `Votre soutien à ${d.id} est enregistré`, `Vous êtes ${liste.length} habitant(s) à soutenir « ${d.objet} ». Vous serez prévenu de son avancement.`, 'soutenir.html#' + d.id, 'info');
    if (d.userId) notifier(d.userId, `Un habitant soutient votre signalement ${d.id}`, `${liste.length} soutien(s) au total : la priorité de traitement peut être revue.`, 'suivi.html?id=' + d.id, 'info');
  }
  res.json({ ok: true, soutenu: !deja, soutiens: maj.soutiens.length });
});

/* ---------- F51 : contributions des habitants sur l'usage de leurs données ---------- */
router.post('/api/contributions', (req, res) => {
  const b = req.body || {};
  const texte = String(b.message || '').trim();
  if (texte.length < 10) return erreur(res, 400, 'Décrivez votre question ou inquiétude (10 caractères minimum).');
  const n = docs.prochainNumero('contributions', 0);
  const c = docs.put('contributions', { id: `CTR-${String(n).padStart(4, '0')}`, cree: maintenant(), userId: req.user ? req.user.id : null,
    sujet: String(b.sujet || 'autre').slice(0, 40), message: texte.slice(0, 2000), contact: req.user ? req.user.email : String(b.contact || '').slice(0, 120),
    statut: 'recue', historique: [{ date: maintenant(), statut: 'recue', note: 'Contribution enregistrée et transmise au délégué à la protection des données.', par: 'Système' }] });
  if (req.user) notifier(req.user.id, `Contribution ${c.id} bien reçue`, 'Le délégué à la protection des données vous répondra sous 15 jours.', 'donnees.html#mes-contributions', 'info');
  res.json(c);
});
router.get('/api/contributions', (req, res) => {
  if (!req.user) return res.json([]);
  const l = docs.tous('contributions');
  res.json((personnel(req) ? l : l.filter((c) => c.userId === req.user.id)).reverse());
});
router.patch('/api/contributions/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const c = docs.get('contributions', req.params.id);
  if (!c) return erreur(res, 404, 'Contribution introuvable.');
  const statut = ['recue', 'en_cours', 'repondue'].includes(req.body.statut) ? req.body.statut : c.statut;
  const note = String(req.body.reponse || '').slice(0, 2000);
  const maj = docs.patch('contributions', c.id, { statut, reponse: note || c.reponse || '', historique: c.historique.concat([{ date: maintenant(), statut, note, par: `${req.user.prenom} ${req.user.nom}` }]) });
  audit(req.user, { categorie: 'contribution', action: 'Réponse à une contribution', objetId: c.id, objetLibelle: c.sujet, avant: c.statut, apres: statut, motif: note });
  if (c.userId) notifier(c.userId, `Réponse à votre contribution ${c.id}`, note || 'Votre contribution a été traitée.', 'donnees.html#mes-contributions', 'importante');
  res.json(maj);
});
// Export de mes données personnelles (transparence F51)
router.get('/api/mes-donnees', A.exigerRole(...A.ROLES), (req, res) => {
  const u = req.user;
  res.set('Content-Disposition', 'attachment; filename="mes-donnees-terra-nova.json"');
  res.json({ exporte: maintenant(), profil: sans(u, '_uid'), demandes: docs.tous('demandes').filter((d) => d.userId === u.id),
    rendezVous: docs.tous('rdv').filter((r) => r.userId === u.id), notifications: docs.tous('notifications').filter((n) => n.userId === u.id),
    contributions: docs.tous('contributions').filter((c) => c.userId === u.id),
    avis: docs.tous('avis').filter((x) => x.userId === u.id), idees: docs.tous('idees').filter((x) => x.userId === u.id),
    avisServices: docs.tous('avisServices').filter((x) => x.userId === u.id),
    connexions: docs.tous('journal').filter((j) => j.email === u.email).slice(-50) });
});

/* ---------- F55 / F56 : mes informations et récapitulatif de mes demandes (jamais les données d'un autre, jamais de secret) ---------- */
// Une demande résumée pour l'habitant : dernier échange du personnel (hors message automatique) et date de dernière mise à jour
function demandeResumee(d) {
  const histo = d.historique || [];
  const rep = histo.filter((h) => h.par && h.par !== 'Système' && h.note).pop();
  return { id: d.id, objet: d.objet, type: d.type, serviceId: d.serviceId, quartier: d.quartier || '', statut: d.statut, cree: d.cree,
    maj: (histo[histo.length - 1] || {}).date || d.cree, traiteeLe: (histo.find((h) => h.statut === 'traitee') || {}).date || null,
    reponse: rep ? { date: rep.date, par: rep.par, note: rep.note } : null };
}
router.get('/api/mes-informations', A.exigerRole(...A.ROLES), (req, res) => {
  const u = req.user;
  const mes = (col) => docs.tous(col).filter((x) => x.userId === u.id);
  const notifs = mes('notifications');
  const connexions = docs.tous('journal').filter((j) => j.email === u.email && j.type === 'connexion');
  res.set('Cache-Control', 'no-store');
  res.json({ exporte: maintenant(),
    profil: { prenom: u.prenom, nom: u.nom, email: u.email, telephone: u.telephone || '', quartier: u.quartier || '', role: u.role },
    compte: { cree: u.cree, derniereConnexion: u.derniereConnexion || (connexions[connexions.length - 1] || {}).date || null, nbConnexions: connexions.length, actif: u.actif !== false },
    preferences: { langue: u.langue || '', alertesQuartier: u.alertesQuartier !== false, vulnerable: !!u.vulnerable, rappelsRdv: true },
    demandes: mes('demandes').map(demandeResumee),
    rendezVous: mes('rdv').map((r) => ({ id: r.id, serviceId: r.serviceId, debut: r.debut, statut: r.statut, motif: r.motif || '', rappel: !!(r.rappel && r.rappel.actif) })),
    soutiens: docs.tous('demandes').filter((d) => (d.soutiens || []).some((s) => s.userId === u.id)).map((d) => {
      const s = d.soutiens.find((x) => x.userId === u.id); return { demandeId: d.id, objet: d.objet, date: s.date, commentaire: s.commentaire || '' }; }),
    contributions: mes('contributions').map((c) => ({ id: c.id, sujet: c.sujet, cree: c.cree, statut: c.statut, message: c.message, reponse: c.reponse || '' })),
    notifications: { total: notifs.length, nonLues: notifs.filter((n) => !n.lu).length } });
});
router.get('/api/mon-recapitulatif', A.exigerRole('citoyen'), (req, res) => {
  const l = docs.tous('demandes').filter((d) => d.userId === req.user.id).map(demandeResumee).sort((a, b) => b.cree.localeCompare(a.cree));
  const delais = l.filter((d) => d.traiteeLe).map((d) => (Date.parse(d.traiteeLe) - Date.parse(d.cree)) / 36e5);
  const parStatut = { recue: 0, en_cours: 0, traitee: 0, cloturee: 0 };
  l.forEach((d) => { parStatut[d.statut] = (parStatut[d.statut] || 0) + 1; });
  res.set('Cache-Control', 'no-store');
  res.json({ genere: maintenant(), habitant: { prenom: req.user.prenom, nom: req.user.nom }, total: l.length, parStatut,
    delaiMoyenHeures: delais.length ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length) : null, demandes: l });
});

/* ---------- F50 : indicateurs d'activité pour le tableau de bord des agents ---------- */
router.get('/api/indicateurs', A.exigerRole('agent', 'admin'), (req, res) => {
  const jour = (iso) => String(iso).slice(0, 10);
  const dem = docs.tous('demandes');
  const parJour = {};
  for (let i = 13; i >= 0; i--) parJour[new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)] = { creees: 0, traitees: 0 };
  dem.forEach((d) => {
    if (parJour[jour(d.cree)]) parJour[jour(d.cree)].creees++;
    (d.historique || []).filter((h) => h.statut === 'traitee').forEach((h) => parJour[jour(h.date)] && parJour[jour(h.date)].traitees++);
  });
  const delais = dem.map((d) => { const h = (d.historique || []).find((x) => x.statut === 'traitee'); return h ? (Date.parse(h.date) - Date.parse(d.cree)) / 36e5 : null; }).filter((x) => x !== null);
  // les demandes sans valeur (ex. un contact sans quartier) ne faussent pas les répartitions
  const compter = (cle) => dem.reduce((o, d) => (d[cle] ? ((o[d[cle]] = (o[d[cle]] || 0) + 1), o) : o), {});
  res.json({
    totaux: { demandes: dem.length, enAttente: dem.filter((d) => d.statut === 'recue').length, enCours: dem.filter((d) => d.statut === 'en_cours').length,
      traitees: dem.filter((d) => d.statut === 'traitee' || d.statut === 'cloturee').length, urgentes: dem.filter((d) => d.priorite === 'haute' && !['traitee', 'cloturee'].includes(d.statut)).length,
      habitants: docs.tous('utilisateurs').filter((u) => (A.parDoc(u.id) || {}).role === 'citoyen').length, rdvAVenir: docs.tous('rdv').filter((r) => r.statut === 'confirme' && r.debut > maintenant()).length,
      alertesActives: docs.tous('annonces').filter((a) => a.active && a.importance === 'alerte').length, contributions: docs.compte('contributions'),
      soutiens: dem.reduce((n, d) => n + (d.soutiens || []).length, 0) },
    delaiMoyenHeures: delais.length ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length) : null,
    parJour, parStatut: compter('statut'), parQuartier: compter('quartier'), parService: compter('serviceId'), parType: compter('type')
  });
});

// Supprimer une de mes notifications (la croix du tiroir) : seulement les siennes
router.delete('/api/notifications/:id', A.exigerRole(...A.ROLES), (req, res) => {
  const n = docs.get('notifications', req.params.id);
  if (!n || n.userId !== req.user.id) return erreur(res, 404, 'Notification introuvable.');
  docs.suppr('notifications', n.id);
  res.json({ ok: true });
});

// Marquer toutes mes notifications comme lues
router.post('/api/notifications/tout-lire', A.exigerRole(...A.ROLES), (req, res) => {
  for (const n of docs.tous('notifications').filter((x) => x.userId === req.user.id && !x.lu)) docs.patch('notifications', n.id, { lu: true });
  res.json({ ok: true });
});

/* ---------- D19 : flux de l'API Terra Nova pour les agents (clé jamais exposée) ---------- */
function fluxApi(req, res) {
  const s = webcup.getState();
  res.set('Cache-Control', 'no-store');
  // la ville s'appelle Terra Nova : certains textes de l'API inversent les deux mots, on harmonise à l'affichage
  const corps = JSON.stringify({ session: s.session || {}, requests: s.requests, last_poll_at: s.last_poll_at, last_error: s.last_error });
  res.type('json').send(corps.replace(/Nova Terra/g, 'Terra Nova'));
}
router.get('/api.php', A.exigerRole('agent', 'admin'), fluxApi);          // chemin attendu par la maquette (hébergement PHP)
router.get('/api/webcup/state', A.exigerRole('agent', 'admin'), fluxApi);

// Réinitialiser les données de démonstration (administrateur uniquement)
router.post('/api/demo/reinitialiser', A.exigerRole('admin'), (req, res) => {
  semer({ forcer: true });
  res.json({ ok: true });
});

module.exports = router;
