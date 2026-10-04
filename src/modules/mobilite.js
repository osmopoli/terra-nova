/* Terra Nova — vague 20 (F97, Service Mobilité) : lignes interrompues et solutions de remplacement.
   - Lecture publique (GET /api/mobilite) : état de chaque ligne, interruptions en cours ou annoncées, et pour chaque ligne
     interrompue les meilleures solutions calculées depuis les données du réseau (src/vague20/reseau.js), classées par temps
     perdu : navette de remplacement / bus-relais, autres lignes, marche, vélos et trottinettes, transport à la demande PMR.
   - Itinéraire de remplacement (GET /api/mobilite/itineraire?de=&vers=) : arrêt ou quartier → trajet qui évite les lignes
     interrompues, avec correspondances et durée estimée, comparé au trajet habituel.
   - Habitants : « Me prévenir » pour une ligne (POST /api/mobilite/abonnements) → cloche + tiroir quand elle est
     interrompue puis rétablie (vérification chaque minute, y compris pour une interruption programmée).
   - Agents / admins seulement (contrôlé ici) : déclarer, modifier, lever une interruption (lignes, tronçons, période, motif,
     remplacement). Chaque action est journalisée (journal d'audit F47, catégorie « transport »). */
const router = require('express').Router();
const { docs, audit, notifier, maintenant } = require('../donnees');
const A = require('../auth');
const R = require('../vague20/reseau');

const COL = 'interruptions';
const TZ = process.env.TZ_VILLE || 'Indian/Mayotte';
const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max);
const MOTIFS = ['travaux', 'panne', 'meteo', 'evenement', 'securite', 'autre'];
const REMPLACEMENTS = ['navette', 'bus-relais', 'aucun'];
const nomArret = (a) => (R.ARRETS[a] ? R.ARRETS[a][0] : a);

/* ---------- Heures de la ville (fuseau TZ_VILLE) ---------- */
const partsVille = (d) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
  .formatToParts(d).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
const jourVille = (d) => { const p = partsVille(d); return `${p.year}-${p.month}-${p.day}`; };
function decalageVille(d) { const p = partsVille(d); return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(d.getTime() / 60000) * 60000; }
// Instant correspondant à « HH:MM » heure de la ville, dans n jours
function aHeureVille(jours, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const j = jourVille(new Date(Date.now() + jours * 864e5)).split('-').map(Number);
  const naif = Date.UTC(j[0], j[1] - 1, j[2], h, m);
  return new Date(naif - decalageVille(new Date(naif))).toISOString();
}
// « jusqu'à 18 h » : heure de la ville et jour relatif (aujourd'hui, demain, date)
function quand(iso) {
  if (!iso) return null;
  const d = new Date(iso), p = partsVille(d);
  const auj = jourVille(new Date()), dem = jourVille(new Date(Date.now() + 864e5));
  const jour = jourVille(d);
  return { iso, heure: `${p.hour % 24 < 10 ? '0' : ''}${+p.hour % 24}:${p.minute}`, jour: jour === auj ? 'auj' : jour === dem ? 'demain' : 'date', date: jour };
}
const quandFr = (iso) => { const q = quand(iso); if (!q) return 'nouvel ordre'; const h = q.heure.replace(/^0/, '').replace(':00', ' h').replace(':', ' h '); return q.jour === 'auj' ? h : q.jour === 'demain' ? `demain ${h}` : `${new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })} ${h}`; };

/* ---------- État des interruptions ---------- */
function statut(i, t) {
  const n = t || Date.now();
  if (i.leveeLe) return 'terminee';
  if (Date.parse(i.debut) > n) return 'programmee';
  if (i.fin && Date.parse(i.fin) <= n) return 'terminee';
  return 'en_cours';
}
const enCours = () => docs.tous(COL).filter((i) => statut(i) === 'en_cours');
const coupuresEnCours = () => enCours().flatMap((i) => i.troncons || []);
const relaisEnCours = () => enCours().flatMap((i) => R.relaisDe(i));
const titreFr = (i, t) => {
  const tous = R.arretsDuTroncon(t).length === R.LIGNES[t.ligne].arrets.length;
  const b = R.bornes(t), L = R.LIGNES[t.ligne];
  return `Ligne ${t.ligne} interrompue${tous ? '' : ` entre ${nomArret(L.arrets[b[0]][0])} et ${nomArret(L.arrets[b[1]][0])}`} jusqu’à ${quandFr(i.fin)}`;
};

// Vue publique d'une interruption : jamais le nom de l'agent, solutions calculées
function vue(i, coupures, avecSolutions) {
  const s = statut(i);
  const o = { id: i.id, statut: s, troncons: (i.troncons || []).map((t) => ({ ligne: t.ligne, de: t.de, a: t.a, arrets: R.arretsDuTroncon(t), touteLaLigne: R.arretsDuTroncon(t).length === R.LIGNES[t.ligne].arrets.length })),
    debut: quand(i.debut), fin: quand(i.fin), motif: i.motif, precision: i.precision || '', remplacement: i.remplacement || { type: 'aucun' }, tad: i.tad !== false, maj: i.maj || i.cree };
  if (avecSolutions) o.solutions = R.solutions(i, s === 'en_cours' ? coupures : coupures.concat(i.troncons || []), []);
  return o;
}
function etatPublic(u) {
  const t = Date.now();
  const toutes = docs.tous(COL);
  const coupures = coupuresEnCours();
  const visibles = toutes.filter((i) => { const s = statut(i, t); return s === 'en_cours' || (s === 'programmee' && Date.parse(i.debut) - t < 3 * 864e5); })
    .sort((a, b) => String(a.debut).localeCompare(String(b.debut)));
  const lignes = Object.entries(R.LIGNES).map(([id, L]) => {
    const mes = visibles.filter((i) => statut(i, t) === 'en_cours' && (i.troncons || []).some((x) => x.ligne === id));
    const toute = mes.some((i) => i.troncons.some((x) => x.ligne === id && R.arretsDuTroncon(x).length === L.arrets.length));
    return { id, nom: L.nom, freq: L.freq, arrets: L.arrets.map((x) => x[0]), etat: !mes.length ? 'normal' : toute ? 'interrompue' : 'partielle', interruptions: mes.map((i) => i.id),
      nonDesservis: L.arrets.map((x) => x[0]).filter((a) => R.arretNonDesservi(id, a, coupures)) };
  });
  const abo = u ? docs.get('mobiliteAbonnements', u.id) : null;
  return { maintenant: maintenant(), lignes, arrets: Object.fromEntries(Object.entries(R.ARRETS).map(([k, v]) => [k, { nom: v[0], quartier: v[1] }])),
    stations: R.STATIONS, tad: R.TAD, interruptions: visibles.map((i) => vue(i, coupures, true)), abonnements: abo ? abo.lignes || [] : [], connecte: !!u };
}
// Résumé léger pour le tiroir « Alertes » de toutes les pages (assets/js/vague20.js)
function resume(u) {
  const coupures = coupuresEnCours();
  const abo = u ? (docs.get('mobiliteAbonnements', u.id) || {}).lignes || [] : [];
  return { interruptions: enCours().map((i) => { const v = vue(i, coupures, false); const sol = R.solutions(i, coupures, []);
    v.meilleure = sol.map((s) => ({ ligne: s.ligne, option: s.options[0] ? { type: s.options[0].type, perte: s.options[0].perte, sousType: s.options[0].sousType || '', lignes: s.options[0].lignes || [] } : null }));
    return v; }), abonnements: abo };
}

/* ---------- Lecture publique ---------- */
router.get('/api/mobilite', (req, res) => { res.set('Cache-Control', 'no-store'); res.json(etatPublic(req.user)); });
router.get('/api/mobilite/itineraire', (req, res) => {
  const de = texte(req.query.de, 20), vers = texte(req.query.vers, 20);
  const coupures = coupuresEnCours(), relais = relaisEnCours();
  const rapide = R.itineraire(de, vers, coupures, relais, {});
  if (rapide.erreur) return erreur(res, 400, rapide.erreur === 'Départ et arrivée identiques.' ? 'Choisissez un départ et une arrivée différents.' : 'Choisissez un arrêt ou un quartier dans la liste.');
  const moins = R.itineraire(de, vers, coupures, relais, { marcheMax: 8, penaliteMarche: 3 });
  const habituel = R.itineraire(de, vers, [], [], { marcheMax: 8, penaliteMarche: 3 });
  const lignesTouchees = [...new Set((habituel.etapes || []).filter((e) => e.type === 'ligne').map((e) => e.ligne).filter((l) => coupures.some((c) => c.ligne === l)))];
  res.set('Cache-Control', 'no-store');
  res.json({ de, vers, rapide, moinsDeMarche: moins.etapes && JSON.stringify(moins.etapes) !== JSON.stringify(rapide.etapes) ? moins : null, habituel, lignesTouchees,
    interruptionsEnCours: enCours().length });
});

/* ---------- Abonnements : être prévenu pour une ligne ---------- */
router.post('/api/mobilite/abonnements', A.exigerRole(...A.ROLES), (req, res) => {
  const ligne = texte((req.body || {}).ligne, 4);
  if (!R.LIGNES[ligne]) return erreur(res, 400, 'Ligne inconnue.');
  const actif = (req.body || {}).actif !== false;
  const a = docs.get('mobiliteAbonnements', req.user.id) || { id: req.user.id, lignes: [] };
  const lignes = new Set(a.lignes || []);
  if (actif) lignes.add(ligne); else lignes.delete(ligne);
  docs.put('mobiliteAbonnements', Object.assign(a, { lignes: [...lignes].sort(), maj: maintenant() }));
  // déjà interrompue au moment de l'abonnement : prévenir tout de suite
  if (actif) for (const i of enCours().filter((x) => (x.troncons || []).some((t) => t.ligne === ligne))) {
    const t = i.troncons.find((x) => x.ligne === ligne);
    notifier(req.user.id, titreFr(i, t), `${i.precision || libelleMotif(i.motif)}. Solutions de remplacement et itinéraire sur la page Transports.`, `transports.html#int-${i.id}`, 'importante');
  }
  res.json({ ok: true, lignes: [...lignes].sort() });
});

/* ---------- Prévenir les abonnés (début, fin, levée) ---------- */
const LIB_MOTIF = { travaux: 'Travaux sur la voie', panne: 'Navette en panne', meteo: 'Conditions météo', evenement: 'Événement dans la ville', securite: 'Raison de sécurité', autre: 'Interruption de service' };
const libelleMotif = (m) => LIB_MOTIF[m] || LIB_MOTIF.autre;
function abonnesDe(lignes) { return docs.tous('mobiliteAbonnements').filter((a) => (a.lignes || []).some((l) => lignes.includes(l))).map((a) => a.id).filter((id) => docs.get('utilisateurs', id)); }
function prevenir(i, moment) {
  const lignes = [...new Set((i.troncons || []).map((t) => t.ligne))];
  const ids = abonnesDe(lignes);
  for (const t of i.troncons || []) {
    const titre = moment === 'debut' ? titreFr(i, t) : moment === 'annonce' ? `Ligne ${t.ligne} : interruption prévue (à partir de ${quandFr(i.debut)})` : `Ligne ${t.ligne} rétablie`;
    const corps = moment === 'fin' ? 'La circulation reprend normalement sur cette ligne.'
      : `${i.precision || libelleMotif(i.motif)}.${i.remplacement && i.remplacement.type !== 'aucun' ? ` ${i.remplacement.type === 'bus-relais' ? 'Bus-relais' : 'Navette de remplacement'} toutes les ${i.remplacement.frequence || 15} min.` : ''} Voir les solutions de remplacement.`;
    for (const id of ids) notifier(id, titre, corps, `transports.html#int-${i.id}`, moment === 'fin' ? 'info' : 'importante');
  }
  return ids.length;
}
// Vérification chaque minute : début d'une interruption programmée, fin atteinte. Démonstration : interruption renouvelée.
function verifier() {
  const t = Date.now();
  for (const i of docs.tous(COL)) {
    const n = Object.assign({ debut: false, fin: false }, i.notifie || {});
    const s = statut(i, t);
    if (i.demo && !i.leveeLe && s === 'terminee' && i.fin && t - Date.parse(i.fin) > 3600e3) { renouvelerDemo(i); continue; }
    if (s === 'en_cours' && !n.debut) { prevenir(i, 'debut'); docs.patch(COL, i.id, { notifie: Object.assign(n, { debut: true }) }); }
    else if (s === 'terminee' && n.debut && !n.fin) { prevenir(i, 'fin'); docs.patch(COL, i.id, { notifie: Object.assign(n, { fin: true }) }); }
  }
}
function renouvelerDemo(i) {
  const g = i.gabarit || {};
  const debut = g.debutHeures != null ? new Date(Date.now() - g.debutHeures * 3600e3).toISOString() : maintenant();
  const fin = g.finHeure ? aHeureVille(Date.parse(aHeureVille(0, g.finHeure)) - Date.now() > 3600e3 ? 0 : 1, g.finHeure) : g.finJours ? aHeureVille(g.finJours, '20:00') : null;
  docs.patch(COL, i.id, { debut, fin, notifie: { debut: true, fin: false }, maj: maintenant() });
}
let minuterie = null;
function planifier() { if (!minuterie) { minuterie = setInterval(() => { try { verifier(); } catch (e) { console.error('[mobilite]', e.message); } }, 60e3); minuterie.unref(); } }

/* ---------- Agents : déclarer, modifier, lever ---------- */
const personnel = A.exigerRole('agent', 'admin');
function lireInterruption(b, avant) {
  const troncons = (Array.isArray(b.troncons) ? b.troncons : avant ? avant.troncons : []).slice(0, 4).map((t) => ({ ligne: texte(t && t.ligne, 4), de: texte(t && t.de, 20), a: texte(t && t.a, 20) }));
  if (!troncons.length) return { erreur: 'Choisissez au moins une ligne interrompue.' };
  for (const t of troncons) {
    const L = R.LIGNES[t.ligne];
    if (!L) return { erreur: 'Ligne inconnue.' };
    if (!t.de || !t.a) { t.de = L.arrets[0][0]; t.a = L.arrets[L.arrets.length - 1][0]; }
    if (!L.arrets.some((x) => x[0] === t.de) || !L.arrets.some((x) => x[0] === t.a) || t.de === t.a) return { erreur: `Tronçon invalide sur la ligne ${t.ligne} : choisissez deux arrêts différents de cette ligne.` };
  }
  const debut = b.debut === undefined && avant ? avant.debut : b.debut ? new Date(b.debut) : new Date();
  const debutIso = typeof debut === 'string' ? debut : Number.isFinite(debut.getTime()) ? debut.toISOString() : null;
  if (!debutIso) return { erreur: 'Date de début invalide.' };
  let fin = b.fin === undefined && avant ? avant.fin : b.fin ? new Date(b.fin) : null;
  if (fin && typeof fin !== 'string') { if (!Number.isFinite(fin.getTime())) return { erreur: 'Date de fin invalide.' }; fin = fin.toISOString(); }
  if (fin && Date.parse(fin) <= Date.parse(debutIso)) return { erreur: 'La fin doit être après le début.' };
  const motif = MOTIFS.includes(b.motif) ? b.motif : avant ? avant.motif : '';
  if (!motif) return { erreur: 'Choisissez la raison de l’interruption.' };
  const precision = b.precision === undefined && avant ? avant.precision : texte(b.precision, 240);
  const r = b.remplacement === undefined && avant ? avant.remplacement : (b.remplacement || {});
  const type = REMPLACEMENTS.includes(r.type) ? r.type : 'aucun';
  const arrets = Array.isArray(r.arrets) ? [...new Set(r.arrets.map((x) => texte(x, 20)).filter(R.estArret))].slice(0, 10) : [];
  if (type !== 'aucun' && arrets.length < 2) return { erreur: 'Indiquez au moins deux arrêts desservis par le remplacement.' };
  const frequence = Math.min(60, Math.max(3, Math.round(Number(r.frequence) || 15)));
  return { troncons, debut: debutIso, fin: fin || null, motif, precision, remplacement: { type, texte: texte(r.texte, 200), frequence, arrets: type === 'aucun' ? [] : arrets },
    tad: b.tad === undefined ? (avant ? avant.tad !== false : true) : b.tad !== false };
}
const resumeAudit = (i) => `${(i.troncons || []).map((t) => `${t.ligne} ${nomArret(t.de)} → ${nomArret(t.a)}`).join(' ; ')} · du ${new Date(i.debut).toLocaleString('fr-FR', { timeZone: TZ })} ${i.fin ? 'au ' + new Date(i.fin).toLocaleString('fr-FR', { timeZone: TZ }) : 'jusqu’à nouvel ordre'} · remplacement : ${i.remplacement ? i.remplacement.type : 'aucun'}`;

router.get('/api/mobilite/interruptions', personnel, (req, res) => {
  const coupures = coupuresEnCours();
  res.set('Cache-Control', 'no-store');
  res.json({ interruptions: docs.tous(COL).sort((a, b) => String(b.debut).localeCompare(String(a.debut))).slice(0, 60)
    .map((i) => Object.assign(vue(i, coupures, statut(i) !== 'terminee'), { declarePar: i.declarePar || '', leveePar: i.leveePar || '', leveeLe: i.leveeLe || null, cree: i.cree, abonnes: abonnesDe((i.troncons || []).map((t) => t.ligne)).length })),
    lignes: Object.entries(R.LIGNES).map(([id, L]) => ({ id, nom: L.nom, arrets: L.arrets.map((x) => x[0]) })), arrets: Object.fromEntries(Object.entries(R.ARRETS).map(([k, v]) => [k, { nom: v[0], quartier: v[1] }])),
    motifs: MOTIFS, remplacements: REMPLACEMENTS });
});
router.post('/api/mobilite/interruptions', personnel, (req, res) => {
  const d = lireInterruption(req.body || {});
  if (d.erreur) return erreur(res, 400, d.erreur);
  const n = docs.prochainNumero('interruptions', 0);
  const i = docs.put(COL, Object.assign(d, { id: 'INT-' + String(n).padStart(4, '0'), cree: maintenant(), maj: maintenant(), declarePar: `${req.user.prenom} ${req.user.nom}`, declareParId: req.user.id, notifie: { debut: false, fin: false } }));
  audit(req.user, { categorie: 'transport', action: 'Interruption de ligne déclarée', objetId: i.id, objetLibelle: (i.troncons || []).map((t) => 'Ligne ' + t.ligne).join(', '), apres: resumeAudit(i), motif: `${libelleMotif(i.motif)}${i.precision ? ' · ' + i.precision : ''}` });
  let prevenus = 0;
  if (statut(i) === 'en_cours') { prevenus = prevenir(i, 'debut'); docs.patch(COL, i.id, { notifie: { debut: true, fin: false } }); }
  else if (statut(i) === 'programmee') prevenus = prevenir(i, 'annonce');
  res.json(Object.assign(vue(docs.get(COL, i.id), coupuresEnCours(), true), { prevenus }));
});
router.patch('/api/mobilite/interruptions/:id', personnel, (req, res) => {
  const avant = docs.get(COL, req.params.id);
  if (!avant) return erreur(res, 404, 'Interruption introuvable.');
  if (avant.leveeLe) return erreur(res, 409, 'Cette interruption est déjà levée.');
  const d = lireInterruption(req.body || {}, avant);
  if (d.erreur) return erreur(res, 400, d.erreur);
  const maj = docs.patch(COL, avant.id, Object.assign(d, { maj: maintenant(), demo: false }));
  audit(req.user, { categorie: 'transport', action: 'Interruption de ligne modifiée', objetId: avant.id, objetLibelle: (avant.troncons || []).map((t) => 'Ligne ' + t.ligne).join(', '), avant: resumeAudit(avant), apres: resumeAudit(maj), motif: texte((req.body || {}).motifModification, 200) });
  res.json(vue(maj, coupuresEnCours(), true));
});
router.post('/api/mobilite/interruptions/:id/lever', personnel, (req, res) => {
  const i = docs.get(COL, req.params.id);
  if (!i) return erreur(res, 404, 'Interruption introuvable.');
  if (i.leveeLe) return erreur(res, 409, 'Cette interruption est déjà levée.');
  const etaitEnCours = statut(i) === 'en_cours';
  const maj = docs.patch(COL, i.id, { leveeLe: maintenant(), leveePar: `${req.user.prenom} ${req.user.nom}`, demo: false, maj: maintenant(), notifie: { debut: true, fin: true } });
  audit(req.user, { categorie: 'transport', action: 'Ligne rétablie (interruption levée)', objetId: i.id, objetLibelle: (i.troncons || []).map((t) => 'Ligne ' + t.ligne).join(', '), avant: 'interrompue', apres: 'rétablie', motif: texte((req.body || {}).motif, 200) || 'Circulation rétablie' });
  const prevenus = etaitEnCours ? prevenir(i, 'fin') : 0;
  res.json({ ok: true, interruption: vue(maj, coupuresEnCours(), false), prevenus });
});

/* ---------- Version simple (/simple, F62) : lignes interrompues et meilleure solution, sans JavaScript ---------- */
const SIMPLE = {
  fr: { titre: 'Transports : lignes interrompues', jusqua: 'interrompue jusqu’à', ordre: 'interrompue jusqu’à nouvel ordre', entre: 'entre {a} et {b}', solution: 'Meilleure solution', voir: 'Toutes les solutions et l’itinéraire de remplacement', tad: 'Mobilité réduite : transport à la demande au {tel}.',
    o: { relais: 'remplacement toutes les {f} min', 'autres-lignes': 'ligne(s) {l}', marche: 'à pied, environ {n} min', velo: 'vélo en libre-service, environ {n} min' } },
  en: { titre: 'Transport: interrupted lines', jusqua: 'interrupted until', ordre: 'interrupted until further notice', entre: 'between {a} and {b}', solution: 'Best option', voir: 'All options and the replacement route', tad: 'Reduced mobility: on-demand transport on {tel}.',
    o: { relais: 'replacement every {f} min', 'autres-lignes': 'line(s) {l}', marche: 'on foot, about {n} min', velo: 'self-service bike, about {n} min' } },
  es: { titre: 'Transporte: líneas interrumpidas', jusqua: 'interrumpida hasta', ordre: 'interrumpida hasta nuevo aviso', entre: 'entre {a} y {b}', solution: 'Mejor solución', voir: 'Todas las soluciones y el itinerario alternativo', tad: 'Movilidad reducida: transporte a demanda en el {tel}.',
    o: { relais: 'sustitución cada {f} min', 'autres-lignes': 'línea(s) {l}', marche: 'a pie, unos {n} min', velo: 'bicicleta compartida, unos {n} min' } },
  ar: { titre: 'النقل: خطوط متوقفة', jusqua: 'متوقف حتى', ordre: 'متوقف حتى إشعار آخر', entre: 'بين {a} و{b}', solution: 'أفضل حل', voir: 'كل الحلول والمسار البديل', tad: 'الحركة المحدودة: نقل حسب الطلب على {tel}.',
    o: { relais: 'بديل كل {f} د', 'autres-lignes': 'الخط(وط) {l}', marche: 'سيراً، نحو {n} د', velo: 'دراجة ذاتية الخدمة، نحو {n} د' } }
};
function blocSimple(l, e) {
  const T = SIMPLE[l] || SIMPLE.fr;
  const coupures = coupuresEnCours();
  const items = enCours().flatMap((i) => { const sol = R.solutions(i, coupures, []); return (i.troncons || []).map((t, k) => ({ i, t, s: sol[k] })); });
  if (!items.length) return '';
  const r = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (o[k] == null ? '' : o[k]));
  return `<section aria-labelledby="h-transports"><h2 id="h-transports">${e(T.titre)}</h2><ul class="simple-liste">${items.map(({ i, t, s }) => {
    const q = quand(i.fin);
    const fin = q ? `${i.fin ? T.jusqua : ''} ${q.jour === 'auj' ? '' : q.date + ' '}${q.heure}` : T.ordre;
    const tous = R.arretsDuTroncon(t).length === R.LIGNES[t.ligne].arrets.length;
    const o = s && s.options.find((x) => x.type !== 'tad');
    const sol = o ? r(T.o[o.type] || '', { f: o.frequence, l: (o.lignes || []).join(' + '), n: o.duree }) : '';
    return `<li><strong>${e(t.ligne)} — ${e(i.fin ? fin : T.ordre)}</strong>${tous ? '' : ` (${e(r(T.entre, { a: nomArret(t.de), b: nomArret(t.a) }))})`}${sol ? `<br>${e(T.solution)} : ${e(sol)}` : ''}<br>${e(r(T.tad, { tel: R.TAD.tel }))}<br><a href="/transports.html#int-${e(i.id)}">${e(T.voir)}</a></li>`;
  }).join('')}</ul></section>`;
}

module.exports = router;
Object.assign(module.exports, { blocSimple, etatPublic, resume, enCours, statut, aHeureVille, quand, planifier, verifier, titreFr, coupuresEnCours, relaisEnCours });
