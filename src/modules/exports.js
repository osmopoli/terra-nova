/* Terra Nova — vague 17 (F88, Service Qualité) : exports des données de suivi pour les autres services.
   L'agent choisit un jeu de données (demandes, signalements, rendez-vous, avis sur les services, avis des consultations,
   idées), les colonnes utiles (libellés clairs), des filtres (période, service, quartier, statut, priorité), voit un aperçu
   des premières lignes, puis récupère un fichier simple et réutilisable : CSV pour Excel en français (séparateur « ; »,
   UTF-8 avec BOM), JSON, ou tableau HTML imprimable. Données personnelles réduites par défaut : noms remplacés par un
   pseudonyme stable (« Habitant-3F9A2C »), e-mails et téléphones retirés, coordonnées masquées dans les textes libres ;
   l'export nominatif est réservé aux agents habilités (F70), après confirmation du mot de passe. Modèles d'export
   enregistrés (« Transmission hebdo au Service Qualité »), historique de chaque export (journal d'audit).
   Rôles contrôlés par le serveur : agent / admin (citoyen 403, visiteur 401). */
const router = require('express').Router();
const crypto = require('node:crypto');
const A = require('../auth');
const { docs, audit, uid, maintenant } = require('../donnees');
const { deriver } = require('../chiffrement');

const L = (fr, en, es, ar) => ({ fr, en, es, ar });
const SECRET = deriver('exports-pseudonymes-v17');
const pseudo = (id) => (id ? 'Habitant-' + crypto.createHmac('sha256', SECRET).update(String(id)).digest('hex').slice(0, 6).toUpperCase() : '');
const masquerTexte = (t) => String(t || '').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[e-mail masqué]').replace(/(\+?\d[\d .-]{7,}\d)/g, '[numéro masqué]');
const jour = (iso) => (iso ? String(iso).slice(0, 10) : '');
const dateHeure = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: process.env.TZ_VILLE || 'Indian/Mayotte' }) : '');
const STATUTS = { recue: 'Reçue', en_cours: 'En cours', traitee: 'Traitée', cloturee: 'Clôturée', confirme: 'Confirmé', annule: 'Annulé', publie: 'Publié', non_publie: 'Non publié', etude: 'À l’étude', retenue: 'Retenue', non_retenue: 'Non retenue' };
const TYPES = { contact: 'Contact', signalement: 'Signalement', demarche: 'Démarche' };
const NIVEAUX = { critique: 'Critique', haute: 'Haute', normale: 'Normale', basse: 'Basse' };

/* ---------- Contexte partagé d'un export (calculé une fois) ---------- */
function contexte() {
  const services = new Map(docs.tous('services').map((s) => [s.id, (s.nom && s.nom.fr) || s.nom || s.id]));
  const utilisateurs = new Map(docs.tous('utilisateurs').map((u) => [u.id, u]));
  const consultations = new Map(docs.tous('consultations').map((c) => [c.id, c.titre]));
  let priorites = new Map();
  try { priorites = require('./priorites').tout(); } catch { /* calcul indisponible */ }
  return { services, utilisateurs, consultations, priorites };
}
const habitant = (c, id, perso) => { if (!id) return ''; if (!perso) return pseudo(id); const u = c.utilisateurs.get(id); return u ? `${u.prenom} ${u.nom}` : pseudo(id); };
const email = (c, id, perso) => { if (!perso || !id) return ''; const u = c.utilisateurs.get(id); return u ? u.email || '' : ''; };
const quartierDe = (c, d) => d.quartier || ((c.utilisateurs.get(d.userId) || {}).quartier) || '';

/* ---------- Jeux de données et colonnes ---------- */
const colDemande = [
  { cle: 'id', l: L('Numéro', 'Number', 'Número', 'الرقم'), v: (d) => d.id },
  { cle: 'cree', l: L('Date de dépôt', 'Submitted on', 'Fecha de envío', 'تاريخ الإيداع'), v: (d) => dateHeure(d.cree) },
  { cle: 'type', l: L('Type', 'Type', 'Tipo', 'النوع'), v: (d) => TYPES[d.type] || d.type || '' },
  { cle: 'objet', l: L('Objet', 'Subject', 'Asunto', 'الموضوع'), v: (d, c, p) => (p ? d.objet : masquerTexte(d.objet)) },
  { cle: 'service', l: L('Service', 'Service', 'Servicio', 'الخدمة'), v: (d, c) => c.services.get(d.serviceId) || '' },
  { cle: 'quartier', l: L('Quartier', 'District', 'Barrio', 'الحي'), v: (d, c) => quartierDe(c, d) },
  { cle: 'statut', l: L('Statut', 'Status', 'Estado', 'الحالة'), v: (d) => STATUTS[d.statut] || d.statut || '' },
  { cle: 'priorite', l: L('Priorité', 'Priority', 'Prioridad', 'الأولوية'), v: (d, c) => NIVEAUX[(c.priorites.get(d.id) || {}).niveau] || '' },
  { cle: 'agent', l: L('Agent en charge', 'Assigned agent', 'Agente a cargo', 'الموظف المسؤول'), v: (d) => d.agent || '' },
  { cle: 'maj', l: L('Dernière mise à jour', 'Last update', 'Última actualización', 'آخر تحديث'), v: (d) => dateHeure(((d.historique || []).slice(-1)[0] || {}).date || d.cree) },
  { cle: 'delai', l: L('Délai de traitement (jours)', 'Handling time (days)', 'Plazo de tratamiento (días)', 'مدة المعالجة (أيام)'), v: (d) => { const h = (d.historique || []).find((x) => x.statut === 'traitee'); return h ? String(Math.round(((Date.parse(h.date) - Date.parse(d.cree)) / 864e5) * 10) / 10).replace('.', ',') : ''; } },
  { cle: 'urgence', l: L('Urgence médicale', 'Medical emergency', 'Urgencia médica', 'حالة طبية طارئة'), v: (d) => (d.urgenceMedicale ? 'Oui' : 'Non') },
  { cle: 'soutiens', l: L('Soutiens', 'Supports', 'Apoyos', 'الدعم'), v: (d) => String((d.soutiens || []).length) },
  { cle: 'message', l: L('Message', 'Message', 'Mensaje', 'الرسالة'), texte: true, v: (d, c, p) => (p ? d.message : masquerTexte(d.message)) || '' },
  { cle: 'habitant', l: L('Habitant', 'Resident', 'Habitante', 'الساكن'), perso: true, v: (d, c, p) => habitant(c, d.userId, p) || (p ? d.contactNom || '' : d.contactNom ? 'Visiteur' : '') },
  { cle: 'email', l: L('E-mail', 'E-mail', 'Correo', 'البريد الإلكتروني'), perso: true, nominatif: true, v: (d, c, p) => email(c, d.userId, p) || (p ? d.contactEmail || '' : '') },
  { cle: 'telephone', l: L('Téléphone', 'Phone', 'Teléfono', 'الهاتف'), perso: true, nominatif: true, v: (d, c, p) => (p && d.userId ? (c.utilisateurs.get(d.userId) || {}).telephone || '' : '') }
];
const JEUX = {
  demandes: { l: L('Demandes (toutes)', 'Requests (all)', 'Solicitudes (todas)', 'الطلبات (الكل)'), col: 'demandes', date: 'cree', filtre: () => true, colonnes: colDemande,
    defaut: ['id', 'cree', 'type', 'objet', 'service', 'quartier', 'statut', 'priorite', 'delai'], statuts: ['recue', 'en_cours', 'traitee', 'cloturee'], priorite: true },
  signalements: { l: L('Signalements', 'Reports', 'Avisos', 'البلاغات'), col: 'demandes', date: 'cree', filtre: (d) => d.type === 'signalement', colonnes: colDemande,
    defaut: ['id', 'cree', 'objet', 'service', 'quartier', 'statut', 'priorite', 'soutiens'], statuts: ['recue', 'en_cours', 'traitee', 'cloturee'], priorite: true },
  rdv: { l: L('Rendez-vous', 'Appointments', 'Citas', 'المواعيد'), col: 'rdv', date: 'debut', filtre: () => true, statuts: ['confirme', 'annule'],
    defaut: ['id', 'debut', 'service', 'statut', 'motif'], colonnes: [
      { cle: 'id', l: L('Référence', 'Reference', 'Referencia', 'المرجع'), v: (d) => d.id },
      { cle: 'debut', l: L('Date du rendez-vous', 'Appointment date', 'Fecha de la cita', 'تاريخ الموعد'), v: (d) => dateHeure(d.debut) },
      { cle: 'service', l: L('Service', 'Service', 'Servicio', 'الخدمة'), v: (d, c) => c.services.get(d.serviceId) || '' },
      { cle: 'statut', l: L('Statut', 'Status', 'Estado', 'الحالة'), v: (d) => STATUTS[d.statut] || d.statut || '' },
      { cle: 'motif', l: L('Motif', 'Reason', 'Motivo', 'السبب'), texte: true, v: (d, c, p) => (p ? d.motif || d.libelle || '' : masquerTexte(d.motif || d.libelle || '')) },
      { cle: 'lieu', l: L('Lieu', 'Place', 'Lugar', 'المكان'), v: (d) => d.lieu || '' },
      { cle: 'agent', l: L('Agent', 'Agent', 'Agente', 'الموظف'), v: (d) => d.agent || '' },
      { cle: 'cree', l: L('Pris le', 'Booked on', 'Reservada el', 'تاريخ الحجز'), v: (d) => dateHeure(d.cree) },
      { cle: 'habitant', l: L('Habitant', 'Resident', 'Habitante', 'الساكن'), perso: true, v: (d, c, p) => habitant(c, d.userId, p) },
      { cle: 'email', l: L('E-mail', 'E-mail', 'Correo', 'البريد الإلكتروني'), perso: true, nominatif: true, v: (d, c, p) => email(c, d.userId, p) }] },
  avisServices: { l: L('Avis sur les services', 'Service feedback', 'Opiniones sobre los servicios', 'آراء حول الخدمات'), col: 'avisServices', date: 'cree', filtre: () => true, statuts: ['publie', 'non_publie'],
    defaut: ['id', 'cree', 'service', 'note', 'commentaire', 'statut', 'reponse'], colonnes: [
      { cle: 'id', l: L('Reçu', 'Receipt', 'Recibo', 'الإيصال'), v: (d) => d.id },
      { cle: 'cree', l: L('Date', 'Date', 'Fecha', 'التاريخ'), v: (d) => dateHeure(d.cree) },
      { cle: 'service', l: L('Service', 'Service', 'Servicio', 'الخدمة'), v: (d, c) => c.services.get(d.serviceId) || '' },
      { cle: 'demarche', l: L('Démarche', 'Procedure', 'Trámite', 'الإجراء'), v: (d) => d.procedureLibelle || '' },
      { cle: 'note', l: L('Note sur 5', 'Rating out of 5', 'Nota sobre 5', 'التقييم من 5'), v: (d) => String(d.note || '') },
      { cle: 'commentaire', l: L('Commentaire', 'Comment', 'Comentario', 'التعليق'), texte: true, v: (d, c, p) => (p ? d.commentaire || '' : masquerTexte(d.commentaire)) },
      { cle: 'statut', l: L('Statut', 'Status', 'Estado', 'الحالة'), v: (d) => STATUTS[d.statut] || d.statut || '' },
      { cle: 'reponse', l: L('Réponse du service', 'Service reply', 'Respuesta del servicio', 'رد الخدمة'), v: (d) => (d.reponse && d.reponse.texte ? 'Oui' : 'Non') },
      { cle: 'habitant', l: L('Habitant', 'Resident', 'Habitante', 'الساكن'), perso: true, v: (d, c, p) => habitant(c, d.userId, p) }] },
  avis: { l: L('Avis des consultations', 'Consultation opinions', 'Opiniones de las consultas', 'آراء الاستشارات'), col: 'avis', date: 'cree', filtre: () => true, statuts: [],
    defaut: ['id', 'cree', 'consultation', 'option', 'commentaire'], colonnes: [
      { cle: 'id', l: L('Reçu', 'Receipt', 'Recibo', 'الإيصال'), v: (d) => d.id },
      { cle: 'cree', l: L('Date', 'Date', 'Fecha', 'التاريخ'), v: (d) => dateHeure(d.cree) },
      { cle: 'consultation', l: L('Consultation', 'Consultation', 'Consulta', 'الاستشارة'), v: (d, c) => c.consultations.get(d.consultationId) || d.consultationId || '' },
      { cle: 'option', l: L('Avis donné', 'Opinion given', 'Opinión', 'الرأي'), v: (d) => d.option || '' },
      { cle: 'commentaire', l: L('Commentaire', 'Comment', 'Comentario', 'التعليق'), texte: true, v: (d, c, p) => (p ? d.commentaire || '' : masquerTexte(d.commentaire)) },
      { cle: 'quartier', l: L('Quartier', 'District', 'Barrio', 'الحي'), v: (d, c) => quartierDe(c, d) },
      { cle: 'habitant', l: L('Habitant', 'Resident', 'Habitante', 'الساكن'), perso: true, v: (d, c, p) => habitant(c, d.userId, p) }] },
  idees: { l: L('Idées des habitants', 'Residents’ ideas', 'Ideas de los habitantes', 'أفكار السكان'), col: 'idees', date: 'cree', filtre: () => true, statuts: ['recue', 'etude', 'retenue', 'non_retenue'],
    defaut: ['id', 'cree', 'titre', 'categorie', 'quartier', 'statut'], colonnes: [
      { cle: 'id', l: L('Numéro', 'Number', 'Número', 'الرقم'), v: (d) => d.id },
      { cle: 'cree', l: L('Date', 'Date', 'Fecha', 'التاريخ'), v: (d) => dateHeure(d.cree) },
      { cle: 'titre', l: L('Titre', 'Title', 'Título', 'العنوان'), v: (d) => d.titre || '' },
      { cle: 'categorie', l: L('Catégorie', 'Category', 'Categoría', 'الفئة'), v: (d) => d.categorie || '' },
      { cle: 'quartier', l: L('Quartier', 'District', 'Barrio', 'الحي'), v: (d) => d.quartier || '' },
      { cle: 'statut', l: L('Statut', 'Status', 'Estado', 'الحالة'), v: (d) => STATUTS[d.statut] || d.statut || '' },
      { cle: 'description', l: L('Description', 'Description', 'Descripción', 'الوصف'), texte: true, v: (d, c, p) => (p ? d.description || '' : masquerTexte(d.description)) },
      { cle: 'habitant', l: L('Habitant', 'Resident', 'Habitante', 'الساكن'), perso: true, v: (d, c, p) => habitant(c, d.userId, p) },
      { cle: 'email', l: L('E-mail', 'E-mail', 'Correo', 'البريد الإلكتروني'), perso: true, nominatif: true, v: (d, c, p) => email(c, d.userId, p) }] }
};
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const estHabilite = (u) => { try { return require('./securite').estHabilite(u); } catch { return u && u.role === 'admin'; } };

/* ---------- Lecture des paramètres et calcul des lignes ---------- */
function periode(f) {
  const t = Date.now();
  if (f.periode === '7j') return [t - 7 * 864e5, t + 60e3];
  if (f.periode === '30j') return [t - 30 * 864e5, t + 60e3];
  if (f.periode === 'mois') { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), t + 60e3]; }
  if (f.periode === 'dates') return [f.du ? Date.parse(f.du) : -Infinity, f.au ? Date.parse(f.au) + 864e5 : Infinity];
  return [-Infinity, Infinity];
}
function lire(req) {
  const b = req.body || {};
  const jeu = JEUX[b.jeu];
  if (!jeu) return { erreur: 'Jeu de données inconnu.' };
  const cles = (Array.isArray(b.colonnes) ? b.colonnes : jeu.defaut).map(String).filter((k) => jeu.colonnes.some((c) => c.cle === k));
  if (!cles.length) return { erreur: 'Choisissez au moins une colonne.' };
  const f = b.filtres && typeof b.filtres === 'object' ? b.filtres : {};
  const filtres = { periode: ['7j', '30j', 'mois', 'dates', 'tout'].includes(f.periode) ? f.periode : 'tout', du: jour(f.du), au: jour(f.au),
    service: String(f.service || ''), quartier: QUARTIERS.includes(f.quartier) ? f.quartier : '', statut: String(f.statut || ''), priorite: NIVEAUX[f.priorite] ? f.priorite : '' };
  const nominatif = b.pseudonymiser === false;
  if (nominatif && !estHabilite(req.user)) return { code: 403, erreur: 'Les exports nominatifs sont réservés aux agents habilités (données réservées). Gardez la pseudonymisation ou demandez une habilitation à l’administrateur.' };
  const format = ['csv', 'json', 'tableau'].includes(b.format) ? b.format : 'csv';
  const langue = ['fr', 'en', 'es', 'ar'].includes(b.langue) ? b.langue : 'fr';
  return { jeu, cleJeu: b.jeu, cles, filtres, nominatif, format, langue };
}
function lignes(p) {
  const c = contexte();
  const [du, au] = periode(p.filtres);
  const cols = p.cles.map((k) => p.jeu.colonnes.find((x) => x.cle === k));
  const l = docs.tous(p.jeu.col).filter((d) => {
    if (!p.jeu.filtre(d)) return false;
    const t = Date.parse(d[p.jeu.date] || d.cree);
    if (Number.isFinite(t) && (t < du || t >= au)) return false;
    if (p.filtres.service && d.serviceId !== p.filtres.service) return false;
    if (p.filtres.quartier && quartierDe(c, d) !== p.filtres.quartier) return false;
    if (p.filtres.statut && d.statut !== p.filtres.statut) return false;
    if (p.filtres.priorite && p.jeu.priorite && (c.priorites.get(d.id) || {}).niveau !== p.filtres.priorite) return false;
    return true;
  }).sort((a, b) => String(b[p.jeu.date] || b.cree).localeCompare(String(a[p.jeu.date] || a.cree)));
  return { colonnes: cols.map((x) => ({ cle: x.cle, libelle: x.l[p.langue] || x.l.fr, perso: !!x.perso })), lignes: l.map((d) => cols.map((x) => { const v = x.v(d, c, p.nominatif); return v == null ? '' : String(v); })) };
}

/* ---------- Formats ---------- */
const cellule = (v) => { let s = String(v).replace(/\r?\n/g, ' '); if (/^[=+\-@\t]/.test(s)) s = "'" + s; return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };   // pas de formule exécutée par le tableur
const echap = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function fichier(p, r, titre) {
  const date = new Date().toISOString().slice(0, 10);
  const base = `terra-nova-${p.cleJeu}-${date}`;
  if (p.format === 'json') return { nom: base + '.json', type: 'application/json; charset=utf-8', corps: JSON.stringify({ exporte: maintenant(), jeu: p.cleJeu, filtres: p.filtres, pseudonymise: !p.nominatif,
    colonnes: r.colonnes.map((c) => c.libelle), lignes: r.lignes.map((l) => Object.fromEntries(r.colonnes.map((c, i) => [c.libelle, l[i]]))) }, null, 2) };
  if (p.format === 'tableau') return { nom: base + '.html', type: 'text/html; charset=utf-8', corps: `<!doctype html><html lang="${p.langue}" dir="${p.langue === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${echap(titre)}</title>
<style>body{font-family:Inter,Arial,sans-serif;margin:1.5rem;color:#111}table{border-collapse:collapse;width:100%;font-size:.85rem}th,td{border:1px solid #999;padding:.35rem .5rem;text-align:start;vertical-align:top}th{background:#e6f2f1}caption{text-align:start;font-weight:700;margin-bottom:.5rem}</style></head>
<body><table><caption>${echap(titre)} · ${r.lignes.length} ligne(s) · ${echap(dateHeure(maintenant()))}${p.nominatif ? '' : ' · données pseudonymisées'}</caption><thead><tr>${r.colonnes.map((c) => `<th scope="col">${echap(c.libelle)}</th>`).join('')}</tr></thead>
<tbody>${r.lignes.map((l) => `<tr>${l.map((v) => `<td>${echap(v)}</td>`).join('')}</tr>`).join('\n')}</tbody></table></body></html>` };
  return { nom: base + '.csv', type: 'text/csv; charset=utf-8', corps: '﻿' + [r.colonnes.map((c) => cellule(c.libelle)).join(';')].concat(r.lignes.map((l) => l.map(cellule).join(';'))).join('\r\n') + '\r\n' };
}

/* ---------- Routes ---------- */
const personnel = A.exigerRole('agent', 'admin');
router.get('/api/exports/definitions', personnel, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ habilite: estHabilite(req.user), quartiers: QUARTIERS, niveaux: Object.keys(NIVEAUX), statutsLibelles: STATUTS,
    services: docs.tous('services').map((s) => ({ id: s.id, nom: s.nom })),
    jeux: Object.entries(JEUX).map(([cle, j]) => ({ cle, libelle: j.l, statuts: j.statuts, priorite: !!j.priorite, defaut: j.defaut,
      colonnes: j.colonnes.map((c) => ({ cle: c.cle, libelle: c.l, perso: !!c.perso, nominatif: !!c.nominatif, texte: !!c.texte })) })) });
});
router.post('/api/exports/apercu', personnel, (req, res) => {
  const p = lire(req);
  if (p.erreur) return res.status(p.code || 400).json({ erreur: p.erreur });
  // l'aperçu nominatif montre déjà noms, e-mails et téléphones : même règle que le fichier (mot de passe confirmé, audit)
  if (p.nominatif && !require('./anomalies').exigerConfirmation(req, res)) return;
  const r = lignes(p);
  if (p.nominatif) audit(req.user, { categorie: 'donnees', action: 'Aperçu nominatif de données', objetId: p.cleJeu, objetLibelle: p.jeu.l.fr, apres: `${Math.min(8, r.lignes.length)} ligne(s) sur ${r.lignes.length}`, motif: `colonnes : ${p.cles.join(', ')}` });
  res.json({ total: r.lignes.length, colonnes: r.colonnes, lignes: r.lignes.slice(0, 8), pseudonymise: !p.nominatif });
});
router.post('/api/exports/fichier', personnel, (req, res) => {
  const p = lire(req);
  if (p.erreur) return res.status(p.code || 400).json({ erreur: p.erreur });
  if (p.nominatif && !require('./anomalies').exigerConfirmation(req, res)) return;
  const r = lignes(p);
  const titre = `Terra Nova · ${p.jeu.l[p.langue] || p.jeu.l.fr}`;
  const f = fichier(p, r, titre);
  const modele = String((req.body || {}).modele || '').slice(0, 80);
  docs.put('exportsHistorique', { id: uid('exp'), date: maintenant(), parId: req.user.id, par: `${req.user.prenom} ${req.user.nom}`, jeu: p.cleJeu, colonnes: p.cles, filtres: p.filtres,
    format: p.format, lignes: r.lignes.length, pseudonymise: !p.nominatif, modele, fichier: f.nom });
  audit(req.user, { categorie: 'donnees', action: p.nominatif ? 'Export nominatif de données' : 'Export de données (pseudonymisé)', objetId: p.cleJeu, objetLibelle: p.jeu.l.fr,
    apres: `${r.lignes.length} ligne(s), ${p.format.toUpperCase()}`, motif: `${modele ? 'Modèle « ' + modele + ' » · ' : ''}colonnes : ${p.cles.join(', ')}` });
  res.locals.exportNominatif = p.nominatif;
  res.set('Content-Type', f.type);
  res.set('Content-Disposition', `attachment; filename="${f.nom}"`);
  res.set('X-Lignes', String(r.lignes.length));
  res.send(Buffer.from(f.corps, 'utf8'));
});

router.get('/api/exports/modeles', personnel, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(docs.tous('exportsModeles').filter((m) => m.partage !== false || m.auteurId === req.user.id)); });
router.post('/api/exports/modeles', personnel, (req, res) => {
  const b = req.body || {};
  const nom = String(b.nom || '').trim().slice(0, 80);
  if (nom.length < 3) return res.status(400).json({ erreur: 'Donnez un nom au modèle (3 caractères minimum).' });
  const p = lire({ body: Object.assign({}, b, { pseudonymiser: true }), user: req.user });
  if (p.erreur) return res.status(400).json({ erreur: p.erreur });
  const m = docs.put('exportsModeles', { id: uid('mod'), nom, jeu: p.cleJeu, colonnes: p.cles, filtres: p.filtres, format: p.format, pseudonymiser: b.pseudonymiser !== false,
    auteurId: req.user.id, auteur: `${req.user.prenom} ${req.user.nom}`, partage: b.partage !== false, cree: maintenant() });
  audit(req.user, { categorie: 'donnees', action: 'Modèle d’export enregistré', objetId: m.id, objetLibelle: nom, apres: `${p.cleJeu} · ${p.cles.length} colonne(s)` });
  res.json(m);
});
router.delete('/api/exports/modeles/:id', personnel, (req, res) => {
  const m = docs.get('exportsModeles', req.params.id);
  if (!m) return res.status(404).json({ erreur: 'Modèle introuvable.' });
  if (m.auteurId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ erreur: 'Seul l’auteur du modèle ou un administrateur peut le supprimer.' });
  docs.suppr('exportsModeles', m.id);
  audit(req.user, { categorie: 'donnees', action: 'Modèle d’export supprimé', objetId: m.id, objetLibelle: m.nom });
  res.json({ ok: true });
});
router.get('/api/exports/historique', personnel, (req, res) => {
  const l = docs.tous('exportsHistorique').reverse();
  res.set('Cache-Control', 'no-store');
  res.json((req.user.role === 'admin' ? l : l.filter((x) => x.parId === req.user.id)).slice(0, 50));
});

module.exports = router;
module.exports.JEUX = JEUX;
