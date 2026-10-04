// Terra Nova — vague 21 (F101) : « crise localisée » (Centre de crise), construite sur le message officiel du Haut Conseil (F73).
// Un agent / admin publie en une fois (modèle « Panne électrique » ou « Crise localisée ») :
//   - le message officiel (collection `officiels`, public = le ou les quartiers touchés, début immédiat) avec `crise` :
//     rétablissement estimé, dernière mise à jour, avancement, points d'accueil et de recharge, services touchés ;
//   - une annonce par quartier (D06/D18, importance « importante », zone = quartier) → annonces, tiroir « Alertes », /essentiel ;
//   - une notification (cloche F49) à chaque habitant du quartier ;
//   - les services touchés passent « Perturbé » (F63/F64) avec la raison, le retour prévu et une alternative (état précédent gardé).
// « Mettre à jour » change l'heure estimée / l'avancement (annonce et services suivent, habitants notifiés) ;
// « Rétablissement » retire le message, désactive les annonces, rend aux services leur état précédent et notifie « Courant rétabli ».
// Le serveur décide qui voit quoi (src/modules/officiel.js) : habitant du quartier → critique, autres habitants → information.
const router = require('express').Router();
const { docs, audit, notifier, maintenant } = require('../donnees');
const A = require('../auth');

const COL = 'officiels';
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const TYPES = ['panne-electrique', 'crise-localisee'];
const LANGUES = ['en', 'es', 'ar'];
const TZ = process.env.TZ_VILLE || 'Indian/Mayotte';
const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const liste = (v, n, max) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).filter((x) => typeof x === 'string').map((x) => texte(x, max)).filter(Boolean).slice(0, n);
const heure = (iso) => { try { return new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).replace(':', ' h '); } catch { return ''; } };
const nomQuartiers = (l) => (l.length === 1 ? `secteur ${l[0]}` : `secteurs ${l.join(', ')}`);

const crises = () => docs.tous(COL).filter((m) => m.crise);
const enCours = () => crises().filter((m) => m.crise.statut === 'en-cours' && m.statut !== 'retire');
const habitants = (quartiers) => docs.tous('utilisateurs').filter((u) => u.role === 'citoyen' && quartiers.includes(u.quartier) && u.actif !== false);

/* Services : « Perturbé » pendant la crise, état d'avant gardé pour le rétablissement (un service désactivé par l'admin n'est pas touché) */
function perturber(ids, m, alternative, acteur) {
  const touches = [];
  for (const id of ids) {
    const s = docs.get('services', id);
    if (!s || (s.etat && s.etat.code === 'desactive')) continue;
    const avant = s.etat || { code: 'ok' };
    const etat = { code: 'perturbe', message: m.crise.quartiers.every((q) => m.titre.includes(q)) ? m.titre : `${m.titre} (${nomQuartiers(m.crise.quartiers)})`,
      retour: m.crise.retablissement ? `Rétablissement estimé à ${heure(m.crise.retablissement)}` : 'Rétablissement en cours d’estimation',
      alternative: { type: 'autre', texte: alternative, valeur: '' }, depuis: maintenant(), par: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Centre de crise',
      crise: m.id, precedent: avant.crise ? (avant.precedent || { code: 'ok' }) : avant };
    docs.patch('services', s.id, { etat });
    touches.push(s.id);
  }
  return touches;
}
function suivreServices(m) {   // nouvelle heure estimée → « Retour prévu » des services touchés
  for (const id of m.crise.services || []) {
    const s = docs.get('services', id);
    if (s && s.etat && s.etat.crise === m.id) docs.patch('services', id, { etat: Object.assign({}, s.etat, { retour: m.crise.retablissement ? `Rétablissement estimé à ${heure(m.crise.retablissement)}` : s.etat.retour }) });
  }
}
function retablirServices(m) {
  for (const id of m.crise.services || []) {
    const s = docs.get('services', id);
    if (s && s.etat && s.etat.crise === m.id) docs.patch('services', id, { etat: s.etat.precedent && s.etat.precedent.code !== 'perturbe' ? s.etat.precedent : { code: 'ok', message: '', retour: '' } });
  }
}

function resumeAnnonce(m) {
  const c = m.crise;
  return `${m.message}${c.retablissement ? ` Rétablissement estimé : ${heure(c.retablissement)}.` : ''}${c.progression ? ` Point de situation : ${c.progression}` : ''}`.slice(0, 600);
}

/* Création (route et semis de démonstration) */
function creer(b, acteur, opts) {
  const o = opts || {};
  const type = TYPES.includes(b.type) ? b.type : 'crise-localisee';
  const quartiers = (Array.isArray(b.quartiers) ? b.quartiers : [b.quartiers]).filter((q) => QUARTIERS.includes(q)).filter((q, i, l) => l.indexOf(q) === i);
  const titre = texte(b.titre, 120);
  const message = texte(b.message, 1200);
  const actions = liste(b.actions, 6, 160);
  const points = liste(b.points, 4, 200);
  const services = liste(b.services, 6, 60).filter((id) => docs.get('services', id));
  const alternative = texte(b.alternative, 300) || 'Rendez-vous au point d’accueil indiqué ou appelez la mairie.';
  const retablissement = b.retablissement ? Date.parse(b.retablissement) : NaN;
  if (!quartiers.length) return { code: 400, msg: 'Choisissez au moins un quartier touché.' };
  if (titre.length < 5) return { code: 400, msg: 'Donnez un titre clair (5 caractères minimum).' };
  if (message.length < 10) return { code: 400, msg: 'Écrivez ce qui se passe en quelques phrases simples (10 caractères minimum).' };
  if (!actions.length) return { code: 400, msg: 'Indiquez au moins une chose à faire pour les habitants.' };
  if (b.retablissement && (!Number.isFinite(retablissement) || retablissement <= Date.now() - 60e3 && !o.demo)) return { code: 400, msg: 'L’heure de rétablissement estimée doit être dans le futur.' };
  const traductions = {};
  for (const l of LANGUES) {
    const tr = (b.traductions || {})[l] || {};
    const tt = texte(tr.titre, 120), tm = texte(tr.message, 1200), ta = liste(tr.actions, 6, 160);
    if (tt && tm) traductions[l] = { titre: tt, message: tm, actions: ta };
  }
  const debut = o.debut || maintenant();
  const n = docs.prochainNumero(COL, 0);
  const id = `OFF-${String(n).padStart(4, '0')}`;
  const m = { id, cree: debut, titre, message, actions, audience: quartiers.length === 1 ? quartiers[0] : quartiers.join(', '),
    debut, fin: new Date(Date.parse(debut) + 14 * 864e5).toISOString(), traductions, signataire: 'Haut Conseil de la Ville',
    statut: 'publie', accuses: [], accusesAppareils: 0, creePar: acteur ? acteur.id : null, auteur: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Centre de crise',
    crise: { type, quartiers, retablissement: Number.isFinite(retablissement) ? new Date(retablissement).toISOString() : '', majLe: o.majLe || debut, progression: texte(b.progression, 300),
      points, services: [], annonces: [], statut: 'en-cours', historique: [], demo: !!o.demo } };
  docs.put(COL, m);
  m.crise.services = perturber(services, m, alternative, acteur);
  // Une annonce par quartier : importance « importante » (pas « alerte ») → seuls les habitants du quartier la voient comme alerte
  m.crise.annonces = quartiers.map((q) => docs.put('annonces', { id: `ann-${id.toLowerCase()}-${q.toLowerCase()}`, cree: debut, titre, categorie: 'alerte', importance: 'importante', zone: q, active: true,
    resume: resumeAnnonce(m), contenu: message, consignes: actions.concat(points.map((p) => `Point d’accueil : ${p}`)).slice(0, 8), publics: [], crise: id }).id);
  m.crise.historique.push({ date: m.crise.majLe, quoi: 'publication', retablissement: m.crise.retablissement, progression: m.crise.progression, par: m.auteur });
  docs.put(COL, m);
  // Cloche (F49) : chaque habitant du ou des quartiers touchés
  const qui = habitants(quartiers);
  for (const u of qui) notifier(u.id, `⚠ ${titre}`, `${message}${m.crise.retablissement ? ` Rétablissement estimé : ${heure(m.crise.retablissement)}.` : ''} Ce que vous devez faire : ${actions.join(' · ')}`, 'annonces.html#off-epingle-' + id, 'alerte');
  audit(acteur, { categorie: 'annonce', action: 'Publication d’une crise localisée', objetId: id, objetLibelle: titre,
    apres: `${nomQuartiers(quartiers)} · rétablissement estimé ${m.crise.retablissement ? heure(m.crise.retablissement) : 'non communiqué'}`,
    motif: `${qui.length} habitant(s) notifié(s) · services perturbés : ${m.crise.services.join(', ') || 'aucun'} · annonces : ${m.crise.annonces.join(', ')}` });
  return { m };
}

router.get('/api/crises', A.exigerRole('agent', 'admin'), (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(crises().sort((a, b) => b.cree.localeCompare(a.cree)).slice(0, 20).map((m) => ({ id: m.id, titre: m.titre, message: m.message, actions: m.actions, audience: m.audience,
    debut: m.debut, statut: m.statut, crise: m.crise, nbCompris: (m.accuses || []).length + (m.accusesAppareils || 0), nbHabitants: habitants(m.crise.quartiers).length })));
});

router.post('/api/crises', A.exigerRole('agent', 'admin'), (req, res) => {
  const r = creer(req.body || {}, req.user);
  if (!r.m) return erreur(res, r.code, r.msg);
  res.json(r.m);
});

function crisePour(req, res) {
  const m = docs.get(COL, req.params.id);
  if (!m || !m.crise) { erreur(res, 404, 'Crise introuvable.'); return null; }
  if (m.crise.statut !== 'en-cours' || m.statut === 'retire') { erreur(res, 409, 'Cette crise est déjà terminée.'); return null; }
  return m;
}

// « Mettre à jour » : nouvelle heure estimée et / ou point d'avancement (les pages ouvertes le voient au prochain « pouls »)
router.post('/api/crises/:id/maj', A.exigerRole('agent', 'admin'), (req, res) => {
  const m = crisePour(req, res); if (!m) return;
  const b = req.body || {};
  const progression = texte(b.progression, 300);
  const ret = b.retablissement ? Date.parse(b.retablissement) : NaN;
  if (b.retablissement && (!Number.isFinite(ret) || ret <= Date.now() - 60e3)) return erreur(res, 400, 'L’heure de rétablissement estimée doit être dans le futur.');
  if (!progression && !Number.isFinite(ret)) return erreur(res, 400, 'Indiquez une nouvelle heure estimée ou un point d’avancement.');
  const avant = m.crise.retablissement;
  const crise = Object.assign({}, m.crise, { majLe: maintenant(), progression: progression || m.crise.progression,
    retablissement: Number.isFinite(ret) ? new Date(ret).toISOString() : m.crise.retablissement });
  crise.historique = (m.crise.historique || []).concat([{ date: crise.majLe, quoi: 'mise-a-jour', retablissement: crise.retablissement, progression, par: `${req.user.prenom} ${req.user.nom}` }]).slice(-30);
  const maj = docs.patch(COL, m.id, { crise });
  for (const id of crise.annonces || []) if (docs.get('annonces', id)) docs.patch('annonces', id, { resume: resumeAnnonce(maj) });
  suivreServices(maj);
  const qui = habitants(crise.quartiers);
  const quoi = [crise.retablissement !== avant && crise.retablissement ? `Rétablissement estimé : ${heure(crise.retablissement)}.` : '', progression].filter(Boolean).join(' ');
  for (const u of qui) notifier(u.id, `Mise à jour : ${m.titre}`, quoi, 'annonces.html#off-epingle-' + m.id, 'alerte');
  audit(req.user, { categorie: 'annonce', action: 'Mise à jour d’une crise localisée', objetId: m.id, objetLibelle: m.titre,
    avant: avant ? heure(avant) : 'non communiqué', apres: crise.retablissement ? heure(crise.retablissement) : 'non communiqué', motif: progression || `${qui.length} habitant(s) notifié(s)` });
  res.json(maj);
});

// « Rétablissement » : tout se ferme, les services retrouvent leur état, les habitants reçoivent « Courant rétabli »
router.post('/api/crises/:id/retablir', A.exigerRole('agent', 'admin'), (req, res) => {
  const m = crisePour(req, res); if (!m) return;
  const t = maintenant();
  const fin = texte((req.body || {}).message, 300) || (m.crise.type === 'panne-electrique' ? 'Le courant est rétabli. Rebranchez vos appareils un par un.' : 'La situation est revenue à la normale.');
  const crise = Object.assign({}, m.crise, { statut: 'retablie', retablieLe: t, majLe: t,
    historique: (m.crise.historique || []).concat([{ date: t, quoi: 'retablissement', progression: fin, par: `${req.user.prenom} ${req.user.nom}` }]).slice(-30) });
  const maj = docs.patch(COL, m.id, { statut: 'retire', retireLe: t, retirePar: `${req.user.prenom} ${req.user.nom}`, crise });
  for (const id of crise.annonces || []) if (docs.get('annonces', id)) docs.patch('annonces', id, { active: false });
  retablirServices(maj);
  const titre = m.crise.type === 'panne-electrique' ? `Courant rétabli — ${nomQuartiers(crise.quartiers)}` : `Fin de l’alerte — ${nomQuartiers(crise.quartiers)}`;
  const qui = habitants(crise.quartiers);
  for (const u of qui) notifier(u.id, titre, fin, 'essentiel', 'info');
  audit(req.user, { categorie: 'annonce', action: 'Rétablissement : fin d’une crise localisée', objetId: m.id, objetLibelle: m.titre, avant: 'en-cours', apres: 'retablie',
    motif: `${fin} · ${qui.length} habitant(s) notifié(s) · services rétablis : ${(crise.services || []).join(', ') || 'aucun'}` });
  res.json(maj);
});

/* ---------- Pages sans script (/essentiel, /simple) : bloc « Crise en cours » en tête ---------- */
const TXT = {
  fr: { titre: 'Crise en cours', votre: 'Votre quartier est concerné', info: 'Pour information : {q}', zone: 'Zone', ret: 'Rétablissement estimé : {h}', retInconnu: 'Rétablissement : en cours d’estimation',
    maj: 'Dernière mise à jour il y a {n} min ({h})', majMaint: 'Dernière mise à jour à l’instant ({h})', faire: 'Ce que vous devez faire', points: 'Points d’accueil et de recharge', avancement: 'Point de situation', quartier: 'Quartier {q}' },
  en: { titre: 'Ongoing crisis', votre: 'Your district is affected', info: 'For information: {q}', zone: 'Area', ret: 'Estimated restoration: {h}', retInconnu: 'Restoration: being estimated',
    maj: 'Last update {n} min ago ({h})', majMaint: 'Last update just now ({h})', faire: 'What you need to do', points: 'Reception and charging points', avancement: 'Situation update', quartier: '{q} district' },
  es: { titre: 'Crisis en curso', votre: 'Su barrio está afectado', info: 'Para información: {q}', zone: 'Zona', ret: 'Restablecimiento estimado: {h}', retInconnu: 'Restablecimiento: en estimación',
    maj: 'Última actualización hace {n} min ({h})', majMaint: 'Última actualización ahora mismo ({h})', faire: 'Lo que debe hacer', points: 'Puntos de acogida y de carga', avancement: 'Situación', quartier: 'Barrio {q}' },
  ar: { titre: 'أزمة جارية', votre: 'حيّك معني', info: 'للعلم: {q}', zone: 'المنطقة', ret: 'الإصلاح المتوقع: {h}', retInconnu: 'الإصلاح: قيد التقدير',
    maj: 'آخر تحديث منذ {n} د ({h})', majMaint: 'آخر تحديث الآن ({h})', faire: 'ما يجب عليك فعله', points: 'نقاط الاستقبال والشحن', avancement: 'آخر المستجدات', quartier: 'حي {q}' }
};
const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LOC = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' };
const heureL = (iso, l) => { try { const h = new Date(iso).toLocaleTimeString(LOC[l] || 'fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); return l === 'fr' ? h.replace(':', ' h ') : h; } catch { return ''; } };
// `liste` : messages officiels (paquet essentiel ou actifsPour) ; seuls ceux qui portent une crise en cours sont rendus. `u` : profil (facultatif).
function blocHtml(messages, l, u) {
  const t = TXT[l] || TXT.fr;
  const items = (messages || []).filter((m) => m.crise && m.crise.statut === 'en-cours');
  if (!items.length) return '';
  const rep = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  return `<section class="crise-simple" aria-labelledby="h-crise"><h2 id="h-crise">⚠ ${e(t.titre)}</h2>${items.map((m) => {
    const c = m.crise, tr = (m.traductions || {})[l], ok = tr && tr.titre && tr.message;
    const titre = ok ? tr.titre : m.titre, message = ok ? tr.message : m.message, actions = ok && tr.actions && tr.actions.length ? tr.actions : m.actions || [];
    const zone = c.quartiers.map((q) => rep(t.quartier, { q })).join(', ');
    const chez = u && u.role === 'citoyen' ? (c.quartiers.includes(u.quartier) ? `<strong>${e(t.votre)}</strong>` : e(rep(t.info, { q: zone }))) : `${e(t.zone)} : <strong>${e(zone)}</strong>`;
    const min = Math.max(0, Math.round((Date.now() - Date.parse(c.majLe)) / 60e3));
    return `<article class="crise-simple-fiche"><h3>${e(titre)}</h3><p>${chez}</p>
      <p class="crise-simple-ret"><strong>${e(c.retablissement ? rep(t.ret, { h: heureL(c.retablissement, l) }) : t.retInconnu)}</strong><br><small>${e(rep(min < 1 ? t.majMaint : t.maj, { n: min, h: heureL(c.majLe, l) }))}</small></p>
      <p>${e(message)}</p>${c.progression ? `<p><strong>${e(t.avancement)} :</strong> ${e(c.progression)}</p>` : ''}
      <p><strong>${e(t.faire)} :</strong></p><ol>${actions.map((a) => `<li>${e(a)}</li>`).join('')}</ol>
      ${(c.points || []).length ? `<p><strong>${e(t.points)} :</strong></p><ul>${c.points.map((p) => `<li>${e(p)}</li>`).join('')}</ul>` : ''}</article>`;
  }).join('')}</section>`;
}

/* ---------- Semis de démonstration : une panne électrique en cours dans le secteur Nord (une seule fois, base neuve ou en service) ---------- */
const DEMO = {
  type: 'panne-electrique', quartiers: ['Nord'],
  titre: 'Panne électrique — secteur Nord',
  message: 'Une panne électrique touche le secteur Nord. Les équipes de la centrale du dôme Nord réparent le réseau. Les ascenseurs et l’éclairage public du secteur sont arrêtés.',
  actions: ['Débranchez les appareils sensibles (ordinateur, télévision)', 'Gardez le réfrigérateur et le congélateur fermés', 'Personnes sous assistance respiratoire : appelez le 15', 'Utilisez une lampe de poche, pas de bougie', 'Rechargez votre téléphone au point d’accueil le plus proche'],
  points: ['Dôme des Pionniers — salle polyvalente, recharge et eau, ouvert 24 h/24', 'Maison de quartier Nord — arrêt Orion, accueil jusqu’à 22 h'],
  services: ['eau-energie', 'voirie'],
  alternative: 'Signalez une urgence électrique à l’astreinte technique du dôme ; accueil et recharge au Dôme des Pionniers.',
  progression: 'Le poste de distribution principal est remis en état ; remise sous tension rue par rue.',
  traductions: {
    en: { titre: 'Power cut — North sector', message: 'A power cut is affecting the North sector. The North dome power plant teams are repairing the network. Lifts and street lighting in the sector are down.',
      actions: ['Unplug sensitive devices (computer, TV)', 'Keep the fridge and freezer closed', 'People on breathing support: call 15', 'Use a torch, not a candle', 'Charge your phone at the nearest reception point'] },
    es: { titre: 'Corte eléctrico — sector Norte', message: 'Un corte eléctrico afecta al sector Norte. Los equipos de la central del domo Norte reparan la red. Los ascensores y el alumbrado público del sector están parados.',
      actions: ['Desenchufe los aparatos sensibles (ordenador, televisión)', 'Mantenga cerrados el frigorífico y el congelador', 'Personas con asistencia respiratoria: llamen al 15', 'Use una linterna, no velas', 'Cargue su teléfono en el punto de acogida más cercano'] },
    ar: { titre: 'انقطاع الكهرباء — القطاع الشمالي', message: 'انقطاع في الكهرباء يمس القطاع الشمالي. فرق محطة القبة الشمالية تصلح الشبكة. المصاعد والإنارة العامة في القطاع متوقفة.',
      actions: ['افصل الأجهزة الحساسة (الحاسوب، التلفاز)', 'أبقِ الثلاجة والمجمد مغلقين', 'الأشخاص تحت التنفس الاصطناعي: اتصلوا بالرقم 15', 'استعمل مصباحاً يدوياً لا شمعة', 'اشحن هاتفك في أقرب نقطة استقبال'] }
  }
};
function semer() {
  try {
    if (docs.get('essentiel', 'vague21-crise')) return false;   // une seule fois, même si la crise a été close depuis
    const t = Date.now(), quart = 15 * 60e3;
    const ret = Math.ceil((t + 2 * 3600e3) / quart) * quart;   // heure ronde (au quart d'heure) dans environ 2 h
    const r = creer(Object.assign({}, DEMO, { retablissement: new Date(ret).toISOString() }), null,
      { demo: true, debut: new Date(t - 45 * 60e3).toISOString(), majLe: new Date(t - 12 * 60e3).toISOString() });
    docs.put('essentiel', { id: 'vague21-crise', crise: r.m ? r.m.id : '', cree: maintenant() });
    if (r.m) console.log(`[demo] vague 21 : crise « ${r.m.titre} » (${r.m.id}) ajoutée`);
    return !!r.m;
  } catch (err) { console.error('[vague21] semis', err.message); return false; }
}

module.exports = { router, semer, blocHtml, enCours };
