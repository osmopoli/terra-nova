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
const TYPES = ['panne-electrique', 'crise-localisee', 'tempete-solaire'];   // vague 22 (F104) : tempête solaire (toute la ville)
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
  if (c.type === 'tempete-solaire') return `${m.message} Perturbations attendues à partir de ${heure(c.perturbations)}, pendant environ ${Math.round(c.duree / 60 * 10) / 10} h.${c.progression ? ` Point de situation : ${c.progression}` : ''}`.slice(0, 600);   // vague 22
  return `${m.message}${c.retablissement ? ` Rétablissement estimé : ${heure(c.retablissement)}.` : ''}${c.progression ? ` Point de situation : ${c.progression}` : ''}`.slice(0, 600);
}

/* Création (route et semis de démonstration) */
function creer(b0, acteur, opts) {
  let b = b0;
  const o = opts || {};
  const type = TYPES.includes(b.type) ? b.type : 'crise-localisee';
  const tempete = type === 'tempete-solaire';   // vague 22 (F104) : toute la ville, perturbations maintenant ou dans N minutes, durée prévue
  const quartiers = tempete ? QUARTIERS.slice() : (Array.isArray(b.quartiers) ? b.quartiers : [b.quartiers]).filter((q) => QUARTIERS.includes(q)).filter((q, i, l) => l.indexOf(q) === i);
  const dansMin = Math.min(24 * 60, Math.max(0, Math.round(Number(b.dansMinutes) || 0)));
  const duree = Math.min(48 * 60, Math.max(15, Math.round(Number(b.duree) || 120)));
  const perturbations = tempete ? (o.perturbations || new Date(Date.now() + dansMin * 60e3).toISOString()) : '';
  if (tempete && !b.retablissement) b = Object.assign({}, b, { retablissement: new Date(Date.parse(perturbations) + duree * 60e3).toISOString() });
  const titre = texte(b.titre, 120);
  const message = texte(b.message, 1200);
  const actions = liste(b.actions, 6, 160);
  const points = liste(b.points, tempete ? 6 : 4, 200);   // vague 22 : 6 points de rassemblement pour toute la ville
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
  const m = { id, cree: debut, titre, message, actions, audience: tempete ? 'Toute la ville' : quartiers.length === 1 ? quartiers[0] : quartiers.join(', '),
    debut, fin: new Date(Date.parse(debut) + 14 * 864e5).toISOString(), traductions, signataire: 'Haut Conseil de la Ville',
    statut: 'publie', accuses: [], accusesAppareils: 0, creePar: acteur ? acteur.id : null, auteur: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Centre de crise',
    crise: { type, quartiers, retablissement: Number.isFinite(retablissement) ? new Date(retablissement).toISOString() : '', majLe: o.majLe || debut, progression: texte(b.progression, 300),
      points, services: [], annonces: [], statut: 'en-cours', historique: [], demo: !!o.demo,
      ...(tempete ? { perturbations, duree, preparer: liste(b.preparer, 8, 160) } : {}) } };   // vague 22 (F104)
  docs.put(COL, m);
  m.crise.services = perturber(services, m, alternative, acteur);
  // Une annonce par quartier : importance « importante » (pas « alerte ») → seuls les habitants du quartier la voient comme alerte
  m.crise.annonces = tempete ? [docs.put('annonces', { id: `ann-${id.toLowerCase()}-ville`, cree: debut, titre, categorie: 'alerte', importance: 'alerte', zone: 'Toute la ville', active: true,
    resume: resumeAnnonce(m), contenu: message, consignes: actions.concat(points.map((p) => `Point de rassemblement : ${p}`)).slice(0, 10), publics: [], crise: id }).id]   // vague 22 (F104) : une seule annonce pour toute la ville
    : quartiers.map((q) => docs.put('annonces', { id: `ann-${id.toLowerCase()}-${q.toLowerCase()}`, cree: debut, titre, categorie: 'alerte', importance: 'importante', zone: q, active: true,
    resume: resumeAnnonce(m), contenu: message, consignes: actions.concat(points.map((p) => `Point d’accueil : ${p}`)).slice(0, 8), publics: [], crise: id }).id);
  m.crise.historique.push({ date: m.crise.majLe, quoi: 'publication', retablissement: m.crise.retablissement, progression: m.crise.progression, par: m.auteur });
  docs.put(COL, m);
  // Cloche (F49) : chaque habitant du ou des quartiers touchés
  const qui = habitants(quartiers);
  for (const u of qui) notifier(u.id, `⚠ ${titre}`, `${message}${tempete ? ` Perturbations attendues à partir de ${heure(perturbations)}.` : m.crise.retablissement ? ` Rétablissement estimé : ${heure(m.crise.retablissement)}.` : ''} Ce que vous devez faire : ${actions.join(' · ')}`, 'annonces.html#off-epingle-' + id, 'alerte');
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
  const fin = texte((req.body || {}).message, 300) || (m.crise.type === 'panne-electrique' ? 'Le courant est rétabli. Rebranchez vos appareils un par un.'
    : m.crise.type === 'tempete-solaire' ? 'La tempête solaire est passée : les communications fonctionnent normalement. Merci d’avoir suivi les consignes.' : 'La situation est revenue à la normale.');   // vague 22
  const crise = Object.assign({}, m.crise, { statut: 'retablie', retablieLe: t, majLe: t,
    historique: (m.crise.historique || []).concat([{ date: t, quoi: 'retablissement', progression: fin, par: `${req.user.prenom} ${req.user.nom}` }]).slice(-30) });
  const maj = docs.patch(COL, m.id, { statut: 'retire', retireLe: t, retirePar: `${req.user.prenom} ${req.user.nom}`, crise });
  for (const id of crise.annonces || []) if (docs.get('annonces', id)) docs.patch('annonces', id, { active: false });
  retablirServices(maj);
  const titre = m.crise.type === 'panne-electrique' ? `Courant rétabli — ${nomQuartiers(crise.quartiers)}` : m.crise.type === 'tempete-solaire' ? 'Fin de l’alerte — tempête solaire' : `Fin de l’alerte — ${nomQuartiers(crise.quartiers)}`;
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
  const items = (messages || []).filter((m) => m.crise && m.crise.statut === 'en-cours')
    .sort((a, b) => (b.crise.type === 'tempete-solaire') - (a.crise.type === 'tempete-solaire') || String(a.debut).localeCompare(String(b.debut)));   // vague 22 : tempête (toute la ville) d'abord
  if (!items.length) return '';
  const rep = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  return `<section class="crise-simple" aria-labelledby="h-crise"><h2 id="h-crise">⚠ ${e(t.titre)}</h2>${items.map((m) => {
    const c = m.crise, tr = (m.traductions || {})[l], ok = tr && tr.titre && tr.message;
    const titre = ok ? tr.titre : m.titre, message = ok ? tr.message : m.message, actions = ok && tr.actions && tr.actions.length ? tr.actions : m.actions || [];
    const zone = c.quartiers.map((q) => rep(t.quartier, { q })).join(', ');
    const chez = u && u.role === 'citoyen' ? (c.quartiers.includes(u.quartier) ? `<strong>${e(t.votre)}</strong>` : e(rep(t.info, { q: zone }))) : `${e(t.zone)} : <strong>${e(zone)}</strong>`;
    const min = Math.max(0, Math.round((Date.now() - Date.parse(c.majLe)) / 60e3));
    if (c.type === 'tempete-solaire') return tempeteHtml(m, l, { titre, message, actions, min });   // vague 22 (F104)
    return `<article class="crise-simple-fiche"><h3>${e(titre)}</h3><p>${chez}</p>
      <p class="crise-simple-ret"><strong>${e(c.retablissement ? rep(t.ret, { h: heureL(c.retablissement, l) }) : t.retInconnu)}</strong><br><small>${e(rep(min < 1 ? t.majMaint : t.maj, { n: min, h: heureL(c.majLe, l) }))}</small></p>
      <p>${e(message)}</p>${c.progression ? `<p><strong>${e(t.avancement)} :</strong> ${e(c.progression)}</p>` : ''}
      <p><strong>${e(t.faire)} :</strong></p><ol>${actions.map((a) => `<li>${e(a)}</li>`).join('')}</ol>
      ${(c.points || []).length ? `<p><strong>${e(t.points)} :</strong></p><ul>${c.points.map((p) => `<li>${e(p)}</li>`).join('')}</ul>` : ''}</article>`;
  }).join('')}</section>`;
}

/* ---------- Vague 22 (F104) : tempête solaire, version sans script (/essentiel, /simple) ---------- */
const TP = {
  fr: { attendues: 'Perturbations attendues dans {n} min (vers {h})', enCours: 'Perturbations en cours depuis {h}', duree: 'Durée prévue : environ {d}', fin: 'Fin prévue vers {h}', ville: 'Toute la ville est concernée',
    faire: 'Ce que vous devez faire maintenant', preparer: 'Se préparer', rassemblement: 'Points de rassemblement', sansReseau: 'Si vous n’avez plus de réseau', sansReseauTxt: 'Cette page reste lisible sans réseau. Gardez votre calme, écoutez la radio locale, rendez-vous à un point de rassemblement si vous avez besoin d’aide. En cas de danger, allez au poste de secours le plus proche.',
    h: '{n} h', hm: '{h} h {m} min', m: '{m} min' },
  en: { attendues: 'Disruption expected in {n} min (around {h})', enCours: 'Disruption in progress since {h}', duree: 'Expected duration: about {d}', fin: 'Expected end around {h}', ville: 'The whole city is concerned',
    faire: 'What you need to do now', preparer: 'Get ready', rassemblement: 'Gathering points', sansReseau: 'If you lose the network', sansReseauTxt: 'This page stays readable without a network. Stay calm, listen to local radio, go to a gathering point if you need help. In case of danger, go to the nearest first-aid post.',
    h: '{n} h', hm: '{h} h {m} min', m: '{m} min' },
  es: { attendues: 'Perturbaciones previstas dentro de {n} min (hacia las {h})', enCours: 'Perturbaciones en curso desde las {h}', duree: 'Duración prevista: unas {d}', fin: 'Fin prevista hacia las {h}', ville: 'Toda la ciudad está afectada',
    faire: 'Lo que debe hacer ahora', preparer: 'Prepararse', rassemblement: 'Puntos de encuentro', sansReseau: 'Si ya no tiene red', sansReseauTxt: 'Esta página sigue legible sin red. Mantenga la calma, escuche la radio local, acuda a un punto de encuentro si necesita ayuda. En caso de peligro, vaya al puesto de socorro más cercano.',
    h: '{n} h', hm: '{h} h {m} min', m: '{m} min' },
  ar: { attendues: 'اضطرابات متوقعة خلال {n} د (حوالي {h})', enCours: 'اضطرابات جارية منذ {h}', duree: 'المدة المتوقعة: حوالي {d}', fin: 'النهاية المتوقعة حوالي {h}', ville: 'المدينة كلها معنية',
    faire: 'ما يجب عليك فعله الآن', preparer: 'الاستعداد', rassemblement: 'نقاط التجمع', sansReseau: 'إذا انقطعت الشبكة', sansReseauTxt: 'تبقى هذه الصفحة مقروءة دون شبكة. حافظ على هدوئك، استمع إلى الإذاعة المحلية، توجه إلى نقطة تجمع إذا احتجت إلى مساعدة. في حالة الخطر، توجه إلى أقرب مركز إسعاف.',
    h: '{n} س', hm: '{h} س {m} د', m: '{m} د' }
};
// « Se préparer » : liste de contrôle (sans script : simple liste ; avec script : cases à cocher gardées sur l'appareil, officiel.js)
const PREPARER = {
  fr: ['Infos essentielles enregistrées sur cet appareil', 'Numéros d’urgence notés sur papier : 15, 17, 18, 112', 'Téléphone et batterie de secours chargés', 'Radio locale repérée : Radio Dôme 98.4 FM', 'Point de rassemblement le plus proche repéré', 'Proches et voisins isolés prévenus'],
  en: ['Essential information saved on this device', 'Emergency numbers written on paper: 15, 17, 18, 112', 'Phone and power bank charged', 'Local radio found: Radio Dôme 98.4 FM', 'Nearest gathering point located', 'Relatives and isolated neighbours told'],
  es: ['Información esencial guardada en este dispositivo', 'Números de emergencia anotados en papel: 15, 17, 18, 112', 'Teléfono y batería externa cargados', 'Radio local localizada: Radio Dôme 98.4 FM', 'Punto de encuentro más cercano localizado', 'Familiares y vecinos aislados avisados'],
  ar: ['المعلومات الأساسية محفوظة على هذا الجهاز', 'أرقام الطوارئ مكتوبة على ورق: 15، 17، 18، 112', 'الهاتف والبطارية الاحتياطية مشحونان', 'تم تحديد الإذاعة المحلية: راديو القبة 98.4 FM', 'تم تحديد أقرب نقطة تجمع', 'تم إبلاغ الأقارب والجيران المعزولين']
};
function dureeTxt(min, t) { const h = Math.floor(min / 60), m = min % 60; return h && m ? t.hm.replace('{h}', h).replace('{m}', m) : h ? t.h.replace('{n}', h) : t.m.replace('{m}', m); }
function tempeteHtml(m, l, x) {
  const c = m.crise, t = TP[l] || TP.fr, T = TXT[l] || TXT.fr;
  const rep = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const dans = Math.ceil((Date.parse(c.perturbations) - Date.now()) / 60e3);
  const quand = dans > 0 ? rep(t.attendues, { n: dans, h: heureL(c.perturbations, l) }) : rep(t.enCours, { h: heureL(c.perturbations, l) });
  return `<article class="crise-simple-fiche crise-tempete"><h3>${e(x.titre)}</h3><p><strong>${e(t.ville)}</strong></p>
    <p class="crise-simple-ret"><strong>${e(quand)}</strong><br><small>${e(rep(t.duree, { d: dureeTxt(c.duree || 120, t) }))} · ${e(rep(t.fin, { h: heureL(c.retablissement, l) }))}</small><br><small>${e(rep(x.min < 1 ? T.majMaint : T.maj, { n: x.min, h: heureL(c.majLe, l) }))}</small></p>
    <p>${e(x.message)}</p>${c.progression ? `<p><strong>${e(T.avancement)} :</strong> ${e(c.progression)}</p>` : ''}
    <p><strong>${e(t.faire)} :</strong></p><ol>${x.actions.map((a) => `<li>${e(a)}</li>`).join('')}</ol>
    <p><strong>${e(t.preparer)} :</strong></p><ul>${(PREPARER[l] || PREPARER.fr).map((a) => `<li>☐ ${e(a)}</li>`).join('')}</ul>
    ${(c.points || []).length ? `<p><strong>${e(t.rassemblement)} :</strong></p><ul>${c.points.map((p) => `<li>${e(p)}</li>`).join('')}</ul>` : ''}
    <p><strong>${e(t.sansReseau)} :</strong> ${e(t.sansReseauTxt)}</p></article>`;
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
    // une seule fois, même si la crise a été close depuis ; ressemée si le message gardé a disparu (« Réinitialiser la démo » vide les officiels)
    const g = docs.get('essentiel', 'vague21-crise');
    if (g && docs.get(COL, g.crise)) return false;
    const t = Date.now(), quart = 15 * 60e3;
    const ret = Math.ceil((t + 2 * 3600e3) / quart) * quart;   // heure ronde (au quart d'heure) dans environ 2 h
    const r = creer(Object.assign({}, DEMO, { retablissement: new Date(ret).toISOString() }), null,
      { demo: true, debut: new Date(t - 45 * 60e3).toISOString(), majLe: new Date(t - 12 * 60e3).toISOString() });
    docs.put('essentiel', { id: 'vague21-crise', crise: r.m ? r.m.id : '', cree: maintenant() });
    if (r.m) console.log(`[demo] vague 21 : crise « ${r.m.titre} » (${r.m.id}) ajoutée`);
    return !!r.m;
  } catch (err) { console.error('[vague21] semis', err.message); return false; }
}

/* ---------- Vague 22 (F104) : tempête solaire de démonstration (une seule fois), perturbations dans 20 min, environ 4 h ---------- */
const TEMPETE = {
  type: 'tempete-solaire', duree: 240,
  titre: 'Tempête solaire — communications perturbées',
  message: 'Une tempête solaire arrive sur Terra Nova. Le téléphone, Internet et la radio des dômes peuvent être coupés pendant quelques heures. Vous n’êtes pas en danger : préparez-vous dès maintenant.',
  actions: ['Enregistrez les infos essentielles maintenant : elles restent lisibles sans réseau', 'Notez sur papier les numéros d’urgence : 15, 17, 18, 112', 'Chargez votre téléphone et votre batterie de secours',
    'N’appelez qu’en cas d’urgence : ne multipliez pas les appels', 'Suivez les consignes de la radio locale (Radio Dôme 98.4 FM)', 'Plus de réseau ? Restez calme, allez au point de rassemblement le plus proche si vous avez besoin d’aide'],
  points: ['Centre — Dôme des Pionniers, salle polyvalente (ouvert 24 h/24)', 'Nord — Maison de quartier, arrêt Orion', 'Sud — Gymnase des Comètes', 'Est — Médiathèque de l’Est', 'Ouest — Halle des Serres'],
  traductions: {
    en: { titre: 'Solar storm — communications disrupted', message: 'A solar storm is reaching Terra Nova. Phone, Internet and dome radio may be cut for a few hours. You are not in danger: get ready now.',
      actions: ['Save the essential information now: it stays readable without a network', 'Write the emergency numbers on paper: 15, 17, 18, 112', 'Charge your phone and power bank', 'Only call in an emergency: do not make repeated calls', 'Follow local radio instructions (Radio Dôme 98.4 FM)', 'No network? Stay calm, go to the nearest gathering point if you need help'] },
    es: { titre: 'Tormenta solar — comunicaciones perturbadas', message: 'Una tormenta solar llega a Terra Nova. El teléfono, Internet y la radio de los domos pueden cortarse durante unas horas. No está en peligro: prepárese ahora.',
      actions: ['Guarde ahora la información esencial: sigue legible sin red', 'Anote en papel los números de emergencia: 15, 17, 18, 112', 'Cargue su teléfono y su batería externa', 'Llame solo en caso de urgencia: no repita las llamadas', 'Siga las consignas de la radio local (Radio Dôme 98.4 FM)', '¿Sin red? Mantenga la calma, vaya al punto de encuentro más cercano si necesita ayuda'] },
    ar: { titre: 'عاصفة شمسية — اضطراب الاتصالات', message: 'عاصفة شمسية تقترب من تيرا نوفا. قد ينقطع الهاتف والإنترنت وإذاعة القباب لبضع ساعات. أنت لست في خطر: استعد من الآن.',
      actions: ['احفظ المعلومات الأساسية الآن: تبقى مقروءة دون شبكة', 'اكتب أرقام الطوارئ على ورق: 15، 17، 18، 112', 'اشحن هاتفك وبطاريتك الاحتياطية', 'لا تتصل إلا عند الطوارئ: لا تكرر المكالمات', 'اتبع تعليمات الإذاعة المحلية (راديو القبة 98.4 FM)', 'لا توجد شبكة؟ حافظ على هدوئك وتوجه إلى أقرب نقطة تجمع إذا احتجت إلى مساعدة'] }
  }
};
function semerTempete() {
  try {
    if (docs.get('essentiel', 'vague22-tempete')) return false;   // une seule fois, même si l'alerte a été close depuis
    const t = Date.now();
    const r = creer(Object.assign({}, TEMPETE), null, { demo: true, debut: new Date(t - 3 * 60e3).toISOString(), majLe: new Date(t - 3 * 60e3).toISOString(), perturbations: new Date(t + 20 * 60e3).toISOString() });
    docs.put('essentiel', { id: 'vague22-tempete', crise: r.m ? r.m.id : '', cree: maintenant() });
    if (r.m) console.log(`[demo] vague 22 : alerte « ${r.m.titre} » (${r.m.id}) ajoutée`);
    return !!r.m;
  } catch (err) { console.error('[vague22] semis tempête', err.message); return false; }
}

module.exports = { router, semer, semerTempete, blocHtml, enCours, TEMPETE };
