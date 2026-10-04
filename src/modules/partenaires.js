/* Terra Nova — vague 20 (F99, Coordination Solidaire) : offres des partenaires extérieurs.
   - Partenaires (collection « partenaires ») : créés et validés par l'administrateur, qui y rattache un ou plusieurs comptes
     existants (comptes partenaires). Un partenaire suspendu ne peut plus rien publier ni modifier.
   - Offres (collection « offresPartenaires ») : le partenaire propose ou modifie une offre → « en attente de vérification » ;
     rien n'est visible des habitants tant qu'un agent ne l'a pas vérifiée et publiée (la version déjà publiée reste en ligne
     pendant la vérification d'une modification). Seule exception, opérationnelle : la disponibilité (disponible / complet /
     suspendu, prochaine date, places restantes) change tout de suite, et chaque changement est journalisé.
   - Habitants : liste filtrable, badge de disponibilité, prochaine action possible (Réserver, S'inscrire sur liste d'attente,
     Contacter, Voir une alternative) et mention « Proposé par …, vérifié par la ville ». Réservations et listes d'attente
     dans la plateforme (collection « partenaireDemandes ») : le partenaire ne voit que le prénom, l'initiale, le quartier et
     le message, et répond par la plateforme (l'habitant est prévenu dans sa cloche).
   Tous les droits sont contrôlés ici (citoyen non rattaché : 403 ; agent : vérification ; admin : partenaires et comptes). */
const router = require('express').Router();
const A = require('../auth');
const { docs, audit, notifier, uid, maintenant } = require('../donnees');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ').trim().slice(0, max);
const QUARTIERS = ['Toute la ville', 'Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const ACTIONS = ['reserver', 'demande', 'contact', 'lien'];
const DISPOS = ['disponible', 'complet', 'suspendu'];
const nom = (u) => `${u.prenom} ${u.nom}`;
const personnel = A.exigerRole('agent', 'admin');
const admin = A.exigerRole('admin');
const connecte = A.exigerRole(...A.ROLES);

const partenaireDe = (u) => (u ? docs.tous('partenaires').find((p) => (p.comptes || []).includes(u.id)) || null : null);
// Compte partenaire actif (rattaché à un partenaire non suspendu), contrôlé à chaque requête
function exigerPartenaire(req, res, next) {
  if (!req.user) return erreur(res, 401, 'Connexion requise.');
  const p = partenaireDe(req.user);
  if (!p) { require('../donnees').journal('acces_refuse', req.user.email, req.originalUrl); return erreur(res, 403, 'Réservé aux comptes des partenaires de la ville.'); }
  if (p.statut !== 'actif') return erreur(res, 403, 'Ce partenaire est suspendu par la ville : aucune publication possible pour le moment.');
  req.partenaire = p;
  next();
}

/* ---------- Contenu d'une offre : lecture et contrôle ---------- */
function lireContenu(b) {
  const c = {
    titre: texte(b.titre, 90), description: texte(b.description, 700), public: texte(b.public, 200), conditions: texte(b.conditions, 300),
    quartier: QUARTIERS.includes(b.quartier) ? b.quartier : 'Toute la ville', lieu: texte(b.lieu, 140), horaires: texte(b.horaires, 160),
    capacite: b.capacite === '' || b.capacite == null ? null : Math.max(0, Math.min(9999, Math.round(Number(b.capacite) || 0))),
    gratuit: b.gratuit !== false && !texte(b.prix, 60), prix: texte(b.prix, 60), action: ACTIONS.includes(b.action) ? b.action : 'demande',
    lien: texte(b.lien, 300), tel: texte(b.tel, 30), email: texte(b.email, 120), serviceId: texte(b.serviceId, 40), motsCles: texte(b.motsCles, 160)
  };
  if (c.titre.length < 5) return { erreur: 'Donnez un titre clair à l’offre (5 caractères minimum).' };
  if (c.description.length < 20) return { erreur: 'Décrivez l’offre en quelques phrases (20 caractères minimum).' };
  if (c.lien && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(c.lien)) return { erreur: 'Le lien de réservation doit commencer par https://' };
  if (c.action === 'lien' && !c.lien) return { erreur: 'Indiquez le lien de réservation (https://…).' };
  if (c.action === 'contact' && !c.tel && !c.email) return { erreur: 'Indiquez un téléphone ou un e-mail de contact.' };
  if (c.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) return { erreur: 'Adresse e-mail de contact invalide.' };
  if (c.serviceId && !docs.get('services', c.serviceId)) c.serviceId = '';
  if (c.prix) c.gratuit = false;
  return c;
}
function lireDispo(b, avant) {
  const statut = DISPOS.includes(b.statut) ? b.statut : (avant && avant.statut) || 'disponible';
  const prochaineDate = b.prochaineDate === undefined ? (avant && avant.prochaineDate) || '' : /^\d{4}-\d{2}-\d{2}$/.test(String(b.prochaineDate)) ? String(b.prochaineDate) : '';
  const places = b.placesRestantes === undefined ? (avant ? avant.placesRestantes : null) : b.placesRestantes === '' || b.placesRestantes == null ? null : Math.max(0, Math.min(9999, Math.round(Number(b.placesRestantes) || 0)));
  if (statut === 'suspendu' && !prochaineDate) return { erreur: 'Indiquez la date à laquelle l’offre reprend (ou la prochaine session).' };
  return { statut, prochaineDate, placesRestantes: places, note: b.note === undefined ? (avant && avant.note) || '' : texte(b.note, 160), maj: maintenant() };
}

/* ---------- Vue publique : prochaine action possible et alternatives ---------- */
function actionPossible(o, c) {
  const d = o.disponibilite || {};
  if (d.statut === 'suspendu') return 'alternative';
  if (d.statut === 'complet') return c.action === 'reserver' || c.action === 'demande' ? 'attente' : c.action === 'lien' ? 'alternative' : 'contacter';
  return c.action === 'reserver' ? 'reserver' : c.action === 'demande' ? 'demande' : c.action === 'contact' ? 'contacter' : 'lien';
}
function publiques() {
  const actifs = new Map(docs.tous('partenaires').filter((p) => p.statut === 'actif').map((p) => [p.id, p]));
  return docs.tous('offresPartenaires').filter((o) => o.publiee && !o.retiree && actifs.has(o.partenaireId)).map((o) => ({ o, p: actifs.get(o.partenaireId) }));
}
function vuePublique(o, p, toutes) {
  const c = o.publiee, d = o.disponibilite || { statut: 'disponible' };
  const act = actionPossible(o, c);
  const alternatives = act === 'alternative' || d.statut !== 'disponible'
    ? toutes.filter((x) => x.o.id !== o.id && (x.o.disponibilite || {}).statut === 'disponible' && ((c.serviceId && x.o.publiee.serviceId === c.serviceId) || x.p.domaine === p.domaine)).slice(0, 2)
      .map((x) => ({ id: x.o.id, titre: x.o.publiee.titre, partenaire: x.p.nom })) : [];
  return { id: o.id, titre: c.titre, description: c.description, public: c.public, conditions: c.conditions, quartier: c.quartier, lieu: c.lieu, horaires: c.horaires, capacite: c.capacite,
    gratuit: c.gratuit, prix: c.prix, serviceId: c.serviceId, action: c.action, lien: act === 'lien' ? c.lien : '', tel: c.tel, email: c.email, motsCles: c.motsCles,
    disponibilite: { statut: d.statut, prochaineDate: d.prochaineDate || '', placesRestantes: d.placesRestantes, note: d.note || '', maj: d.maj || o.maj },
    actionPossible: act, alternatives, partenaire: { id: p.id, nom: p.nom, domaine: p.domaine || '' }, verifiee: { le: (o.verification || {}).le || o.maj }, langue: 'fr' };
}
router.get('/api/partenaires/offres', (req, res) => {
  const toutes = publiques();
  let l = toutes.map(({ o, p }) => vuePublique(o, p, toutes));
  if (req.query.service) l = l.filter((x) => x.serviceId === String(req.query.service));
  const RANG = { disponible: 0, complet: 1, suspendu: 2 };
  l.sort((a, b) => RANG[a.disponibilite.statut] - RANG[b.disponibilite.statut] || a.titre.localeCompare(b.titre, 'fr'));
  const mes = req.user ? docs.tous('partenaireDemandes').filter((d) => d.userId === req.user.id) : [];
  res.set('Cache-Control', 'no-store');
  res.json({ offres: l.map((x) => Object.assign(x, { maDemande: (mes.filter((d) => d.offreId === x.id && d.statut !== 'annulee').pop() || null) && (({ id, type, statut, cree, reponse }) => ({ id, type, statut, cree, reponse: reponse || '' }))(mes.filter((d) => d.offreId === x.id && d.statut !== 'annulee').pop()) })),
    partenaires: [...new Set(l.map((x) => x.partenaire.id))].map((id) => l.find((x) => x.partenaire.id === id).partenaire), connecte: !!req.user, estPartenaire: !!partenaireDe(req.user) });
});

/* ---------- Habitant : réserver, liste d'attente, demande ---------- */
router.post('/api/partenaires/offres/:id/demande', connecte, (req, res) => {
  const o = docs.get('offresPartenaires', req.params.id);
  const p = o && docs.get('partenaires', o.partenaireId);
  if (!o || !o.publiee || o.retiree || !p || p.statut !== 'actif') return erreur(res, 404, 'Offre introuvable.');
  if (req.user.role !== 'citoyen') return erreur(res, 403, 'Les réservations sont faites par les habitants.');
  if ((p.comptes || []).includes(req.user.id)) return erreur(res, 400, 'Vous gérez cette offre : vous ne pouvez pas la réserver.');
  const act = actionPossible(o, o.publiee);
  const type = act === 'reserver' ? 'reservation' : act === 'attente' ? 'attente' : act === 'demande' ? 'demande' : null;
  if (!type) return erreur(res, 409, act === 'alternative' ? 'Cette offre est suspendue pour le moment : voyez les alternatives proposées.' : 'Cette offre se réserve directement auprès du partenaire.');
  if (docs.tous('partenaireDemandes').some((d) => d.offreId === o.id && d.userId === req.user.id && ['envoyee', 'acceptee'].includes(d.statut))) return erreur(res, 409, 'Vous avez déjà une demande en cours pour cette offre.');
  const message = texte((req.body || {}).message, 500);
  const n = docs.prochainNumero('partenaireDemandes', 0);
  const d = docs.put('partenaireDemandes', { id: 'PAR-' + String(n).padStart(4, '0'), offreId: o.id, offreTitre: o.publiee.titre, partenaireId: p.id, userId: req.user.id, type, statut: 'envoyee', message, cree: maintenant(),
    habitant: { prenom: req.user.prenom, initiale: String(req.user.nom || '').slice(0, 1) + '.', quartier: req.user.quartier || '' }, partageEmail: (req.body || {}).partageEmail === true ? req.user.email : '' });
  // une réservation occupe une place ; la dernière place passe l'offre en « complet »
  const dispo = o.disponibilite || {};
  if (type === 'reservation' && dispo.placesRestantes != null) {
    const places = Math.max(0, dispo.placesRestantes - 1);
    docs.patch('offresPartenaires', o.id, { disponibilite: Object.assign({}, dispo, { placesRestantes: places, statut: places === 0 ? 'complet' : dispo.statut, maj: maintenant() }) });
  }
  const LIB = { reservation: 'Réservation envoyée', attente: 'Inscription sur liste d’attente', demande: 'Demande envoyée' };
  notifier(req.user.id, `${LIB[type]} · ${o.publiee.titre}`, `${p.nom} vous répondra par la plateforme (numéro ${d.id}). Vous serez prévenu ici.`, 'partenaires.html#' + o.id, 'info');
  for (const c of p.comptes || []) notifier(c, `Nouvelle ${type === 'attente' ? 'inscription sur liste d’attente' : type === 'reservation' ? 'réservation' : 'demande'} · ${o.publiee.titre}`, `${d.habitant.prenom} ${d.habitant.initiale} (${d.habitant.quartier || 'quartier non indiqué'})`, 'partenaire.html#demandes', 'info');
  res.json({ ok: true, demande: { id: d.id, type, statut: d.statut, cree: d.cree } });
});
router.post('/api/partenaires/demandes/:id/annuler', connecte, (req, res) => {
  const d = docs.get('partenaireDemandes', req.params.id);
  if (!d || d.userId !== req.user.id) return erreur(res, 404, 'Demande introuvable.');
  if (!['envoyee', 'acceptee'].includes(d.statut)) return erreur(res, 409, 'Cette demande n’est plus en cours.');
  docs.patch('partenaireDemandes', d.id, { statut: 'annulee', maj: maintenant() });
  const o = docs.get('offresPartenaires', d.offreId);
  if (o && d.type === 'reservation' && o.disponibilite && o.disponibilite.placesRestantes != null) docs.patch('offresPartenaires', o.id, { disponibilite: Object.assign({}, o.disponibilite, { placesRestantes: o.disponibilite.placesRestantes + 1, statut: o.disponibilite.statut === 'complet' ? 'disponible' : o.disponibilite.statut, maj: maintenant() }) });
  res.json({ ok: true });
});

/* ---------- Espace partenaire ---------- */
const vuePartenaire = (o) => ({ id: o.id, publiee: o.publiee, proposition: o.proposition, moderation: o.moderation, disponibilite: o.disponibilite, verification: o.verification || null, retiree: !!o.retiree, cree: o.cree, maj: o.maj });
router.get('/api/partenaires/moi', exigerPartenaire, (req, res) => {
  const p = req.partenaire;
  res.set('Cache-Control', 'no-store');
  res.json({ partenaire: { id: p.id, nom: p.nom, description: p.description, domaine: p.domaine, contact: p.contact, statut: p.statut },
    offres: docs.tous('offresPartenaires').filter((o) => o.partenaireId === p.id).map(vuePartenaire),
    demandes: docs.tous('partenaireDemandes').filter((d) => d.partenaireId === p.id).reverse().slice(0, 200).map(({ userId, ...d }) => d),   // eslint-disable-line no-unused-vars
    services: docs.tous('services').map((s) => ({ id: s.id, nom: s.nom })), quartiers: QUARTIERS });
});
router.post('/api/partenaires/moi/offres', exigerPartenaire, (req, res) => {
  const c = lireContenu(req.body || {});
  if (c.erreur) return erreur(res, 400, c.erreur);
  const o = docs.put('offresPartenaires', { id: uid('off'), partenaireId: req.partenaire.id, publiee: null, proposition: c, cree: maintenant(), maj: maintenant(),
    moderation: { statut: 'en_attente', soumisLe: maintenant(), soumisPar: nom(req.user) }, disponibilite: { statut: 'disponible', prochaineDate: '', placesRestantes: c.capacite, note: '', maj: maintenant() } });
  audit(req.user, { categorie: 'partenaire', action: 'Offre partenaire proposée (en attente de vérification)', objetId: o.id, objetLibelle: `${req.partenaire.nom} · ${c.titre}`, apres: 'en attente' });
  res.json(vuePartenaire(o));
});
router.put('/api/partenaires/moi/offres/:id', exigerPartenaire, (req, res) => {
  const o = docs.get('offresPartenaires', req.params.id);
  if (!o || o.partenaireId !== req.partenaire.id) return erreur(res, 404, 'Offre introuvable.');
  const c = lireContenu(req.body || {});
  if (c.erreur) return erreur(res, 400, c.erreur);
  const maj = docs.patch('offresPartenaires', o.id, { proposition: c, maj: maintenant(), moderation: { statut: 'en_attente', soumisLe: maintenant(), soumisPar: nom(req.user) } });
  audit(req.user, { categorie: 'partenaire', action: 'Modification d’offre proposée (en attente de vérification)', objetId: o.id, objetLibelle: `${req.partenaire.nom} · ${c.titre}`, avant: o.publiee ? 'publiée' : (o.moderation || {}).statut, apres: 'en attente' });
  res.json(vuePartenaire(maj));
});
router.post('/api/partenaires/moi/offres/:id/disponibilite', exigerPartenaire, (req, res) => {
  const o = docs.get('offresPartenaires', req.params.id);
  if (!o || o.partenaireId !== req.partenaire.id) return erreur(res, 404, 'Offre introuvable.');
  const d = lireDispo(req.body || {}, o.disponibilite);
  if (d.erreur) return erreur(res, 400, d.erreur);
  const maj = docs.patch('offresPartenaires', o.id, { disponibilite: d, maj: maintenant() });
  audit(req.user, { categorie: 'partenaire', action: 'Disponibilité d’une offre partenaire', objetId: o.id, objetLibelle: `${req.partenaire.nom} · ${(o.publiee || o.proposition || {}).titre}`, avant: (o.disponibilite || {}).statut, apres: `${d.statut}${d.prochaineDate ? ' · reprise ' + d.prochaineDate : ''}${d.placesRestantes != null ? ' · ' + d.placesRestantes + ' place(s)' : ''}` });
  res.json(vuePartenaire(maj));
});
const STATUTS_DEMANDE = ['acceptee', 'refusee', 'terminee'];
router.post('/api/partenaires/moi/demandes/:id', exigerPartenaire, (req, res) => {
  const d = docs.get('partenaireDemandes', req.params.id);
  if (!d || d.partenaireId !== req.partenaire.id) return erreur(res, 404, 'Demande introuvable.');
  const statut = STATUTS_DEMANDE.includes((req.body || {}).statut) ? req.body.statut : null;
  const reponse = texte((req.body || {}).reponse, 500);
  if (!statut) return erreur(res, 400, 'Choisissez une réponse : acceptée, refusée ou terminée.');
  if (statut === 'refusee' && reponse.length < 5) return erreur(res, 400, 'Expliquez en quelques mots pourquoi (5 caractères minimum).');
  const maj = docs.patch('partenaireDemandes', d.id, { statut, reponse, repondueLe: maintenant(), reponduePar: req.partenaire.nom });
  const LIB = { acceptee: 'acceptée', refusee: 'non retenue', terminee: 'terminée' };
  if (d.userId) notifier(d.userId, `${d.offreTitre} : demande ${LIB[statut]}`, reponse || `${req.partenaire.nom} a mis à jour votre demande ${d.id}.`, 'partenaires.html#' + d.offreId, statut === 'refusee' ? 'importante' : 'info');
  const { userId, ...vue } = maj;   // eslint-disable-line no-unused-vars
  res.json(vue);
});

/* ---------- Agents : vérification avant publication ---------- */
router.get('/api/partenaires/moderation', personnel, (req, res) => {
  const part = new Map(docs.tous('partenaires').map((p) => [p.id, p]));
  const l = docs.tous('offresPartenaires').map((o) => Object.assign(vuePartenaire(o), { partenaire: part.has(o.partenaireId) ? { id: o.partenaireId, nom: part.get(o.partenaireId).nom, statut: part.get(o.partenaireId).statut } : null }));
  res.set('Cache-Control', 'no-store');
  res.json({ enAttente: l.filter((o) => (o.moderation || {}).statut === 'en_attente'), publiees: l.filter((o) => o.publiee && !o.retiree), autres: l.filter((o) => (o.moderation || {}).statut !== 'en_attente' && (!o.publiee || o.retiree)),
    partenaires: [...part.values()].map((p) => ({ id: p.id, nom: p.nom, domaine: p.domaine, statut: p.statut, contact: p.contact, comptes: (p.comptes || []).map((id) => { const u = docs.get('utilisateurs', id); return u ? { id, nom: nom(u), email: u.email } : { id, nom: '—', email: '' }; }), offres: l.filter((o) => o.partenaireId === p.id).length })),
    services: docs.tous('services').map((s) => ({ id: s.id, nom: s.nom })), estAdmin: req.user.role === 'admin' });
});
router.post('/api/partenaires/offres/:id/moderer', personnel, (req, res) => {
  const o = docs.get('offresPartenaires', req.params.id);
  if (!o) return erreur(res, 404, 'Offre introuvable.');
  if (!o.proposition || (o.moderation || {}).statut !== 'en_attente') return erreur(res, 409, 'Aucune proposition en attente pour cette offre.');
  const b = req.body || {};
  const p = docs.get('partenaires', o.partenaireId);
  const motif = texte(b.motif, 300);
  if (b.decision === 'publier') {
    if (!p || p.statut !== 'actif') return erreur(res, 409, 'Ce partenaire est suspendu : son offre ne peut pas être publiée.');
    const maj = docs.patch('offresPartenaires', o.id, { publiee: o.proposition, proposition: null, retiree: false, maj: maintenant(),
      moderation: { statut: 'publiee', par: nom(req.user), le: maintenant(), motif }, verification: { par: nom(req.user), parId: req.user.id, le: maintenant() } });
    audit(req.user, { categorie: 'partenaire', action: 'Offre partenaire vérifiée et publiée', objetId: o.id, objetLibelle: `${p.nom} · ${o.proposition.titre}`, avant: o.publiee ? 'version précédente' : 'non publiée', apres: 'publiée', motif });
    for (const c of p.comptes || []) notifier(c, `Offre publiée : ${o.proposition.titre}`, 'La ville a vérifié votre offre : elle est visible des habitants.', 'partenaire.html', 'info');
    return res.json(vuePartenaire(maj));
  }
  if (b.decision === 'refuser') {
    if (motif.length < 5) return erreur(res, 400, 'Expliquez au partenaire ce qu’il faut corriger (5 caractères minimum).');
    const maj = docs.patch('offresPartenaires', o.id, { maj: maintenant(), moderation: { statut: 'refusee', par: nom(req.user), le: maintenant(), motif } });
    audit(req.user, { categorie: 'partenaire', action: 'Offre partenaire refusée', objetId: o.id, objetLibelle: `${p ? p.nom : ''} · ${o.proposition.titre}`, avant: 'en attente', apres: 'refusée', motif });
    if (p) for (const c of p.comptes || []) notifier(c, `Offre à corriger : ${o.proposition.titre}`, motif, 'partenaire.html', 'importante');
    return res.json(vuePartenaire(maj));
  }
  return erreur(res, 400, 'Décision attendue : publier ou refuser.');
});
router.post('/api/partenaires/offres/:id/retirer', personnel, (req, res) => {
  const o = docs.get('offresPartenaires', req.params.id);
  if (!o || !o.publiee) return erreur(res, 404, 'Offre publiée introuvable.');
  const motif = texte((req.body || {}).motif, 300);
  if (motif.length < 5) return erreur(res, 400, 'Indiquez pourquoi l’offre est retirée (5 caractères minimum).');
  const retiree = (req.body || {}).retiree !== false;
  const maj = docs.patch('offresPartenaires', o.id, { retiree, maj: maintenant() });
  const p = docs.get('partenaires', o.partenaireId);
  audit(req.user, { categorie: 'partenaire', action: retiree ? 'Offre partenaire retirée de la plateforme' : 'Offre partenaire remise en ligne', objetId: o.id, objetLibelle: `${p ? p.nom : ''} · ${o.publiee.titre}`, avant: retiree ? 'publiée' : 'retirée', apres: retiree ? 'retirée' : 'publiée', motif });
  if (p) for (const c of p.comptes || []) notifier(c, `${retiree ? 'Offre retirée' : 'Offre remise en ligne'} : ${o.publiee.titre}`, motif, 'partenaire.html', 'importante');
  res.json(vuePartenaire(maj));
});

/* ---------- Administrateur : partenaires et comptes partenaires ---------- */
router.post('/api/partenaires', admin, (req, res) => {
  const b = req.body || {};
  const n = texte(b.nom, 80);
  if (n.length < 3) return erreur(res, 400, 'Indiquez le nom du partenaire.');
  if (docs.tous('partenaires').some((p) => p.nom.toLowerCase() === n.toLowerCase())) return erreur(res, 409, 'Ce partenaire existe déjà.');
  const p = docs.put('partenaires', { id: uid('par'), nom: n, description: texte(b.description, 400), domaine: texte(b.domaine, 60), contact: { tel: texte((b.contact || {}).tel, 30), email: texte((b.contact || {}).email, 120) },
    statut: 'actif', comptes: [], cree: maintenant(), valideLe: maintenant(), validePar: nom(req.user) });
  audit(req.user, { categorie: 'partenaire', action: 'Partenaire créé et validé', objetId: p.id, objetLibelle: p.nom, apres: 'actif' });
  res.json(p);
});
router.patch('/api/partenaires/:id', admin, (req, res) => {
  const p = docs.get('partenaires', req.params.id);
  if (!p) return erreur(res, 404, 'Partenaire introuvable.');
  const statut = ['actif', 'suspendu'].includes((req.body || {}).statut) ? req.body.statut : p.statut;
  const motif = texte((req.body || {}).motif, 200);
  if (statut !== p.statut && motif.length < 5) return erreur(res, 400, 'Indiquez le motif (5 caractères minimum).');
  const maj = docs.patch('partenaires', p.id, { statut, maj: maintenant() });
  audit(req.user, { categorie: 'partenaire', action: statut === 'suspendu' ? 'Partenaire suspendu' : 'Partenaire réactivé', objetId: p.id, objetLibelle: p.nom, avant: p.statut, apres: statut, motif });
  res.json(maj);
});
router.post('/api/partenaires/:id/comptes', admin, (req, res) => {
  const p = docs.get('partenaires', req.params.id);
  if (!p) return erreur(res, 404, 'Partenaire introuvable.');
  const row = A.parEmail(texte((req.body || {}).email, 120));
  if (!row) return erreur(res, 404, 'Aucun compte avec cette adresse : la personne doit d’abord créer son compte Terra Nova.');
  if (row.role !== 'citoyen') return erreur(res, 400, 'Un compte d’agent ou d’administrateur ne peut pas être rattaché à un partenaire.');
  const autre = partenaireDe({ id: row.doc_id });
  if (autre && autre.id !== p.id) return erreur(res, 409, `Ce compte est déjà rattaché à ${autre.nom}.`);
  const retirer = (req.body || {}).retirer === true;
  const comptes = new Set(p.comptes || []);
  if (retirer) comptes.delete(row.doc_id); else comptes.add(row.doc_id);
  const maj = docs.patch('partenaires', p.id, { comptes: [...comptes] });
  audit(req.user, { categorie: 'partenaire', action: retirer ? 'Compte retiré d’un partenaire' : 'Compte rattaché à un partenaire', objetId: p.id, objetLibelle: p.nom, apres: row.email });
  if (!retirer) notifier(row.doc_id, `Compte partenaire : ${p.nom}`, 'Vous pouvez proposer les offres de votre structure aux habitants. Elles sont vérifiées par la ville avant publication.', 'partenaire.html', 'importante');
  res.json({ ok: true, comptes: maj.comptes.length });
});

/* ---------- Offres dans les résultats de la recherche globale (D10) : groupe « Associations partenaires » ---------- */
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function avantRecherche(req, res, next) {
  if (req.method !== 'GET' || req.path !== '/api/recherche' || !req.query.q) return next();
  const json = res.json.bind(res);
  res.json = (o) => {
    try {
      if (res.statusCode === 200 && o && o.groupes) {
        const mots = norm(req.query.q).split(/[^a-z0-9]+/).filter((m) => m.length >= 4);
        const services = new Set([...(o.groupes.services || []).map((s) => s.id), ...(o.groupes.demarches || []).map((d) => d.service)].filter(Boolean));
        const toutes = publiques();
        const trouvees = toutes.filter(({ o: x }) => { const c = x.publiee; const t = norm([c.titre, c.description, c.motsCles, c.public].join(' ')); return (c.serviceId && services.has(c.serviceId)) || mots.some((m) => t.includes(m)); }).slice(0, 3);
        if (trouvees.length) {
          o = Object.assign({}, o, { groupes: Object.assign({}, o.groupes, { associations: (o.groupes.associations || []).concat(trouvees.map(({ o: x, p }) => {
            const v = vuePublique(x, p, toutes);
            const etat = { disponible: 'Disponible', complet: 'Complet', suspendu: 'Suspendu' }[v.disponibilite.statut];
            return { type: 'offre', id: v.id, titre: `${v.titre} — ${p.nom}`, extrait: `${etat} · proposé par ${p.nom}, vérifié par la ville`, lien: 'partenaires.html#' + v.id, action: { code: 'offre', lien: 'partenaires.html#' + v.id }, partenaire: p.nom, disponibilite: v.disponibilite.statut };
          })) }) });
          o.total = (o.total || 0) + trouvees.length;
        }
      }
    } catch (e) { /* la recherche répond quand même */ }
    return json(o);
  };
  next();
}

module.exports = router;
Object.assign(module.exports, { avantRecherche, partenaireDe, publiques, vuePublique });
