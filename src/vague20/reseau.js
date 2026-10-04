/* Terra Nova — vague 20 (F97, Service Mobilité) : réseau de navettes côté serveur et calcul des solutions de remplacement.
   Mêmes arrêts, mêmes lignes et mêmes temps de parcours que transports.html et carte.html (coordonnées du plan 800 × 560,
   1 unité ≈ 8 m). Tout est déterministe et calculé à partir des données du réseau :
   - itinéraire (Dijkstra) qui évite les tronçons interrompus : navettes, correspondances, marche, navette de remplacement ;
   - solutions de remplacement d'une ligne interrompue classées par temps perdu (navette / bus-relais, autres lignes qui
     desservent les mêmes arrêts ou quartiers, marche, vélos et trottinettes en libre-service, transport à la demande PMR). */

const ARRETS = {
  gare: ['Gare orbitale', 'Centre', 450, 318], mairie: ['Hôtel de ville', 'Centre', 395, 285], dispensaire: ['Dispensaire central', 'Centre', 370, 235], quai: ['Quai des Arrivées', 'Centre', 500, 350],
  serres: ['Parc des Serres', 'Nord', 320, 150], orion: ['Arrêt Orion', 'Nord', 400, 95], observatoire: ['Observatoire', 'Nord', 500, 60],
  canal: ['Canal Sud', 'Sud', 190, 478], pionniers: ['Place des Pionniers', 'Sud', 290, 505], social: ['Centre social', 'Sud', 360, 440],
  ateliers: ['Zone des Ateliers', 'Est', 740, 340], aurore: ['Résidence Aurore', 'Est', 715, 290], habitat: ['Pôle habitat', 'Est', 680, 255], kepler: ['Lycée Kepler', 'Est', 640, 305], culturel: ['Dôme culturel', 'Est', 600, 325],
  tri: ['Centre de tri', 'Ouest', 70, 300], emploi: ['Maison de l’emploi', 'Ouest', 120, 250], jardins: ['Jardins hydroponiques', 'Ouest', 170, 330]
};
// [arrêt, minutes depuis le terminus du sens « aller »] — identique à assets/js/transports.js
const LIGNES = {
  N1: { nom: 'Centre – Nord', freq: 12, premier: '05:10', dernier: '22:40', arrets: [['gare', 0], ['mairie', 4], ['dispensaire', 7], ['serres', 12], ['orion', 16], ['observatoire', 21]] },
  N2: { nom: 'Sud – Gare orbitale', freq: 15, premier: '05:00', dernier: '23:00', arrets: [['canal', 0], ['pionniers', 5], ['social', 9], ['mairie', 15], ['gare', 19]] },
  N3: { nom: 'Est – Ouest', freq: 10, premier: '05:30', dernier: '22:50', arrets: [['tri', 0], ['emploi', 5], ['jardins', 9], ['mairie', 14], ['culturel', 19], ['habitat', 24]] },
  N4: { nom: 'Est – Gare orbitale', freq: 10, premier: '05:00', dernier: '23:00', arrets: [['ateliers', 0], ['aurore', 3], ['habitat', 6], ['kepler', 9], ['culturel', 12], ['quai', 16], ['mairie', 19], ['gare', 22]] }
};
// Stations de vélos et trottinettes en libre-service (au pied de ces arrêts)
const STATIONS = [
  { id: 'v-gare', arret: 'gare', nom: 'Station Gare orbitale', velos: true, trottinettes: true },
  { id: 'v-mairie', arret: 'mairie', nom: 'Station Hôtel de ville', velos: true, trottinettes: true },
  { id: 'v-quai', arret: 'quai', nom: 'Station Quai des Arrivées', velos: true, trottinettes: false },
  { id: 'v-culturel', arret: 'culturel', nom: 'Station Dôme culturel', velos: true, trottinettes: true },
  { id: 'v-aurore', arret: 'aurore', nom: 'Station Résidence Aurore', velos: true, trottinettes: false },
  { id: 'v-pionniers', arret: 'pionniers', nom: 'Station Place des Pionniers', velos: true, trottinettes: true },
  { id: 'v-serres', arret: 'serres', nom: 'Station Parc des Serres', velos: true, trottinettes: false },
  { id: 'v-jardins', arret: 'jardins', nom: 'Station Jardins hydroponiques', velos: false, trottinettes: true }
];
// Transport à la demande pour les personnes à mobilité réduite (réservation par téléphone)
const TAD = { tel: '01 55 00 16 30', delaiMin: 45, horaires: 'Tous les jours 6h–22h' };
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];

const MARCHE_MIN_PAR_UNITE = 0.1;      // 8 m par unité, 80 m par minute
const VELO_MIN_PAR_UNITE = 0.035;      // environ 230 m par minute
const MARCHE_MAX = 16;                 // au-delà, la marche n'est plus proposée entre deux arrêts
const CORRESPONDANCE = 2;              // minutes ajoutées à chaque montée (changement, accès au quai)
const RELAIS_LENTEUR = 1.35;           // une navette de remplacement roule plus lentement que la ligne

Object.values(LIGNES).forEach((L) => { L.total = L.arrets[L.arrets.length - 1][1]; });
const idx = (L, a) => L.arrets.findIndex((x) => x[0] === a);
const dist = (a, b) => Math.hypot(ARRETS[a][2] - ARRETS[b][2], ARRETS[a][3] - ARRETS[b][3]);
const marche = (a, b) => Math.max(1, Math.round(dist(a, b) * MARCHE_MIN_PAR_UNITE));
const estArret = (a) => Object.prototype.hasOwnProperty.call(ARRETS, a);
const lignesDe = (a) => Object.keys(LIGNES).filter((l) => idx(LIGNES[l], a) >= 0);

/* ---------- Interruptions : quels tronçons sont coupés, quels arrêts ne sont plus desservis ---------- */
// troncon = { ligne, de, a } : plus aucune navette entre les deux arrêts (les arrêts intermédiaires ne sont plus desservis
// par cette ligne ; les deux extrémités restent desservies depuis l'autre côté). Toute la ligne : de = premier, a = dernier.
function bornes(t) {
  const L = LIGNES[t.ligne]; if (!L) return null;
  let i = idx(L, t.de), j = idx(L, t.a);
  if (i < 0) i = 0;
  if (j < 0) j = L.arrets.length - 1;
  return i <= j ? [i, j] : [j, i];
}
// segment (i, i+1) de la ligne coupé par l'un des tronçons
function segmentCoupe(ligne, i, troncons) {
  return troncons.some((t) => { if (t.ligne !== ligne) return false; const b = bornes(t); return b && i >= b[0] && i < b[1]; });
}
// arrêt qui n'est plus desservi par cette ligne (aucun segment desservi de part et d'autre)
function arretNonDesservi(ligne, a, troncons) {
  const L = LIGNES[ligne]; const i = idx(L, a); if (i < 0) return false;
  const avant = i > 0 ? !segmentCoupe(ligne, i - 1, troncons) : false;
  const apres = i < L.arrets.length - 1 ? !segmentCoupe(ligne, i, troncons) : false;
  return !avant && !apres;
}
const arretsDuTroncon = (t) => { const b = bornes(t); return b ? LIGNES[t.ligne].arrets.slice(b[0], b[1] + 1).map((x) => x[0]) : []; };

/* ---------- Graphe et plus court chemin ---------- */
// Nœuds : « a » (à pied à l'arrêt a) et « a@L » (dans la navette L à l'arrêt a). Les relais sont des lignes « R:<id> ».
function construire(troncons, relais, options) {
  const o = options || {};
  const adj = new Map();
  const arc = (u, v, cout, info) => { if (!adj.has(u)) adj.set(u, []); adj.get(u).push({ v, cout, info }); };
  for (const [id, L] of Object.entries(LIGNES)) {
    for (let i = 0; i < L.arrets.length; i++) {
      const a = L.arrets[i][0];
      const desservi = !arretNonDesservi(id, a, troncons);
      if (desservi) { arc(a, `${a}@${id}`, L.freq / 2 + CORRESPONDANCE, { type: 'monter', ligne: id }); arc(`${a}@${id}`, a, 0, { type: 'descendre', ligne: id }); }
      if (i < L.arrets.length - 1 && !segmentCoupe(id, i, troncons)) {
        const b = L.arrets[i + 1][0], d = L.arrets[i + 1][1] - L.arrets[i][1];
        arc(`${a}@${id}`, `${b}@${id}`, d, { type: 'rouler', ligne: id });
        arc(`${b}@${id}`, `${a}@${id}`, d, { type: 'rouler', ligne: id });
      }
    }
  }
  for (const r of relais || []) {
    const id = 'R:' + r.id, freq = r.frequence || 15;
    for (let i = 0; i < r.arrets.length; i++) {
      const a = r.arrets[i];
      arc(a, `${a}@${id}`, freq / 2 + CORRESPONDANCE, { type: 'monter', ligne: id, relais: r });
      arc(`${a}@${id}`, a, 0, { type: 'descendre', ligne: id, relais: r });
      if (i < r.arrets.length - 1) {
        const b = r.arrets[i + 1], d = Math.max(2, Math.round(r.temps[i]));
        arc(`${a}@${id}`, `${b}@${id}`, d, { type: 'rouler', ligne: id, relais: r });
        arc(`${b}@${id}`, `${a}@${id}`, d, { type: 'rouler', ligne: id, relais: r });
      }
    }
  }
  if (o.marche !== false) {
    const max = o.marcheMax || MARCHE_MAX;
    const ids = Object.keys(ARRETS);
    for (const a of ids) for (const b of ids) if (a !== b) { const m = marche(a, b); if (m <= max) arc(a, b, m * (o.penaliteMarche || 1.25), { type: 'marcher', minutes: m }); }
  }
  return adj;
}
function dijkstra(adj, sources, cibles) {
  const d = new Map(), prec = new Map(), fait = new Set();
  for (const [s, c] of sources) { d.set(s, c); prec.set(s, null); }
  const fin = new Set(cibles.map(([c]) => c));
  const bonus = new Map(cibles);
  let meilleur = null;
  while (true) {
    let u = null, du = Infinity;
    for (const [n, v] of d) if (!fait.has(n) && v < du) { u = n; du = v; }
    if (u === null) break;
    fait.add(u);
    if (fin.has(u)) { const tot = du + (bonus.get(u) || 0); if (!meilleur || tot < meilleur.tot) meilleur = { n: u, tot }; }
    if (meilleur && du > meilleur.tot) break;
    for (const e of adj.get(u) || []) {
      const nd = du + e.cout;
      if (nd < (d.has(e.v) ? d.get(e.v) : Infinity)) { d.set(e.v, nd); prec.set(e.v, { u, e }); }
    }
  }
  if (!meilleur) return null;
  const chemin = [];
  let n = meilleur.n;
  while (prec.get(n)) { const p = prec.get(n); chemin.unshift({ de: p.u, vers: n, e: p.e }); n = p.u; }
  return { depart: n, arrivee: meilleur.n, cout: meilleur.tot, chemin };
}
// Étapes lisibles : marcher / prendre une ligne (de, à, arrêts, minutes) ; durée estimée réaliste (attente moyenne comprise)
function etapes(res) {
  const out = [];
  for (const p of res.chemin) {
    const i = p.e.info, a = p.de.split('@')[0], b = p.vers.split('@')[0];
    if (i.type === 'marcher') {
      const der = out[out.length - 1];
      if (der && der.type === 'marche') { der.vers = b; der.minutes += i.minutes; } else out.push({ type: 'marche', de: a, vers: b, minutes: i.minutes });
    } else if (i.type === 'monter') {
      const relais = i.relais || null;
      const freq = relais ? relais.frequence || 15 : LIGNES[i.ligne].freq;
      out.push({ type: relais ? 'relais' : 'ligne', ligne: relais ? relais.ligneRemplacee : i.ligne, relais: relais ? { id: relais.id, libelle: relais.libelle, type: relais.type } : null,
        de: a, vers: a, arrets: 0, minutes: 0, attente: Math.round(freq / 2), frequence: freq });
    } else if (i.type === 'rouler') { const der = out[out.length - 1]; der.vers = b; der.arrets++; der.minutes += p.e.cout; }
  }
  const nettes = out.filter((x) => x.type === 'marche' ? x.de !== x.vers : x.arrets > 0);
  const duree = nettes.reduce((n, x) => n + x.minutes + (x.attente || 0) + (x.type === 'marche' ? 0 : CORRESPONDANCE), 0);
  return { etapes: nettes.map((x) => Object.assign(x, { minutes: Math.round(x.minutes) })), duree: Math.round(duree), correspondances: Math.max(0, nettes.filter((x) => x.type !== 'marche').length - 1) };
}
// Point de départ / d'arrivée : un arrêt (« kepler ») ou un quartier (« q:Est », on rejoint le meilleur arrêt du quartier à pied)
function points(p) {
  const s = String(p || '');
  if (s.startsWith('q:') && QUARTIERS.includes(s.slice(2))) return Object.keys(ARRETS).filter((a) => ARRETS[a][1] === s.slice(2)).map((a) => [a, 4]);
  return estArret(s) ? [[s, 0]] : null;
}
function itineraire(de, vers, troncons, relais, options) {
  const S = points(de), C = points(vers);
  if (!S || !C) return { erreur: 'Départ ou arrivée inconnu.' };
  if (de === vers) return { erreur: 'Départ et arrivée identiques.' };
  if (S.some(([a]) => C.some(([b]) => a === b))) return { memeEndroit: true };
  const r = dijkstra(construire(troncons, relais, options), S, C);
  if (!r) return { aucun: true };
  const e = etapes(r);
  const accesQ = (String(de).startsWith('q:') ? 4 : 0) + (String(vers).startsWith('q:') ? 4 : 0);
  return Object.assign(e, { depart: r.depart, arrivee: r.arrivee, duree: e.duree + accesQ, accesQuartier: accesQ });
}

/* ---------- Solutions de remplacement pour un tronçon interrompu ---------- */
function relaisDe(interruption) {
  const r = interruption.remplacement || {};
  if (!r.type || r.type === 'aucun' || !Array.isArray(r.arrets) || r.arrets.length < 2) return [];
  const arrets = r.arrets.filter(estArret);
  if (arrets.length < 2) return [];
  const ligne = (interruption.troncons || [])[0] ? interruption.troncons[0].ligne : '';
  const L = LIGNES[ligne];
  const temps = [];
  for (let i = 0; i < arrets.length - 1; i++) {
    const a = arrets[i], b = arrets[i + 1];
    const ia = L ? idx(L, a) : -1, ib = L ? idx(L, b) : -1;
    const base = ia >= 0 && ib >= 0 ? Math.abs(L.arrets[ib][1] - L.arrets[ia][1]) : dist(a, b) * 0.03;
    temps.push(base * RELAIS_LENTEUR);
  }
  return [{ id: interruption.id, type: r.type, libelle: r.texte || '', frequence: Number(r.frequence) || 15, arrets, temps, ligneRemplacee: ligne }];
}
const tempsLigne = (ligne, a, b) => { const L = LIGNES[ligne]; return Math.abs(L.arrets[idx(L, b)][1] - L.arrets[idx(L, a)][1]); };
function stationPres(a) {
  return STATIONS.map((s) => ({ s, m: s.arret === a ? 0 : marche(a, s.arret) })).filter((x) => x.m <= 6).sort((x, y) => x.m - y.m)[0] || null;
}
/* Pour chaque tronçon : trajet de référence (première → dernière extrémité du tronçon), temps habituel, puis les
   options classées par temps supplémentaire. troncons = toutes les coupures actives (une autre ligne peut l'être aussi). */
function solutions(interruption, toutesCoupures, toutesRelais) {
  const res = [];
  for (const t of interruption.troncons || []) {
    if (!LIGNES[t.ligne]) continue;
    const arrets = arretsDuTroncon(t);
    const A = arrets[0], B = arrets[arrets.length - 1];
    const habituel = tempsLigne(t.ligne, A, B) + LIGNES[t.ligne].freq / 2 + CORRESPONDANCE;
    const options = [];
    // 1. navette de remplacement / bus-relais déclaré par l'agent
    const rel = relaisDe(interruption)[0];
    if (rel) {
      const ra = rel.arrets.indexOf(A) >= 0 ? A : rel.arrets[0], rb = rel.arrets.indexOf(B) >= 0 ? B : rel.arrets[rel.arrets.length - 1];
      const i1 = rel.arrets.indexOf(ra), i2 = rel.arrets.indexOf(rb);
      const roule = rel.temps.slice(Math.min(i1, i2), Math.max(i1, i2)).reduce((n, x) => n + x, 0);
      const duree = Math.round(roule + rel.frequence / 2 + CORRESPONDANCE);
      options.push({ type: 'relais', sousType: rel.type, libelle: rel.libelle, frequence: rel.frequence, arrets: rel.arrets, duree, perte: Math.max(0, Math.round(duree - habituel)) });
    }
    // 2. itinéraire par les autres lignes (et la marche), en évitant toutes les coupures en cours
    const it = itineraire(A, B, toutesCoupures, [], { marche: true, marcheMax: 8 });
    if (it && it.etapes && it.etapes.some((e) => e.type === 'ligne')) {
      options.push({ type: 'autres-lignes', lignes: [...new Set(it.etapes.filter((e) => e.type === 'ligne').map((e) => e.ligne))], etapes: it.etapes, duree: it.duree, perte: Math.max(0, Math.round(it.duree - habituel)) });
    }
    // 3. à pied, de bout en bout
    const m = marche(A, B);
    options.push({ type: 'marche', minutes: m, duree: m, perte: Math.max(0, Math.round(m - habituel)), distanceM: Math.round(dist(A, B) * 8 / 10) * 10 });
    // 4. vélos et trottinettes en libre-service près des deux extrémités
    const s1 = stationPres(A), s2 = stationPres(B);
    if (s1 && s2 && s1.s.id !== s2.s.id) {
      const roule = Math.max(2, Math.round(dist(s1.s.arret, s2.s.arret) * VELO_MIN_PAR_UNITE));
      const duree = s1.m + roule + s2.m + 2;
      options.push({ type: 'velo', depart: s1.s, arrivee: s2.s, velos: s1.s.velos && s2.s.velos, trottinettes: s1.s.trottinettes && s2.s.trottinettes, duree, perte: Math.max(0, Math.round(duree - habituel)) });
    }
    options.sort((x, y) => x.perte - y.perte || x.duree - y.duree);
    // 5. transport à la demande pour les personnes à mobilité réduite : toujours proposé, en dernier (réservation)
    options.push({ type: 'tad', tel: TAD.tel, delaiMin: TAD.delaiMin, horaires: TAD.horaires, duree: null, perte: null });
    // arrêts qui ne sont plus desservis par la ligne : où aller à la place
    const nonDesservis = arrets.filter((a) => arretNonDesservi(t.ligne, a, toutesCoupures));
    const parArret = nonDesservis.map((a) => {
      const autres = lignesDe(a).filter((l) => l !== t.ligne && !arretNonDesservi(l, a, toutesCoupures));
      const proches = Object.keys(ARRETS).filter((b) => b !== a && lignesDe(b).some((l) => !arretNonDesservi(l, b, toutesCoupures) && (l !== t.ligne || !arrets.slice(1, -1).includes(b))))
        .map((b) => ({ arret: b, minutes: marche(a, b), lignes: lignesDe(b).filter((l) => !arretNonDesservi(l, b, toutesCoupures)) })).sort((x, y) => x.minutes - y.minutes).slice(0, 2);
      return { arret: a, autresLignes: autres, relais: !!(rel && rel.arrets.includes(a)), proches, station: (stationPres(a) || {}).s || null };
    });
    // quartiers desservis autrement (autres lignes qui passent dans les mêmes quartiers)
    const quartiers = [...new Set(arrets.map((a) => ARRETS[a][1]))].map((q) => ({ quartier: q,
      lignes: Object.keys(LIGNES).filter((l) => l !== t.ligne && LIGNES[l].arrets.some(([a]) => ARRETS[a][1] === q && !arretNonDesservi(l, a, toutesCoupures))) }));
    res.push({ ligne: t.ligne, de: A, a: B, arrets, touteLaLigne: arrets.length === LIGNES[t.ligne].arrets.length, habituel: Math.round(habituel), options, parArret, quartiers });
  }
  return res;
}

module.exports = { ARRETS, LIGNES, STATIONS, TAD, QUARTIERS, estArret, lignesDe, arretNonDesservi, segmentCoupe, arretsDuTroncon, itineraire, solutions, relaisDe, marche, bornes };
