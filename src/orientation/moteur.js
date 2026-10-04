/* Terra Nova — vague 18 (D10, F91, F92) : moteur d'orientation hors ligne et déterministe (aucune IA générative, aucun appel réseau).
   1. Index : services, besoins (démarches, signalements, questions), réponses courtes, annonces actives, associations partenaires,
      plus les expressions ajoutées par les agents. Chaque fiche : mots racinisés pondérés par champ, familles de mots, expressions.
   2. Analyse de la phrase : normalisation, mots vides, racines, correction des fautes (clé phonétique puis Damerau-Levenshtein
      sur le vocabulaire connu), familles de mots (« poubelle » = « bin » = « basura »), expressions entières (« plus d'eau au robinet »).
   3. Score = BM25 (mots) + familles de mots partagées (pondérées par leur rareté) + bonus d'expression ; confiance = niveau et écart
      avec le deuxième ; question de précision quand deux besoins différents sont trop proches.
   Rien n'est retenu sur la personne : le moteur ne reçoit qu'une phrase et une langue. */
'use strict';
const T = require('./texte');
const B = require('./base');

const K1 = 1.2, BB = 0.75;
const langueOk = (l) => (['fr', 'en', 'es', 'ar'].includes(l) ? l : 'fr');
const choisir = (o, l) => (o && typeof o === 'object' && !Array.isArray(o) ? (o[l] != null && o[l] !== '' ? o[l] : o.fr) : o);

/* ---------- Familles de mots : racine d'un mot → familles ; expressions de plusieurs mots ---------- */
const parRacine = new Map();          // racine → Set(concepts)
const phrasesConcepts = [];           // { phrase normalisée, concept }
for (const [c, variantes] of Object.entries(B.CONCEPTS)) {
  for (const v of variantes) {
    const n = T.normaliser(v);
    if (!n) continue;
    if (n.includes(' ')) phrasesConcepts.push({ phrase: n, concept: c });
    else { const r = T.raciner(n); if (!parRacine.has(r)) parRacine.set(r, new Set()); parRacine.get(r).add(c); }
  }
}
const echapRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const contient = (texte, phrase) => (' ' + texte + ' ').includes(' ' + phrase + ' ');
function conceptsDe(texteNorm, racines) {
  const s = new Set();
  for (const r of racines) { const c = parRacine.get(r); if (c) c.forEach((x) => s.add(x)); }
  for (const p of phrasesConcepts) if (contient(texteNorm, p.phrase)) s.add(p.concept);
  return s;
}

/* ---------- Construction de l'index ---------- */
function fiche(type, id, champs, conceptsExplicites, expressions, ref) {
  const tf = new Map();
  let longueur = 0;
  const brut = [];   // champs assez parlants pour en déduire les familles de mots (titres, noms, descriptions), pas les listes de documents
  for (const [texte, poids] of champs) {
    if (!texte) continue;
    const t = Array.isArray(texte) ? texte.join(' ') : String(texte);
    if (poids >= 1.5) brut.push(t);
    for (const m of T.motsUtiles(t)) { const r = T.raciner(m); tf.set(r, (tf.get(r) || 0) + poids); longueur += poids; }
  }
  const exprs = [];
  for (const e of expressions || []) {
    const n = T.normaliser(e);
    if (!n) continue;
    const racines = [...new Set(T.motsUtiles(n).map(T.raciner))];
    exprs.push({ n, racines });
    for (const r of racines) { tf.set(r, (tf.get(r) || 0) + 1.5); longueur += 1.5; }
  }
  const norm = T.normaliser(brut.join(' '));
  const concepts = conceptsDe(norm, [...new Set(T.motsUtiles(norm).map(T.raciner))]);
  (conceptsExplicites || []).forEach((c) => concepts.add(c));
  for (const e of exprs) conceptsDe(e.n, e.racines).forEach((c) => concepts.add(c));
  return { type, id, tf, longueur: Math.max(1, longueur), concepts, explicites: new Set(conceptsExplicites || []), exprs, ref };
}

function construire({ services = [], annonces = [], associations = [], synonymes = [] } = {}) {
  const appris = new Map();   // cible → expressions ajoutées par les agents
  for (const s of synonymes) { if (!s || !s.cible || !s.expression) continue; if (!appris.has(s.cible)) appris.set(s.cible, []); appris.get(s.cible).push(s.expression); }
  const fiches = [];
  const servicesParId = new Map(services.map((s) => [s.id, s]));
  for (const s of services) {
    const meta = B.SERVICES[s.id] || {};
    const besoinsDuService = B.BESOINS.filter((b) => b.service === s.id);
    fiches.push(fiche('service', s.id, [
      [Object.values(s.nom || {}).join(' '), 3], [Object.values(s.description || {}).join(' '), 1.5], [s.categorie, 1],
      [besoinsDuService.map((b) => Object.values(b.titre).join(' ')).join(' '), 0.6]
    ], meta.concepts, appris.get('service:' + s.id) || [], s));
  }
  for (const b of B.BESOINS) {
    fiches.push(fiche('besoin', b.id, [[Object.values(b.titre).join(' '), 3], [b.documents ? Object.values(b.documents).flat().join(' ') : '', 0.4]],
      b.concepts, (b.expressions || []).concat(appris.get(b.id) || []), b));
  }
  for (const r of B.REPONSES) fiches.push(fiche('reponse', r.id, [[Object.values(r.q).join(' '), 2.5], [r.mots, 2], [r.r.fr + ' ' + r.r.en, 0.5]], r.concepts, appris.get('reponse:' + r.id) || [], r));
  for (const a of annonces) {
    if (!a || a.active === false) continue;
    fiches.push(fiche('annonce', a.id, [[a.titre, 3], [a.resume, 1.5], [a.contenu, 0.7], [(a.consignes || []).join(' '), 0.5]], [], [], a));
  }
  for (const a of associations) {
    fiches.push(fiche('association', a.id, [[a.nom, 2.5], [Object.values(a.aide || {}).flat().join(' '), 1.5], [(a.themes || []).join(' '), 1.5]],
      (a.services || []).flatMap((id) => (B.SERVICES[id] || {}).concepts || []).slice(0, 4), [], a));
  }
  // Statistiques pour BM25 et rareté des familles de mots
  const df = new Map(), dfc = new Map();
  let somme = 0;
  for (const f of fiches) { somme += f.longueur; for (const r of f.tf.keys()) df.set(r, (df.get(r) || 0) + 1); for (const c of f.concepts) dfc.set(c, (dfc.get(c) || 0) + 1); }
  // Vocabulaire pour la correction des fautes : mots des fiches, des familles et des expressions
  const vocab = new Map();   // mot → fréquence
  const formes = new Map();  // mot normalisé → forme écrite (avec accents), pour l'affichage des corrections
  const ajouterVocab = (t) => {
    for (const brut of String(t || '').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      const m = T.normaliser(brut);
      if (!m || m.length < 3 || m.includes(' ') || T.VIDES.has(m)) continue;
      vocab.set(m, (vocab.get(m) || 0) + 1);
      if (!formes.has(m) || (formes.get(m) === m && brut !== m)) formes.set(m, brut);
    }
  };
  for (const s of services) { ajouterVocab(Object.values(s.nom || {}).join(' ')); ajouterVocab(Object.values(s.description || {}).join(' ')); }
  for (const b of B.BESOINS) { ajouterVocab(Object.values(b.titre).join(' ')); (b.expressions || []).forEach(ajouterVocab); }
  for (const v of Object.values(B.CONCEPTS)) v.forEach(ajouterVocab);
  for (const l of appris.values()) l.forEach(ajouterVocab);
  for (const a of annonces) if (a && a.active !== false) ajouterVocab(a.titre + ' ' + (a.resume || ''));
  const phon = new Map();
  for (const m of vocab.keys()) { const k = T.phonetique(m); if (!phon.has(k)) phon.set(k, []); phon.get(k).push(m); }
  return { fiches, df, dfc, N: fiches.length, moy: somme / Math.max(1, fiches.length), vocab, formes, phon, servicesParId, construitLe: Date.now() };
}

/* ---------- Analyse d'une phrase ---------- */
function corriger(index, m, elision) {
  const r = T.raciner(m);
  if (index.df.has(r) || parRacine.has(r) || index.vocab.has(m) || /\d/.test(m)) return null;
  if (m.length < 4) return null;
  // apostrophe oubliée : « lecole » = l'école, « didentite » = d'identité, « jhabite » = j'habite
  if (!elision && /^[dlj][aeiouyh]/.test(m) && m.length > 4) {
    const reste = m.slice(1), rr = T.raciner(reste);
    if (index.df.has(rr) || parRacine.has(rr) || index.vocab.has(reste)) return reste;
    const c = corriger(index, reste, true);
    if (c) return c;
  }
  const memePhon = index.phon.get(T.phonetique(m));
  if (memePhon && memePhon.length) return memePhon.slice().sort((a, b) => index.vocab.get(b) - index.vocab.get(a))[0];
  const seuil = T.seuilFaute(m);
  let meilleur = null, dist = seuil + 1, freq = 0;
  for (const [v, f] of index.vocab) {
    if (Math.abs(v.length - m.length) > seuil) continue;
    if (T.estArabe(v) !== T.estArabe(m)) continue;
    const d0 = T.distance(m, v, seuil);
    const d = d0 >= 2 && v[0] !== m[0] ? seuil + 1 : d0;   // deux fautes ou plus : la première lettre doit être la bonne
    if (d < dist || (d === dist && f > freq)) { meilleur = v; dist = d; freq = f; }
  }
  return dist <= seuil ? meilleur : null;
}

function analyser(index, phrase) {
  const norm = T.normaliser(phrase).slice(0, 400);
  const utiles = T.motsUtiles(norm).slice(0, 40);
  const corrections = [];
  const motsFinals = T.mots(norm).map((m) => {
    if (T.VIDES.has(m) || (m.length < 2 && !/\d/.test(m))) return m;
    const c = corriger(index, m);
    if (c && c !== m) { corrections.push({ de: m, vers: c }); return c; }
    return m;
  });
  const corrige = motsFinals.join(' ');
  // formes écrites par l'habitant (accents compris) et formes corrigées lisibles, pour l'affichage seulement
  const surface = new Map();
  for (const brut of String(phrase || '').toLowerCase().split(/[^\p{L}\p{N}]+/u)) { const m = T.normaliser(brut); if (m && !surface.has(m)) surface.set(m, brut); }
  const lisible = (m) => (index.formes && index.formes.get(m)) || m;
  const termes = [];   // { mot (tel que compris, lisible), racine }
  for (const m of utiles) {
    const c = corrections.find((x) => x.de === m);
    termes.push({ mot: c ? lisible(c.vers) : (surface.get(m) || m), original: m, racine: T.raciner(c ? c.vers : m) });
  }
  let corrigeAffiche = String(phrase || '').slice(0, 400);
  for (const c of corrections) { const s = surface.get(c.de) || c.de; corrigeAffiche = corrigeAffiche.replace(new RegExp(echapRe(s), 'i'), lisible(c.vers)); c.de = s; c.vers = lisible(c.vers); }
  const racines = [...new Set(termes.map((t) => t.racine))];
  const concepts = conceptsDe(corrige, racines);
  return { norm, corrige, corrigeAffiche, corrections, termes, racines, concepts };
}

/* ---------- Score d'une fiche ---------- */
function noter(index, a, f) {
  let bm25 = 0;
  for (const r of a.racines) {
    const tf = f.tf.get(r);
    if (!tf) continue;
    const n = index.df.get(r) || 0;
    const idf = Math.log(1 + (index.N - n + 0.5) / (n + 0.5));
    bm25 += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - BB + (BB * f.longueur) / index.moy));
  }
  let conc = 0;
  const partages = [];
  for (const c of a.concepts) if (f.concepts.has(c)) { conc += (f.explicites.has(c) ? 1.6 : 0.8) * Math.log(1 + index.N / (index.dfc.get(c) || 1)); partages.push(c); }
  let expr = 0, exprTrouvee = null;
  for (const e of f.exprs) {
    let b = 0;
    if (e.n.length >= 4 && contient(a.corrige, e.n)) b = 3 + Math.min(4, e.racines.length);
    else if (e.racines.length >= 2) {
      const n = e.racines.filter((r) => a.racines.includes(r)).length;
      if (n === e.racines.length) b = 2.5 + 0.5 * n;
      else if (n >= 2 && n / e.racines.length >= 0.6) b = 1.2 + 0.3 * n;
    }
    if (b > expr) { expr = b; exprTrouvee = e.n; }
  }
  return { score: bm25 + conc + expr, bm25, conc, expr, partages, exprTrouvee };
}

// Mots de la phrase qui expliquent le résultat (« parce que vous parlez de… »)
function raisons(a, f, detail) {
  const r = [];
  for (const t of a.termes) {
    const fam = parRacine.get(t.racine);
    if (f.tf.has(t.racine) || (fam && [...fam].some((c) => f.concepts.has(c)))) if (!r.includes(t.mot)) r.push(t.mot);
  }
  if (!r.length && detail.exprTrouvee) r.push(detail.exprTrouvee);
  return r.slice(0, 4);
}

function classer(index, phrase) {
  const a = analyser(index, phrase);
  if (!a.racines.length && !a.concepts.size) return { a, liste: [] };
  const liste = [];
  for (const f of index.fiches) {
    const d = noter(index, a, f);
    if (d.score > 0.3) liste.push({ f, d, score: d.score });
  }
  liste.sort((x, y) => y.score - x.score || x.f.id.localeCompare(y.f.id));
  return { a, liste };
}

/* ---------- Mise en forme ---------- */
const etatDe = (s) => (s && s.etat ? { code: s.etat.code || 'ok', message: s.etat.message || '', retour: s.etat.retour || '', alternative: s.etat.alternative || null } : { code: 'ok' });
function infoService(index, id, l) {
  const s = index.servicesParId.get(id);
  if (!s) return null;
  const meta = B.SERVICES[id] || {};
  return { id, nom: choisir(s.nom, l), description: choisir(s.description, l), horaires: s.horaires || '', lieu: s.lieu || '', contact: s.contact || '', tel: meta.tel || '',
    carte: meta.lieu ? 'carte.html?lieu=' + meta.lieu : '', rdv: !!s.rdv, etat: etatDe(s), icone: s.icone || '' };
}
const enc = encodeURIComponent;
function actionsBesoin(b, svc) {
  const actions = [];
  const indispo = svc && svc.etat && svc.etat.code === 'desactive';
  if (b.type === 'urgence') return [{ code: 'appeler15', tel: '15' }, { code: 'appeler112', tel: '112' }];
  if (b.danger) actions.push({ code: 'appeler112', tel: '112' });
  if (indispo && ['demarche', 'rdv'].includes(b.type)) actions.push({ code: 'ecrire', lien: `demande.html?type=contact&service=${enc(b.service)}` });
  else if (b.type === 'demarche') actions.push({ code: 'commencer', lien: `demande.html?type=demarche&service=${enc(b.service)}${b.nature ? '&nature=' + enc(b.nature) : ''}` });
  else if (b.type === 'signalement') actions.push({ code: 'signaler', lien: `demande.html?type=signalement&categorie=${enc(b.categorie || 'autre')}` });
  else if (b.type === 'contact') actions.push({ code: 'ecrire', lien: `demande.html?type=contact&service=${enc(b.service || 'inconnu')}` });
  else if (b.type === 'rdv') actions.push({ code: 'rdv', lien: 'rendez-vous.html' + (b.service ? '?service=' + enc(b.service) : '') });
  else if (b.type === 'info') actions.push({ code: 'voir', lien: b.lien || 'services.html' });
  if (svc && svc.rdv && b.type !== 'rdv' && !indispo && b.type !== 'signalement') actions.push({ code: 'rdv', lien: 'rendez-vous.html?service=' + enc(svc.id) });
  if (svc && svc.tel) actions.push({ code: 'appeler', tel: svc.tel });
  if (svc && svc.carte && b.type !== 'signalement') actions.push({ code: 'carte', lien: svc.carte });
  return actions.slice(0, 4);
}
function actionService(s) {
  return s.etat && s.etat.code === 'desactive' ? { code: 'ecrire', lien: `demande.html?type=contact&service=${enc(s.id)}` } : { code: 'voirService', lien: 'services.html#' + enc(s.id) };
}

// Ouverte maintenant ? (plages des associations, heure de la ville)
const TZ = process.env.TZ_VILLE || 'Indian/Mayotte';
function maintenantVille() {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { j: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), hm: `${p.hour === '24' ? '00' : p.hour}:${p.minute}` };
  } catch { const d = new Date(); return { j: d.getDay(), hm: d.toTimeString().slice(0, 5) }; }
}
function ouverte(plages) {
  const m = maintenantVille();
  return (plages || []).some(([jours, de, a]) => jours.includes(m.j) && m.hm >= de && m.hm < a);
}
function infoAssociation(a, l) {
  return { id: a.id, nom: a.nom, adresse: a.adresse || '', tel: a.tel || '', quartier: a.quartier || '', aide: choisir(a.aide, l) || [], conditions: choisir(a.conditions, l) || '',
    ouverte: ouverte(a.plages), lien: 'carte.html?lieu=' + enc(a.id) };
}

function detailBesoin(index, b, l, associations) {
  const svc = b.service ? infoService(index, b.service, l) : null;
  return {
    id: b.id, type: b.type, titre: choisir(b.titre, l), service: svc,
    etapes: choisir(b.etapes || B.ETAPES[b.type === 'info' || b.type === 'urgence' ? 'contact' : b.type] || B.ETAPES.contact, l),
    documents: b.documents ? choisir(b.documents, l) : [],
    clair: b.clair || '', danger: !!b.danger,
    actions: actionsBesoin(b, svc),
    associations: (associations || []).filter((a) => b.service && (a.services || []).includes(b.service)).map((a) => infoAssociation(a, l))
      .sort((x, y) => (y.ouverte - x.ouverte)).slice(0, 2),
    prefill: { type: ['demarche', 'signalement', 'contact'].includes(b.type) ? b.type : b.type === 'rdv' ? 'demarche' : 'contact', service: b.service || '', categorie: b.categorie || '', nature: b.nature || '' }
  };
}

/* ---------- Recherche globale (D10) ---------- */
const LIMITES = { service: 4, besoin: 5, reponse: 3, annonce: 3, association: 3 };
function rechercher(index, q, langue, { associations = [] } = {}) {
  const l = langueOk(langue);
  const { a, liste } = classer(index, q);
  const top = liste.length ? liste[0].score : 0;
  const seuil = Math.max(1.6, top * 0.3);
  // les besoins très bien reconnus remontent leur service (« ma poubelle déborde » → Déchets & recyclage)
  const parService = new Map();
  for (const x of liste) if (x.f.type === 'besoin' && x.f.ref.service) parService.set(x.f.ref.service, Math.max(parService.get(x.f.ref.service) || 0, x.score * 0.85));
  const scores = new Map(liste.map((x) => [x.f.type + ':' + x.f.id, x]));
  for (const [id, sc] of parService) {
    const cle = 'service:' + id, e = scores.get(cle);
    if (!e || e.score < sc) { const f = index.fiches.find((y) => y.type === 'service' && y.id === id); if (f) scores.set(cle, { f, d: e ? e.d : { exprTrouvee: null }, score: sc }); }
  }
  const tous = [...scores.values()].filter((x) => x.score >= seuil).sort((x, y) => y.score - x.score);
  const groupes = { services: [], demarches: [], reponses: [], annonces: [], associations: [] };
  const nom = { service: 'services', besoin: 'demarches', reponse: 'reponses', annonce: 'annonces', association: 'associations' };
  for (const x of tous) {
    const g = groupes[nom[x.f.type]];
    if (g.length >= LIMITES[x.f.type]) continue;
    const f = x.f, r = f.ref;
    let item;
    if (f.type === 'service') { const s = infoService(index, f.id, l); item = { titre: s.nom, extrait: s.description, lien: 'services.html#' + enc(f.id), action: actionService(s), etat: s.etat.code, icone: s.icone }; }
    else if (f.type === 'besoin') { const svc = r.service ? infoService(index, r.service, l) : null; item = { titre: choisir(r.titre, l), extrait: svc ? svc.nom : '', lien: actionsBesoin(r, svc)[0].lien || '', action: actionsBesoin(r, svc)[0], typeBesoin: r.type, service: r.service || '' }; }
    else if (f.type === 'reponse') item = { titre: choisir(r.q, l), extrait: choisir(r.r, l), lien: r.lien, action: { code: 'lire', lien: r.lien } };
    else if (f.type === 'annonce') item = { titre: r.titre, extrait: r.resume || '', lien: 'annonces.html#' + enc(r.id), action: { code: 'voirAnnonce', lien: 'annonces.html#' + enc(r.id) }, importance: r.importance || 'info' };
    else { const as = infoAssociation(r, l); item = { titre: as.nom, extrait: as.aide.slice(0, 2).join(' · '), lien: as.lien, action: as.tel ? { code: 'appeler', tel: as.tel } : { code: 'carte', lien: as.lien }, ouverte: as.ouverte, lienCarte: as.lien }; }
    g.push(Object.assign({ type: f.type, id: f.id, score: Math.round(x.score * 10) / 10, raisons: raisons(a, f, x.d) }, item));
  }
  const total = Object.values(groupes).reduce((n, g) => n + g.length, 0);
  const second = liste.length > 1 ? liste[1].score : 0;
  const niveau = top >= 7 && (top - second) / top >= 0.15 ? 'haute' : top >= 3.5 ? 'moyenne' : top > 0 ? 'basse' : 'aucune';
  // meilleur geste : le besoin reconnu en tête, sinon le premier service
  const meilleur = groupes.demarches[0] && liste[0] && liste[0].f.type === 'besoin' ? groupes.demarches[0] : groupes.services[0] || groupes.demarches[0] || null;
  const res = { q: String(q || '').slice(0, 200), langue: l, corrige: a.corrections.length ? a.corrigeAffiche : null, corrections: a.corrections, concepts: [...a.concepts], niveau,
    confiance: Math.round(Math.min(1, top / 10) * 100) / 100, total, groupes, meilleur };
  if (!total) res.repli = { services: repliServices(index, a, l) };
  return res;
}

// Jamais d'impasse : services les plus proches par trigrammes, sinon les services les plus utilisés
function repliServices(index, a, l) {
  const tri = T.trigrammes(a.corrige || a.norm);
  const l2 = [...index.servicesParId.values()].map((s) => ({ s, sim: T.similarite(tri, T.trigrammes(Object.values(s.nom || {}).join(' ') + ' ' + choisir(s.description, 'fr'))) }))
    .sort((x, y) => y.sim - x.sim || (y.s.prioritaire ? 1 : 0) - (x.s.prioritaire ? 1 : 0) || (y.s.vues || 0) - (x.s.vues || 0));
  return l2.slice(0, 3).map(({ s }) => { const i = infoService(index, s.id, l); return { id: s.id, titre: i.nom, extrait: i.description, lien: 'services.html#' + enc(s.id), action: actionService(i) }; });
}

/* ---------- Assistant d'orientation (F91) et suggestions de service (F92) ---------- */
function besoinsClasses(index, phrase) {
  const { a, liste } = classer(index, phrase);
  const besoins = liste.filter((x) => x.f.type === 'besoin');
  const services = liste.filter((x) => x.f.type === 'service');
  return { a, besoins, services, liste };
}
const SEUIL_BESOIN = 3;

function repondre(index, { message, langue, choix, precedent, associations = [], urgent = false, pasUrgent = false } = {}) {
  const l = langueOk(langue);
  const texte = String(message || '').slice(0, 600);
  if (urgent) {
    const b = B.BESOINS.find((x) => x.id === 'urgence');
    return { urgence: true, niveau: 'haute', reponse: detailBesoin(index, b, l, associations) };
  }
  if (choix) {
    const b = B.BESOINS.find((x) => x.id === choix);
    if (b) return { urgence: b.type === 'urgence', niveau: 'haute', confiance: 1, comprehension: { besoin: choisir(b.titre, l), raisons: [] }, reponse: detailBesoin(index, b, l, associations) };
    const s = String(choix).startsWith('service:') && index.servicesParId.get(String(choix).slice(8));
    if (s) return reponseService(index, s.id, l, [], associations);
  }
  const phrase = precedent ? `${String(precedent).slice(0, 300)} ${texte}` : texte;
  const cl = besoinsClasses(index, phrase);
  const { a, services } = cl;
  const besoins = pasUrgent ? cl.besoins.filter((x) => x.f.ref.type !== 'urgence') : cl.besoins;
  const corrige = a.corrections.length ? a.corrigeAffiche : null;
  const b1 = besoins[0], b2 = besoins[1];
  const s1 = services[0];
  if (b1 && b1.f.ref.type === 'urgence' && b1.score >= SEUIL_BESOIN) return { urgence: true, niveau: 'haute', corrige, reponse: detailBesoin(index, b1.f.ref, l, associations) };
  if (!b1 || b1.score < SEUIL_BESOIN) {
    // un service est reconnu sans démarche précise : proposer ses démarches
    if (s1 && s1.score >= SEUIL_BESOIN) {
      const opts = B.BESOINS.filter((b) => b.service === s1.f.id).slice(0, 3).map((b) => ({ id: b.id, libelle: choisir(b.titre, l) }));
      return Object.assign(reponseService(index, s1.f.id, l, raisons(a, s1.f, s1.d), associations), { corrige,
        clarification: opts.length ? { options: opts.concat([{ id: 'service:' + s1.f.id, libelle: '' }]) } : null });
    }
    const opts = besoins.slice(0, 3).filter((x) => x.score >= 1.2).map((x) => ({ id: x.f.id, libelle: choisir(x.f.ref.titre, l) }));
    return { incompris: true, niveau: 'basse', corrige, confiance: 0, propositions: repliServices(index, a, l),
      clarification: opts.length ? { options: opts } : null };
  }
  const proches = besoins.filter((x) => x.score >= b1.score * 0.8 && x.f.id !== b1.f.id).slice(0, 2);
  const conf = Math.min(1, b1.score / 10) * (b2 ? Math.min(1, 0.4 + (b1.score - b2.score) / b1.score) : 1);
  const comprehension = { besoin: choisir(b1.f.ref.titre, l), raisons: raisons(a, b1.f, b1.d) };
  if (proches.length) {
    return { niveau: 'moyenne', corrige, confiance: Math.round(conf * 100) / 100, comprehension,
      clarification: { options: [b1].concat(proches).map((x) => ({ id: x.f.id, libelle: choisir(x.f.ref.titre, l) })) } };
  }
  return { niveau: b1.score >= 7 ? 'haute' : 'moyenne', corrige, confiance: Math.round(conf * 100) / 100, comprehension,
    reponse: detailBesoin(index, b1.f.ref, l, associations),
    autres: besoins.slice(1, 3).filter((x) => x.score >= SEUIL_BESOIN).map((x) => ({ id: x.f.id, libelle: choisir(x.f.ref.titre, l) })) };
}

function reponseService(index, id, l, rs, associations) {
  const svc = infoService(index, id, l);
  const actions = [];
  if (svc.etat.code === 'desactive') actions.push({ code: 'ecrire', lien: `demande.html?type=contact&service=${enc(id)}` });
  else actions.push({ code: 'commencer', lien: `demande.html?type=demarche&service=${enc(id)}` });
  if (svc.rdv && svc.etat.code !== 'desactive') actions.push({ code: 'rdv', lien: 'rendez-vous.html?service=' + enc(id) });
  if (svc.tel) actions.push({ code: 'appeler', tel: svc.tel });
  actions.push({ code: 'voirService', lien: 'services.html#' + enc(id) });
  return { niveau: 'moyenne', confiance: 0.5, comprehension: { besoin: svc.nom, raisons: rs || [] },
    reponse: { id: 'service:' + id, type: 'service', titre: svc.nom, service: svc, etapes: choisir(B.ETAPES.contact, l), documents: [], clair: 'service:' + id, actions: actions.slice(0, 4),
      associations: associations.filter((a) => (a.services || []).includes(id)).map((a) => infoAssociation(a, l)).sort((x, y) => y.ouverte - x.ouverte).slice(0, 2),
      prefill: { type: 'contact', service: id, categorie: '', nature: '' } } };
}

// F92 : 1 à 3 services les plus probables, avec la raison et de quoi pré-remplir le formulaire
function suggerer(index, { message, langue } = {}) {
  const l = langueOk(langue);
  const { a, besoins, services } = besoinsClasses(index, String(message || '').slice(0, 600));
  const out = [];
  const vus = new Set();
  const top = Math.max(besoins[0] ? besoins[0].score : 0, services[0] ? services[0].score : 0);
  for (const x of besoins) {
    if (out.length >= 3 || x.score < Math.max(2.2, top * 0.4)) break;
    const b = x.f.ref;
    if (b.type === 'info' || b.type === 'urgence') continue;
    const cle = (b.service || '') + '|' + (b.categorie || b.nature || b.id);
    if (vus.has(cle)) continue;
    vus.add(cle);
    const d = detailBesoin(index, b, l, []);
    out.push({ id: b.id, titre: d.titre, service: d.service, raisons: raisons(a, x.f, x.d), prefill: d.prefill, score: Math.round(x.score * 10) / 10 });
  }
  if (!out.length) for (const x of services.slice(0, 2)) if (x.score >= 2) {
    const s = infoService(index, x.f.id, l);
    out.push({ id: 'service:' + x.f.id, titre: s.nom, service: s, raisons: raisons(a, x.f, x.d), prefill: { type: 'contact', service: x.f.id, categorie: '', nature: '' }, score: Math.round(x.score * 10) / 10 });
  }
  return { suggestions: out, corrige: a.corrections.length ? a.corrigeAffiche : null };
}

const cibles = () => B.BESOINS.map((b) => ({ id: b.id, titre: b.titre.fr, service: b.service }));

module.exports = { construire, analyser, rechercher, repondre, suggerer, cibles, classer, langueOk };
