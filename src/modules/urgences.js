/* Terra Nova — vague 17 (F86, Signalement citoyen urgent) : urgence médicale.
   Quand une demande ou un signalement ressemble à une urgence médicale (mots-clés en français, anglais, espagnol et arabe,
   catégorie « urgence médicale », ou choix explicite « urgence vitale »), le serveur l'enregistre comme URGENCE MÉDICALE :
   - l'habitant voit tout de suite un écran clair (appeler le 15 / 112 d'abord, quoi faire en attendant, lieux de soins les
     plus proches) puis le statut en direct ; la plateforme rappelle toujours qu'elle ne remplace pas les secours ;
   - la demande sort de la file normale : en tête des listes des agents, priorité Critique (F80), jamais groupée ni rattachée
     (F75), jamais délestée (F77 : routes classées essentielles) ;
   - alerte immédiate aux agents de garde (notification + balise « Alertes », sans son), minuteur de prise en charge
     (« pris en charge en X min »), escalade aux administrateurs si personne ne la prend en charge dans le délai ;
   - statuts : signalée → prise en charge → transmise aux secours → close, chacun notifié à l'habitant et journalisé. */
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, audit, notifier, maintenant } = require('../donnees');

const DELAI_MIN = Math.max(1, Number(process.env.URGENCE_DELAI_MINUTES) || 5);   // délai de prise en charge avant escalade
const STATUTS = ['signalee', 'prise_en_charge', 'transmise', 'close'];
const LIB = { signalee: 'Signalée', prise_en_charge: 'Prise en charge', transmise: 'Transmise aux secours', close: 'Close' };
const sansAccent = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Mots et expressions d'urgence médicale (comparés sans accents ; l'arabe est comparé tel quel)
const MOTS = {
  fr: ['urgence vitale', 'urgence medicale', 'malaise', 'inconscient', 'inconsciente', 'perte de connaissance', 'evanoui', 'ne respire plus', 'ne respire pas', 'respire mal', 'difficulte a respirer',
    'arret cardiaque', 'crise cardiaque', 'infarctus', 'douleur thoracique', 'douleur dans la poitrine', 'avc', 'paralysie', 'convulsion', 'crise d\'epilepsie', 'hemorragie', 'saigne beaucoup',
    'overdose', 'surdose', 'etouffe', 's\'etouffe', 'noyade', 'brulure grave', 'accouche', 'accouchement imminent', 'perd les eaux', 'blesse grave', 'gravement blesse', 'tentative de suicide', 'empoisonnement', 'intoxication'],
  en: ['medical emergency', 'life-threatening', 'unconscious', 'not breathing', 'can\'t breathe', 'cannot breathe', 'heart attack', 'cardiac arrest', 'chest pain', 'stroke', 'seizure',
    'bleeding heavily', 'severe bleeding', 'overdose', 'choking', 'drowning', 'severe burn', 'giving birth', 'in labour', 'in labor', 'collapsed', 'fainted', 'seriously injured', 'poisoning'],
  es: ['urgencia medica', 'urgencia vital', 'inconsciente', 'no respira', 'le cuesta respirar', 'ataque al corazon', 'infarto', 'paro cardiaco', 'dolor en el pecho', 'derrame cerebral', 'ictus',
    'convulsion', 'hemorragia', 'sangra mucho', 'sobredosis', 'se ahoga', 'ahogamiento', 'quemadura grave', 'esta de parto', 'dando a luz', 'se desmayo', 'desmayo', 'herido grave', 'envenenamiento'],
  ar: ['حالة طارئة', 'طوارئ طبية', 'إسعاف', 'فاقد الوعي', 'فقدان الوعي', 'لا يتنفس', 'صعوبة في التنفس', 'نوبة قلبية', 'سكتة قلبية', 'ألم في الصدر', 'جلطة', 'سكتة دماغية', 'تشنج', 'نزيف',
    'جرعة زائدة', 'اختناق', 'يختنق', 'غرق', 'حروق خطيرة', 'تلد الآن', 'إغماء', 'أغمي', 'إصابة خطيرة', 'تسمم']
};
const LISTE = Object.entries(MOTS).flatMap(([langue, l]) => l.map((m) => ({ langue, m: langue === 'ar' ? m : sansAccent(m) })));
const echapRe = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
function detecter(d, explicite) {
  const motifs = [];
  if (explicite) motifs.push({ type: 'choix' });
  if (d.categorie === 'urgence-medicale') motifs.push({ type: 'categorie' });
  const brut = `${d.objet || ''} ${d.message || ''}`;
  const texte = sansAccent(brut);
  for (const { langue, m } of LISTE) {
    const ok = langue === 'ar' ? brut.includes(m) : new RegExp(`(^|[^a-z0-9])${echapRe(m)}($|[^a-z0-9])`).test(texte);
    if (ok) { motifs.push({ type: 'mot', mot: m, langue }); if (motifs.filter((x) => x.type === 'mot').length >= 3) break; }
  }
  return { urgent: motifs.length > 0, motifs };
}

/* ---------- Lieux de soins (mêmes lieux et identifiants que la carte F45 / F46) ---------- */
const CENTRES = { Centre: [400, 290], Nord: [400, 95], Sud: [400, 480], Est: [680, 290], Ouest: [110, 300] };
const LIEUX = [
  { id: 'dispensaire-central', nom: 'Dispensaire central (urgences)', type: 'urgence', quartier: 'Centre', adresse: 'Dôme B, avenue du Dispensaire', tel: '01 55 00 15 15', h24: true, x: 345, y: 205 },
  { id: 'hopital-nova', nom: 'Hôpital de Nova (urgences)', type: 'urgence', quartier: 'Est', adresse: 'Boulevard Kepler, quartier Est', tel: '01 55 00 11 12', h24: true, x: 620, y: 215 },
  { id: 'poste-secours-sud', nom: 'Poste de secours du dôme Sud', type: 'urgence', quartier: 'Sud', adresse: 'Niveau 0, dôme Sud, près du canal', tel: '01 55 00 11 18', h24: false, horaires: '8h–22h', ouvre: 8, ferme: 22, x: 235, y: 435 },
  { id: 'soins-nord', nom: 'Centre de soins du quartier Nord', type: 'sante', quartier: 'Nord', adresse: 'Allée des Serres, quartier Nord', tel: '01 55 00 12 10', h24: false, horaires: 'Lun–Ven 8h–19h', x: 260, y: 120 },
  { id: 'soins-ouest', nom: 'Centre de soins du quartier Ouest', type: 'sante', quartier: 'Ouest', adresse: 'Rue des Jardins, quartier Ouest', tel: '01 55 00 12 20', h24: false, horaires: 'Lun–Sam 8h–18h', x: 175, y: 250 },
  { id: 'pharmacie-garde', nom: 'Pharmacie de garde', type: 'sante', quartier: 'Centre', adresse: 'Quai des Arrivées, niveau 0', tel: '01 55 00 12 30', h24: false, horaires: '19h–8h, dimanche 24h/24', x: 530, y: 330 }
];
function points(quartier) {
  const c = CENTRES[quartier] || CENTRES.Centre;
  const dist = (x, y) => Math.round(Math.hypot(x - c[0], y - c[1]));
  const lieux = LIEUX.map((l) => Object.assign({}, l, { distance: dist(l.x, l.y), lien: 'carte.html?lieu=' + l.id }));
  // associations partenaires (F74) qui aident pour la santé
  for (const a of docs.tous('associations')) if ((a.services || []).includes('sante')) lieux.push({ id: a.id, nom: a.nom, type: 'association', quartier: a.quartier, adresse: a.adresse, tel: a.tel, h24: false, distance: dist(a.x || 400, a.y || 290), lien: 'carte.html?lieu=' + a.id });
  return lieux.sort((a, b) => (b.type === 'urgence') - (a.type === 'urgence') || a.distance - b.distance).slice(0, 5);
}

/* ---------- Création : repérage de l'urgence au moment où la demande est enregistrée ---------- */
const personnelActif = () => db.prepare("SELECT doc_id FROM users WHERE role IN ('agent','admin')").all().map((r) => r.doc_id).filter((id) => { const p = id && docs.get('utilisateurs', id); return p && p.actif !== false; });
const admins = () => db.prepare("SELECT doc_id FROM users WHERE role = 'admin'").all().map((r) => r.doc_id).filter(Boolean);

function marquer(d, motifs, explicite) {
  const t = maintenant();
  const urgence = { statut: 'signalee', signaleeLe: t, echeance: new Date(Date.now() + DELAI_MIN * 60e3).toISOString(), delaiMinutes: DELAI_MIN, motifs, explicite: !!explicite,
    priseEnCharge: null, escalade: null, historique: [{ date: t, statut: 'signalee', note: 'Urgence médicale enregistrée : les agents de garde sont alertés immédiatement.', par: 'Système' }] };
  const maj = docs.patch('demandes', d.id, { urgenceMedicale: urgence, priorite: 'urgente',
    historique: (d.historique || []).concat([{ date: t, statut: d.statut, note: 'URGENCE MÉDICALE : traitée hors de la file normale, en priorité absolue. Terra Nova ne remplace pas les secours (15 / 112).', par: 'Système' }]) });
  const quoi = `${d.objet || 'Urgence médicale'}${d.quartier ? ' · quartier ' + d.quartier : ''}`;
  for (const id of personnelActif()) notifier(id, `Urgence médicale signalée · ${d.id}`, `${quoi}. À prendre en charge dans les ${DELAI_MIN} minutes.`, 'agent-demandes.html?urgences=1#urgences', 'alerte');
  if (d.userId) notifier(d.userId, `Urgence médicale enregistrée · ${d.id}`, 'Si ce n’est pas déjà fait, appelez le 15 (SAMU) ou le 112. Les agents de la mairie sont alertés ; suivez le statut en direct.', 'urgence.html?id=' + d.id, 'alerte');
  audit(null, { categorie: 'demande', action: 'Urgence médicale signalée', objetId: d.id, objetLibelle: d.objet || '', apres: 'signalée', motif: motifs.map((m) => (m.type === 'mot' ? `mot « ${m.mot} » (${m.langue})` : m.type === 'choix' ? 'choix « urgence vitale »' : 'catégorie urgence médicale')).join(', ') });
  return maj;
}

// Monté avant les routes de l'API : le champ de statut de l'urgence ne peut pas venir du navigateur
function avantCreation(req, res, next) {
  if (req.method !== 'POST' || req.path !== '/api/docs/demandes' || !req.body || Array.isArray(req.body) || typeof req.body !== 'object') return next();
  const explicite = req.body.urgenceVitale === true;
  delete req.body.urgenceMedicale; delete req.body.urgenceVitale;
  const json = res.json.bind(res);
  res.json = (obj) => {
    try {
      if (res.statusCode < 300 && obj && /^NT-/.test(obj.id || '')) {
        const d = docs.get('demandes', obj.id);
        const r = d && !d.urgenceMedicale ? detecter(d, explicite) : { urgent: false };
        if (r.urgent) { const maj = marquer(d, r.motifs, explicite); Object.assign(obj, { urgenceMedicale: maj.urgenceMedicale, priorite: maj.priorite, historique: maj.historique }); }
      }
    } catch (e) { console.error('[urgences] repérage', e.message); }
    return json(obj);
  };
  next();
}

/* ---------- Vues ---------- */
const minutes = (a, b) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 60000));
function vue(d, complet) {
  const u = d.urgenceMedicale;
  const base = { id: d.id, statut: u.statut, libelle: LIB[u.statut], signaleeLe: u.signaleeLe, echeance: u.echeance, delaiMinutes: u.delaiMinutes,
    priseEnCharge: u.priseEnCharge ? { le: u.priseEnCharge.le, minutes: u.priseEnCharge.minutes, par: (u.priseEnCharge.par || '').split(' ')[0] } : null,
    escalade: u.escalade ? { le: u.escalade.le } : null, historique: (u.historique || []).map((h) => ({ date: h.date, statut: h.statut, note: h.note })), quartier: d.quartier || '' };
  if (complet) Object.assign(base, { objet: d.objet, message: d.message, lieu: d.lieu || '', type: d.type, serviceId: d.serviceId, userId: d.userId, contactNom: d.contactNom || '',
    motifs: u.motifs, explicite: u.explicite, demandeStatut: d.statut, agent: d.agent || '', priseEnChargePar: u.priseEnCharge ? u.priseEnCharge.par : '',
    historique: u.historique, transmiseLe: u.transmiseLe || null, closeLe: u.closeLe || null });
  return base;
}
const toutes = () => docs.tous('demandes').filter((d) => d.urgenceMedicale);
const ordre = (a, b) => (a.urgenceMedicale.statut === 'close') - (b.urgenceMedicale.statut === 'close') || STATUTS.indexOf(a.urgenceMedicale.statut) - STATUTS.indexOf(b.urgenceMedicale.statut)
  || String(a.urgenceMedicale.signaleeLe).localeCompare(String(b.urgenceMedicale.signaleeLe));

/* ---------- Routes ---------- */
const personnel = A.exigerRole('agent', 'admin');
router.get('/api/urgences', personnel, (req, res) => {
  const l = toutes().sort(ordre);
  const prises = l.filter((d) => d.urgenceMedicale.priseEnCharge);
  res.set('Cache-Control', 'no-store');
  res.json({ delaiMinutes: DELAI_MIN, urgences: l.slice(0, 100).map((d) => vue(d, true)),
    compte: { signalee: l.filter((d) => d.urgenceMedicale.statut === 'signalee').length, prise_en_charge: l.filter((d) => d.urgenceMedicale.statut === 'prise_en_charge').length,
      transmise: l.filter((d) => d.urgenceMedicale.statut === 'transmise').length, close: l.filter((d) => d.urgenceMedicale.statut === 'close').length,
      escaladees: l.filter((d) => d.urgenceMedicale.escalade && d.urgenceMedicale.statut === 'signalee').length },
    delaiMoyenPriseEnCharge: prises.length ? Math.round(prises.reduce((n, d) => n + d.urgenceMedicale.priseEnCharge.minutes, 0) / prises.length) : null });
});

router.post('/api/urgences/:id/statut', personnel, (req, res) => {
  const d = docs.get('demandes', req.params.id);
  if (!d || !d.urgenceMedicale) return res.status(404).json({ erreur: 'Urgence introuvable.' });
  const b = req.body || {};
  const statut = String(b.statut || '');
  const note = String(b.note || '').trim().slice(0, 500);
  const u = d.urgenceMedicale;
  if (!STATUTS.includes(statut) || statut === 'signalee') return res.status(400).json({ erreur: 'Statut attendu : prise_en_charge, transmise ou close.' });
  if (u.statut === 'close') return res.status(409).json({ erreur: 'Cette urgence est déjà close.' });
  if (statut === u.statut) return res.status(409).json({ erreur: 'L’urgence a déjà ce statut.' });
  if (statut === 'close' && note.length < 5) return res.status(400).json({ erreur: 'Indiquez en quelques mots comment l’urgence a été close (5 caractères minimum).' });
  const t = maintenant(), par = `${req.user.prenom} ${req.user.nom}`;
  const maj = Object.assign({}, u);
  if (!maj.priseEnCharge) maj.priseEnCharge = { le: t, par, parId: req.user.id, minutes: minutes(u.signaleeLe, t) };   // toute action vaut prise en charge
  if (statut === 'transmise') maj.transmiseLe = t;
  if (statut === 'close') maj.closeLe = t;
  maj.statut = statut;
  const notes = { prise_en_charge: `Prise en charge par ${par} en ${maj.priseEnCharge.minutes} min.`, transmise: 'Transmise aux secours (SAMU / pompiers).', close: 'Urgence close.' };
  maj.historique = (u.historique || []).concat([{ date: t, statut, note: notes[statut] + (note ? ' ' + note : ''), par }]);
  const statutDemande = statut === 'close' ? 'traitee' : 'en_cours';
  docs.patch('demandes', d.id, { urgenceMedicale: maj, agent: d.agent || par, statut: statutDemande,
    historique: (d.historique || []).concat([{ date: t, statut: statutDemande, note: `Urgence médicale : ${LIB[statut]}. ${note}`.trim(), par }]) });
  audit(req.user, { categorie: 'demande', action: 'Urgence médicale : ' + LIB[statut], objetId: d.id, objetLibelle: d.objet || '', avant: LIB[u.statut], apres: LIB[statut], motif: note || notes[statut] });
  const textes = { prise_en_charge: `Un agent de la mairie a pris en charge votre signalement en ${maj.priseEnCharge.minutes} min.`, transmise: 'Votre signalement a été transmis aux secours.', close: `Urgence close. ${note}` };
  if (d.userId) notifier(d.userId, `Urgence ${d.id} : ${LIB[statut].toLowerCase()}`, textes[statut], 'urgence.html?id=' + d.id, statut === 'close' ? 'importante' : 'alerte');
  res.json(vue(docs.get('demandes', d.id), true));
});

// Statut en direct pour l'habitant : l'auteur connecté, le personnel, ou un visiteur avec le code de l'accusé de réception (F83)
router.get('/api/urgences/:id/statut', (req, res) => {
  const d = docs.get('demandes', req.params.id);
  const code = String(req.query.code || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  let autorise = false;
  if (d && d.urgenceMedicale) {
    if (A.estPersonnel(req.user) || (req.user && d.userId === req.user.id)) autorise = true;
    else if (code) { try { autorise = require('./accuses').accuseDe(d).code.replace('-', '') === code; } catch { autorise = false; } }
  }
  if (!autorise) return res.status(404).json({ erreur: 'Urgence introuvable.' });
  res.set('Cache-Control', 'no-store');
  res.json(Object.assign(vue(d, false), { points: points(d.quartier || (req.user && req.user.quartier) || 'Centre') }));
});
router.get('/api/urgences-points', (req, res) => { res.set('Cache-Control', 'public, max-age=300'); res.json(points(String(req.query.quartier || 'Centre'))); });

/* Veille en direct pour la balise « Alertes » (toutes les pages, utilisateur connecté) :
   personnel → urgences ouvertes ; habitant → ses urgences en cours ; tous → alertes « activité inhabituelle » à confirmer */
/* Vague 19 (F95) : même contenu réutilisé par GET /api/pouls (une lecture périodique au lieu de trois), sans l'heure du serveur */
function veillePour(u) {
  const staff = A.estPersonnel(u);
  const ouvertes = toutes().filter((d) => d.urgenceMedicale.statut !== 'close' && (staff || d.userId === u.id)).sort(ordre);
  return { personnel: staff, delaiMinutes: DELAI_MIN,
    urgences: ouvertes.slice(0, 10).map((d) => Object.assign(vue(d, false), staff ? { objet: d.objet } : {})),
    activite: docs.tous('activites').filter((a) => a.userId === u.id && a.statut === 'a_confirmer').slice(-3).map((a) => ({ id: a.id, date: a.date, raisons: a.raisons, libelles: a.libelles })) };
}
router.get('/api/veille', A.exigerRole(...A.ROLES), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(Object.assign(veillePour(req.user), { maintenant: maintenant() }));
});

/* ---------- Escalade : aucune prise en charge dans le délai ---------- */
function escalader() {
  const t = Date.now();
  for (const d of toutes()) {
    const u = d.urgenceMedicale;
    if (u.statut !== 'signalee' || u.escalade || Date.parse(u.echeance) > t) continue;
    const le = maintenant();
    docs.patch('demandes', d.id, { urgenceMedicale: Object.assign({}, u, { escalade: { le, niveau: 1 },
      historique: (u.historique || []).concat([{ date: le, statut: 'signalee', note: `Pas encore prise en charge après ${u.delaiMinutes} min : escaladée au responsable de garde.`, par: 'Système' }]) }) });
    const cibles = new Set(admins().concat(personnelActif()));
    for (const id of cibles) notifier(id, `ESCALADE · urgence médicale ${d.id} non prise en charge`, `Signalée il y a ${minutes(u.signaleeLe, le)} min (${d.objet || ''}). Prenez-la en charge maintenant.`, 'agent-demandes.html?urgences=1#urgences', 'alerte');
    audit(null, { categorie: 'demande', action: 'Urgence médicale escaladée', objetId: d.id, objetLibelle: d.objet || '', avant: 'signalée', apres: 'escaladée', motif: `Aucune prise en charge après ${u.delaiMinutes} min` });
  }
}
setInterval(() => { try { escalader(); } catch (e) { console.error('[urgences] escalade', e.message); } }, 30e3).unref();

module.exports = router;
module.exports.avantCreation = avantCreation;
module.exports.detecter = detecter;
module.exports.LIEUX = LIEUX;
module.exports.veillePour = veillePour;   // vague 19 (F95) : GET /api/pouls
