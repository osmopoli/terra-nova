/* Terra Nova — vague 18 : orientation des habitants et langage clair.
   D10 (Mairie)        GET  /api/recherche?q=&langue=      recherche globale tolérante (fautes, synonymes, autres langues), résultats groupés,
                                                            « Vouliez-vous dire… », jamais d'impasse ; mémorisée, jamais délestée (src/charge.js).
   F91 (Haut Conseil)  POST /api/orientation               assistant d'orientation : besoin compris, service compétent, étapes, documents,
                                                            où et quand, boutons d'action ; une question de précision si besoin ; urgence d'abord.
   F92 (Citoyenne)     POST /api/orientation/suggestions   1 à 3 services probables avec « parce que vous parlez de… » (demande.html).
   Agents              GET  /api/orientation/questions     questions sans réponse (anonymes, agrégées) ; « associer à un service » enrichit
                                                            les expressions du moteur (collection orientationSynonymes).
   F89 (Inclusion)     GET  /api/langage-clair[/:id]       versions en langage clair ; PUT par un agent / admin, refusée (422) si un élément
                                                            obligatoire du texte officiel (date, délai, montant, référence, document) a disparu.
   F90 (Citoyen)       POST /api/explications              compteur anonyme des passages expliqués ; GET /api/explications/stats (agents).
   Rien de personnel n'est conservé : la conversation reste dans le navigateur ; les questions gardées pour les agents sont
   normalisées et anonymisées (seuls les mots connus du moteur restent, le reste devient « … »), sans compte, sans adresse IP.
   Les tables anonymes sont plafonnées (PLAFOND lignes) et ces routes publiques ont une règle de débit (« recherche », src/bouclier.js). */
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, audit, maintenant, uid } = require('../donnees');
const M = require('../orientation/moteur');
const K = require('../orientation/clair');
const T = require('../orientation/texte');
const { detecter } = require('./urgences');

db.exec(`
CREATE TABLE IF NOT EXISTS orientation_questions (cle TEXT PRIMARY KEY, texte TEXT NOT NULL, langue TEXT, source TEXT, n INTEGER NOT NULL,
  premier TEXT, dernier TEXT, statut TEXT NOT NULL DEFAULT 'ouverte', cible TEXT, par TEXT, traite TEXT);
CREATE TABLE IF NOT EXISTS explications_stats (cle TEXT PRIMARY KEY, page TEXT, type TEXT, extrait TEXT, n INTEGER NOT NULL, dernier TEXT);
`);
const PLAFOND = 5000;   // lignes au plus par table anonyme : au-delà, on n'incrémente plus que les lignes existantes
const q = {
  noter: db.prepare(`INSERT INTO orientation_questions (cle, texte, langue, source, n, premier, dernier) VALUES (?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(cle) DO UPDATE SET n = n + 1, dernier = excluded.dernier, statut = CASE WHEN statut = 'ignoree' THEN 'ignoree' ELSE statut END`),
  revoir: db.prepare('UPDATE orientation_questions SET n = n + 1, dernier = ? WHERE cle = ?'),
  ouvertes: db.prepare("SELECT COUNT(*) n FROM orientation_questions WHERE statut = 'ouverte'"),
  liste: db.prepare('SELECT * FROM orientation_questions WHERE statut = ? ORDER BY n DESC, dernier DESC LIMIT 200'),
  une: db.prepare('SELECT * FROM orientation_questions WHERE cle = ?'),
  traiter: db.prepare('UPDATE orientation_questions SET statut = ?, cible = ?, par = ?, traite = ? WHERE cle = ?'),
  compter: db.prepare('SELECT statut, COUNT(*) n, SUM(n) total FROM orientation_questions GROUP BY statut'),
  expl: db.prepare(`INSERT INTO explications_stats (cle, page, type, extrait, n, dernier) VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(cle) DO UPDATE SET n = n + 1, dernier = excluded.dernier`),
  explRevoir: db.prepare('UPDATE explications_stats SET n = n + 1, dernier = ? WHERE cle = ?'),
  explCompte: db.prepare('SELECT COUNT(*) n FROM explications_stats'),
  explListe: db.prepare('SELECT * FROM explications_stats ORDER BY n DESC, dernier DESC LIMIT 100')
};

const erreur = (res, code, msg, extra) => res.status(code).json(Object.assign({ erreur: msg }, extra || {}));
const texte = (v, max) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max);
const langueDe = (req) => M.langueOk(String((req.query && (req.query.langue || req.query.lang)) || (req.body && req.body.langue) || 'fr'));
const personnel = A.exigerRole('agent', 'admin');

/* ---------- Index du moteur : reconstruit au plus toutes les 30 s si les données ont changé, tout de suite après un ajout d'expression ---------- */
let index = null, versionDocs = -1, construitA = 0, generation = 0, forcer = true;
function indexCourant() {
  const v = docs.version();
  if (!index || forcer || (v !== versionDocs && Date.now() - construitA > 30000)) {
    index = M.construire({ services: docs.tous('services'), annonces: docs.tous('annonces').filter((a) => a.active !== false), associations: docs.tous('associations'), synonymes: docs.tous('orientationSynonymes') });
    versionDocs = v; construitA = Date.now(); generation++; forcer = false; cache.clear(); pistes.clear();
  }
  return index;
}

/* ---------- Mémoïsation des recherches (même phrase normalisée, même langue) ---------- */
const cache = new Map();
const CACHE_MAX = 500, CACHE_TTL = 60000;
function memoriser(cle, calcul) {
  const e = cache.get(cle);
  if (e && e.g === generation && Date.now() - e.t < CACHE_TTL) { cache.delete(cle); cache.set(cle, e); return { v: e.v, hit: true }; }
  const v = calcul();
  cache.set(cle, { v, t: Date.now(), g: generation });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return { v, hit: false };
}

// Question restée sans réponse : agrégée et anonymisée (seuls les mots connus du moteur restent ; aucun compte, aucune adresse IP) ;
// une question déjà vue est comptée une fois de plus, une nouvelle n'est gardée que sous le plafond
function noterSansReponse(phrase, langue, source) {
  const t = M.anonymiser(indexCourant(), phrase);
  if (t.length < 3 || T.motsUtiles(t).length < 1) return;
  try {
    if (q.revoir.run(maintenant(), t).changes) return;
    if (q.ouvertes.get().n >= PLAFOND) return;
    q.noter.run(t, t, langue, source, maintenant(), maintenant());
  } catch (e) { console.error('[orientation] statistiques', e.message); }
}
// Piste proposée à l'agent pour une question (calculée une fois par question et par génération de l'index)
const pistes = new Map();
function pisteDe(idx, texteQuestion) {
  if (pistes.has(texteQuestion)) return pistes.get(texteQuestion);
  const r = M.suggerer(idx, { message: texteQuestion, langue: 'fr' });
  const p = r.suggestions[0] ? { id: r.suggestions[0].id, titre: r.suggestions[0].titre } : null;
  if (pistes.size >= 1000) pistes.delete(pistes.keys().next().value);
  pistes.set(texteQuestion, p);
  return p;
}
const urgent = (phrase) => { try { return detecter({ objet: '', message: String(phrase || '') }).urgent; } catch { return false; } };

/* ---------- D10 : recherche globale ---------- */
router.get('/api/recherche', (req, res) => {
  const phrase = texte(req.query.q, 200);
  const l = langueDe(req);
  const idx = indexCourant();
  if (!phrase) return res.json({ q: '', langue: l, total: 0, groupes: { services: [], demarches: [], reponses: [], annonces: [], associations: [] }, repli: { services: M.rechercher(idx, '', l).repli.services } });
  const { v, hit } = memoriser(`r|${l}|${T.normaliser(phrase)}`, () => {
    const r = M.rechercher(idx, phrase, l, { associations: docs.tous('associations') });
    r.urgence = urgent(phrase) || r.concepts.includes('urgence');
    return r;
  });
  res.set('X-Cache', hit ? 'HIT' : 'MISS');
  if (!hit && !v.total) noterSansReponse(phrase, l, 'recherche');
  res.json(Object.assign({}, v, { q: phrase }));
});

/* ---------- F91 : assistant d'orientation ---------- */
router.post('/api/orientation', (req, res) => {
  const b = req.body || {};
  const message = texte(b.message, 600);
  const choix = texte(b.choix, 60);
  const precedent = texte(b.precedent, 300);
  const l = langueDe(req);
  if (!message && !choix) return erreur(res, 400, 'Écrivez votre question en quelques mots.');
  const idx = indexCourant();
  const pasUrgent = b.pasUrgent === true;   // l'habitant a confirmé que ce n'est pas une urgence vitale
  const estUrgent = !choix && !pasUrgent && urgent(message + ' ' + precedent);
  const r = M.repondre(idx, { message, langue: l, choix, precedent, associations: docs.tous('associations'), urgent: estUrgent, pasUrgent });
  if (!choix && (r.incompris || r.niveau === 'basse')) noterSansReponse(message, l, 'assistant');
  // « En bref » : la version en langage clair (F89) de la démarche ou du service, dans la langue de l'habitant
  if (r.reponse && r.reponse.clair) {
    const c = docs.get('langageClair', r.reponse.clair);
    const v = c && c.clair && (c.clair[l] || c.clair.fr);
    if (v) r.reponse.enBref = { resume: v.resume || '', quand: v.quand || '', combien: v.combien || '' };
  }
  res.json(r);
});
// « Cette réponse ne m'aide pas » : la question rejoint, anonymisée, la liste des questions sans réponse des agents
router.post('/api/orientation/avis', (req, res) => {
  const message = texte((req.body || {}).message, 600);
  if (message) noterSansReponse(message, langueDe(req), 'pas-utile');
  res.json({ ok: true });
});

/* ---------- F92 : suggestions de service pour le formulaire de demande ---------- */
router.post('/api/orientation/suggestions', (req, res) => {
  const message = texte((req.body || {}).message, 600);
  const l = langueDe(req);
  if (T.motsUtiles(message).length < 1) return erreur(res, 400, 'Décrivez votre besoin en quelques mots.');
  const r = M.suggerer(indexCourant(), { message, langue: l });
  r.urgence = urgent(message);
  if (!r.suggestions.length) noterSansReponse(message, l, 'demande');
  res.json(r);
});

/* ---------- Agents : questions sans réponse → associer à un service ou à une démarche ---------- */
const cibleValide = (c) => M.cibles().some((x) => x.id === c) || (String(c).startsWith('service:') && !!docs.get('services', String(c).slice(8)));
router.get('/api/orientation/questions', personnel, (req, res) => {
  const statut = ['ouverte', 'associee', 'ignoree'].includes(req.query.statut) ? req.query.statut : 'ouverte';
  const idx = indexCourant();
  const lignes = q.liste.all(statut).map((x) => Object.assign({}, x, { piste: pisteDe(idx, x.texte) }));
  const compte = Object.fromEntries(q.compter.all().map((x) => [x.statut, { questions: x.n, fois: x.total }]));
  res.json({ statut, questions: lignes, compte,
    cibles: M.cibles().concat(docs.tous('services').map((s) => ({ id: 'service:' + s.id, titre: 'Service : ' + (s.nom && s.nom.fr), service: s.id }))),
    synonymes: docs.tous('orientationSynonymes').sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 100) });
});
router.post('/api/orientation/questions/associer', personnel, (req, res) => {
  const b = req.body || {};
  const ligne = q.une.get(texte(b.cle, 120));
  if (!ligne) return erreur(res, 404, 'Question introuvable.');
  const cible = texte(b.cible, 80);
  if (!cibleValide(cible)) return erreur(res, 400, 'Choisissez le service ou la démarche à associer.');
  const expression = T.normaliser(texte(b.expression, 120) || ligne.texte);
  if (T.motsUtiles(expression).length < 1) return erreur(res, 400, 'L’expression à retenir est vide.');
  const par = `${req.user.prenom} ${req.user.nom}`;
  const syn = docs.put('orientationSynonymes', { id: uid('syn'), expression, cible, question: ligne.cle, par, date: maintenant() });
  q.traiter.run('associee', cible, par, maintenant(), ligne.cle);
  forcer = true;
  audit(req.user, { categorie: 'service', action: 'Expression ajoutée à l’assistant d’orientation', objetId: cible, objetLibelle: cible, avant: null, apres: expression, motif: `Question sans réponse posée ${ligne.n} fois` });
  res.json({ ok: true, synonyme: syn });
});
router.post('/api/orientation/questions/ignorer', personnel, (req, res) => {
  const ligne = q.une.get(texte((req.body || {}).cle, 120));
  if (!ligne) return erreur(res, 404, 'Question introuvable.');
  q.traiter.run('ignoree', null, `${req.user.prenom} ${req.user.nom}`, maintenant(), ligne.cle);
  res.json({ ok: true });
});
router.delete('/api/orientation/synonymes/:id', personnel, (req, res) => {
  const s = docs.get('orientationSynonymes', req.params.id);
  if (!s) return erreur(res, 404, 'Expression introuvable.');
  docs.suppr('orientationSynonymes', s.id);
  forcer = true;
  audit(req.user, { categorie: 'service', action: 'Expression retirée de l’assistant d’orientation', objetId: s.cible, objetLibelle: s.cible, avant: s.expression, apres: null, motif: '' });
  res.json({ ok: true });
});

/* ---------- F89 : versions en langage clair ---------- */
const COL = 'langageClair';
const CHAMPS = ['resume', 'qui', 'quoi', 'quand', 'combien', 'documents', 'ou'];
// Qui a modifié (nom de l'agent, historique) : réservé au personnel ; la lecture publique n'en a pas besoin
const estPersonnel = (req) => !!req.user && ['agent', 'admin'].includes(req.user.role);
router.get('/api/langage-clair', (req, res) => {
  const staff = estPersonnel(req);
  res.json(docs.tous(COL).map((c) => Object.assign({ id: c.id, titre: c.titre, langues: Object.keys(c.clair || {}), maj: c.maj, version: c.version || 1 }, staff ? { majPar: c.majPar } : {})));
});
router.get('/api/langage-clair/:id', (req, res) => {
  const c = docs.get(COL, req.params.id);
  if (!c) return erreur(res, 404, 'Contenu introuvable.');
  if (estPersonnel(req)) return res.json(c);
  const publique = Object.assign({}, c);
  delete publique.majPar; delete publique.historique;
  res.json(publique);
});
function lireClair(b) {
  const c = {};
  for (const k of CHAMPS) { const v = texte(b && b[k], 600); if (v) c[k] = v; }
  const p = Array.isArray(b && b.paragraphes) ? b.paragraphes.slice(0, 12).map((x) => texte(x, 900)).filter(Boolean) : [];   // seuls les paragraphes textuels non vides
  if (p.length) c.paragraphes = p;
  return c;
}
router.post('/api/langage-clair/:id/verifier', personnel, (req, res) => {
  const c = docs.get(COL, req.params.id);
  if (!c) return erreur(res, 404, 'Contenu introuvable.');
  const l = M.langueOk((req.body || {}).langue);
  res.json(K.verifier((c.officiel || {})[l] || (c.officiel || {}).fr, lireClair((req.body || {}).clair), l));
});
router.put('/api/langage-clair/:id', personnel, (req, res) => {
  const c = docs.get(COL, req.params.id);
  if (!c) return erreur(res, 404, 'Contenu introuvable.');
  const b = req.body || {};
  const l = M.langueOk(b.langue);
  const clair = lireClair(b.clair);
  if (!clair.resume) return erreur(res, 400, 'Le résumé en une ou deux phrases est obligatoire.');
  const officiel = (c.officiel || {})[l] || (c.officiel || {}).fr;
  const v = K.verifier(officiel, clair, l);
  if (!v.ok) return erreur(res, 422, 'Des éléments importants du texte officiel manquent dans la version claire : ' + v.manquants.map((m) => m.valeur).join(', ') + '.', { manquants: v.manquants, requis: v.requis });
  const avant = K.texteClair((c.clair || {})[l]).slice(0, 300);
  const par = `${req.user.prenom} ${req.user.nom}`;
  const historique = (c.historique || []).concat({ date: maintenant(), par, langue: l, motif: texte(b.motif, 200) }).slice(-30);
  const maj = docs.patch(COL, c.id, { clair: Object.assign({}, c.clair, { [l]: clair }), maj: maintenant(), majPar: par, version: (c.version || 1) + 1, historique });
  audit(req.user, { categorie: 'service', action: 'Version en langage clair modifiée', objetId: c.id, objetLibelle: (c.titre && c.titre.fr) || c.id, avant, apres: K.texteClair(clair).slice(0, 300), motif: texte(b.motif, 200) || `Langue : ${l}` });
  res.json(maj);
});

/* ---------- F90 : passages qu'on demande souvent à expliquer (anonyme) ---------- */
const CLE_OK = /^[\w:.#-]{1,100}$/;
router.post('/api/explications', (req, res) => {
  const b = req.body || {};
  const cle = texte(b.cle, 100), page = texte(b.page, 40).replace(/[^\w.-]/g, ''), type = ['paragraphe', 'selection', 'terme'].includes(b.type) ? b.type : 'paragraphe';
  if (!CLE_OK.test(cle)) return erreur(res, 400, 'Passage inconnu.');
  // l'extrait n'est gardé que pour un passage administratif publié (pas pour une sélection libre, qui pourrait contenir des données personnelles)
  const extrait = type === 'selection' ? texte(b.termes, 120) : texte(b.extrait, 140);
  try {
    if (!q.explRevoir.run(maintenant(), `${page}|${cle}`).changes && q.explCompte.get().n < PLAFOND) q.expl.run(`${page}|${cle}`, page, type, extrait, maintenant());
  } catch (e) { console.error('[orientation] explications', e.message); }
  res.json({ ok: true });
});
router.get('/api/explications/stats', personnel, (req, res) => res.json(q.explListe.all()));

/* ---------- Contenus de démonstration : ajoutés une seule fois, jamais écrasés (base déjà en service comprise) ---------- */
function semer() {
  try {
    let ajout = 0;
    for (const c of K.CONTENUS) {
      const ex = docs.get(COL, c.id);
      if (!ex) { docs.put(COL, Object.assign({}, c, { version: 1, maj: maintenant(), majPar: 'Contenu initial (vague 18)', historique: [] })); ajout++; continue; }
      // langue ajoutée depuis : complétée sans toucher aux versions modifiées par les agents
      const manque = Object.keys(c.clair).filter((l) => !(ex.clair || {})[l]);
      const manqueOff = Object.keys(c.officiel).filter((l) => !(ex.officiel || {})[l]);
      if (manque.length || manqueOff.length) {
        docs.patch(COL, c.id, { clair: Object.assign({}, Object.fromEntries(manque.map((l) => [l, c.clair[l]])), ex.clair), officiel: Object.assign({}, Object.fromEntries(manqueOff.map((l) => [l, c.officiel[l]])), ex.officiel) });
        ajout++;
      }
    }
    if (ajout) console.log(`[demo] vague 18 : ${ajout} contenu(s) en langage clair ajouté(s) ou complété(s)`);
    return ajout;
  } catch (e) { console.error('[demo] vague 18', e.message); return 0; }
}

module.exports = router;
module.exports.semer = semer;
