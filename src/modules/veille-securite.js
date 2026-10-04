/* Terra Nova — vague 20 (F100, Direction du Numérique) : « Derniers événements de sécurité » pour le suivi quotidien des agents.
   Une seule frise qui rassemble, en phrases simples : tentatives bloquées par le bouclier (F69, F81), incidents et activité
   inhabituelle (F85), comptes verrouillés et tentatives sur un compte verrouillé (F37), nouveaux appareils (F54), accès aux
   données réservées par un agent habilité (F70), clés d'accès suspectes, sessions fermées, contrôles d'intégrité.
   Chaque événement : gravité, phrase claire, partie concernée, statut nouveau / vu / traité, lien vers le détail.
   - « vu » est propre à chaque agent ; « traité » est partagé (avec une note), un incident résolu est traité d'office ;
   - données minimisées pour les agents : adresse IP réduite (203.0.x.x), e-mails masqués (l•••@nova.test), noms des
     habitants et des autres agents remplacés ; l'administrateur voit le détail complet (et le Centre de sécurité) ;
   - accès réservé au personnel (agent, admin), contrôlé ici ; citoyen : 403. */
const router = require('express').Router();
const db = require('../db');
const A = require('../auth');
const { docs, audit, maintenant } = require('../donnees');

db.exec('CREATE TABLE IF NOT EXISTS securite_suivi (evt TEXT NOT NULL, user_id TEXT NOT NULL, statut TEXT NOT NULL, date TEXT NOT NULL, par TEXT NOT NULL DEFAULT \'\', note TEXT NOT NULL DEFAULT \'\', PRIMARY KEY (evt, user_id));');
const q = {
  lire: db.prepare('SELECT evt, user_id, statut, date, par, note FROM securite_suivi WHERE user_id = ? OR user_id = \'*\''),
  ecrire: db.prepare('INSERT INTO securite_suivi (evt, user_id, statut, date, par, note) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(evt, user_id) DO UPDATE SET statut = excluded.statut, date = excluded.date, par = excluded.par, note = excluded.note')
};

const GRAVITES = ['info', 'faible', 'moyenne', 'haute', 'critique'];
const TYPES = ['blocage', 'incident', 'verrouillage', 'appareil', 'habilitation', 'compte', 'integrite'];
const PERIODES = { '24h': 864e5, '7j': 7 * 864e5, '30j': 30 * 864e5 };
const masquerEmail = (e) => { const [l, d] = String(e || '').split('@'); return d ? `${l.slice(0, 1)}•••@${d}` : ''; };
const masquerTextes = (s) => String(s || '').replace(/([\w.+-])[\w.+-]*@([\w-]+\.[\w.-]+)/g, '$1•••@$2').replace(/\b(\d{1,3})\.(\d{1,3})\.\d{1,3}\.(\d{1,3}|x)\b/g, '$1.$2.x.x');
const ipAgent = (ip) => String(ip || '').replace(/^(\d{1,3}\.\d{1,3})\.\d{1,3}\.(x|\d{1,3})$/, '$1.x.x').replace(/^([0-9a-f]{1,4}:[0-9a-f]{1,4}):.*$/i, '$1:…');
const partieDeChemin = (c) => (/^\/api\/(docs\/demandes|demandes)/.test(c) ? 'demandes' : /^\/api\/auth|connexion/.test(c) ? 'connexion' : /^\/api\/(docs\/utilisateurs|habilitations|accueil)/.test(c) ? 'comptes'
  : /^\/api\/(sensible|exports)/.test(c) ? 'donnees' : /^\/api\/(idees|consultations|avis)/.test(c) ? 'participation' : /^\/api\/(sauvegardes|integrite)/.test(c) ? 'sauvegardes' : 'plateforme');

/* ---------- Collecte des événements (brut, avant minimisation) ---------- */
function collecter(depuis) {
  const l = [];
  const apres = (d) => Date.parse(d) >= depuis;
  const B = { csrf: ['moyenne', 'Requête venue d’un autre site bloquée (protection contre la falsification)'], debit: ['faible', 'Trop de tentatives en peu de temps : envois ralentis'],
    validation: ['faible', 'Données refusées : format inattendu'], acces: ['moyenne', 'Accès refusé à une partie réservée (règles de rôle)'], robot: ['faible', 'Envoi automatique (robot) bloqué sur un formulaire'] };
  for (const b of docs.tous('bouclier')) {
    if (!apres(b.date)) continue;
    const [g, phrase] = B[b.type] || ['faible', 'Tentative bloquée par le bouclier'];
    l.push({ id: 'blq:' + b.id, date: b.date, type: 'blocage', gravite: g, phrase, partie: partieDeChemin(b.chemin), compte: b.compte || '', ip: b.ip || '', detail: `${b.methode || ''} ${b.chemin || ''}`.trim(), lien: 'agent-securite.html#t-blocages', source: b.type });
  }
  for (const i of docs.tous('incidents')) {
    const der = (i.evenements || []).slice(-1)[0];
    if (!apres(i.maj || i.cree)) continue;
    l.push({ id: 'inc:' + i.id, date: i.maj || i.cree, type: 'incident', gravite: i.gravite || 'moyenne', phrase: `Incident ${i.id} : ${i.titre}`, partie: ((i.parties || [])[0] || 'plateforme').toLowerCase(),
      detail: der ? der.texte : '', compte: '', ip: '', lien: 'agent-securite.html#incidents', traiteAuto: i.statut === 'resolu', traiteNote: i.note || '', source: 'incident' });
  }
  const J = {
    verrouillage: ['verrouillage', 'haute', 'Compte verrouillé après plusieurs mots de passe incorrects', 'connexion'], tentative_bloquee: ['verrouillage', 'moyenne', 'Nouvelle tentative de connexion sur un compte verrouillé', 'connexion'],
    nouvel_appareil: ['appareil', 'info', 'Connexion depuis un nouvel appareil (l’habitant a été prévenu)', 'connexion'], acces_sensible_refuse: ['habilitation', 'moyenne', 'Consultation de données réservées refusée (agent non habilité)', 'donnees'],
    cle_suspecte: ['compte', 'haute', 'Clé d’accès suspecte refusée', 'connexion'], sessions_revoquees: ['compte', 'moyenne', 'Toutes les sessions d’un compte ont été fermées', 'connexion'],
    activite_contestee: ['compte', 'haute', 'Un habitant indique « Ce n’était pas moi » : autres sessions fermées', 'connexion'], habilitation_accordee: ['habilitation', 'info', 'Habilitation aux données réservées accordée à un agent', 'comptes'],
    habilitation_retiree: ['habilitation', 'info', 'Habilitation aux données réservées retirée à un agent', 'comptes'], deblocage: ['verrouillage', 'info', 'Compte débloqué par un agent', 'comptes']
  };
  for (const j of docs.tous('journal')) {
    const m = J[j.type]; if (!m || !apres(j.date)) continue;
    l.push({ id: 'jrn:' + j.id, date: j.date, type: m[0], gravite: m[1], phrase: m[2], partie: m[3], compte: j.email || '', ip: '', detail: j.detail || '', lien: m[0] === 'verrouillage' ? 'admin-comptes.html' : 'agent-journal.html', source: j.type });
  }
  for (const a of docs.tous('acces_sensibles')) {
    if (!apres(a.date)) continue;
    l.push({ id: 'acs:' + a.id, date: a.date, type: 'habilitation', gravite: 'info', phrase: 'Consultation de données réservées par un agent habilité', partie: 'donnees', agentId: a.agentId, agentNom: a.agentNom, cible: a.cibleNom,
      detail: `Champs : ${(a.champs || []).join(', ')} · motif : ${a.motif}${a.precision ? ' (' + a.precision + ')' : ''}`, compte: '', ip: '', lien: 'agent-journal.html', source: 'acces_sensible' });
  }
  for (const c of docs.tous('integrite')) {
    if (!apres(c.date) || (!c.total && c.chaine && c.chaine.intacte !== false)) continue;
    const grave = c.chaine && c.chaine.intacte === false ? 'critique' : (c.parGravite || {}).critique ? 'critique' : (c.parGravite || {}).haute ? 'haute' : 'faible';
    l.push({ id: 'ctl:' + c.id, date: c.date, type: 'integrite', gravite: grave, phrase: c.chaine && c.chaine.intacte === false ? 'Registre d’audit altéré : à vérifier tout de suite' : `Contrôle d’intégrité : ${c.total} incohérence(s) trouvée(s)`,
      partie: 'donnees', detail: `${c.reparables || 0} réparation(s) sûre(s) proposée(s)`, compte: '', ip: '', lien: 'agent-securite.html#integrite', source: 'integrite' });
  }
  return l.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* ---------- Ce que voit un agent (minimisé) ou l'administrateur (complet) ---------- */
function pourProfil(e, u, suivi) {
  const adminVue = u.role === 'admin';
  const s = suivi.get(e.id + '|*') || null, vu = suivi.get(e.id + '|' + u.id) || null;
  const statut = e.traiteAuto || (s && s.statut === 'traite') ? 'traite' : vu ? 'vu' : 'nouveau';
  const v = { id: e.id, date: e.date, type: e.type, gravite: e.gravite, phrase: e.phrase, partie: e.partie, statut, source: e.source,
    lien: adminVue || !/^agent-securite/.test(e.lien) ? e.lien : 'agent-evenements.html#' + encodeURIComponent(e.id),
    traitement: e.traiteAuto ? { par: 'Centre de sécurité', note: e.traiteNote || 'Incident résolu' } : s ? { par: s.par, le: s.date, note: s.note } : null };
  if (adminVue) return Object.assign(v, { compte: e.compte, ip: e.ip, detail: e.detail, agent: e.agentNom || '', cible: e.cible || '' });
  const moi = e.agentId && e.agentId === u.id;
  const sansNoms = ['acces_sensible_refuse', 'habilitation_accordee', 'habilitation_retiree', 'deblocage', 'activite_contestee', 'sessions_revoquees'].includes(e.source);
  return Object.assign(v, { compte: masquerEmail(e.compte), ip: ipAgent(e.ip), detail: sansNoms ? '' : moi ? masquerTextes(e.detail) : masquerTextes(e.detail).replace(/\b(Champs : [^·]+)·.*$/, '$1').trim(),
    phrase: masquerTextes(e.phrase).replace(/·\s*[^·(]+\(([^)]*)\)/, '· compte $1'), agent: e.agentNom ? (moi ? `${u.prenom} ${u.nom} (vous)` : 'un agent habilité') : '', cible: e.cible ? 'un habitant' : '', minimise: true });
}
function liste(u, f) {
  const depuis = Date.now() - (PERIODES[f.periode] || PERIODES['7j']);
  const suivi = new Map(q.lire.all(u.id).map((r) => [r.evt + '|' + r.user_id, r]));
  let l = collecter(depuis).map((e) => pourProfil(e, u, suivi));
  const tous = l;
  if (f.gravite) { const min = GRAVITES.indexOf(f.gravite); l = l.filter((e) => GRAVITES.indexOf(e.gravite) >= min); }
  if (f.type) l = l.filter((e) => e.type === f.type);
  if (f.statut) l = l.filter((e) => e.statut === f.statut);
  return { evenements: l.slice(0, 300), total: l.length, nonVus: tous.filter((e) => e.statut === 'nouveau').length,
    parGravite: GRAVITES.reduce((o, g) => ((o[g] = tous.filter((e) => e.gravite === g && e.statut !== 'traite').length), o), {}),
    minimise: u.role !== 'admin', gravites: GRAVITES, types: TYPES };
}
function nonVus(u) {
  const suivi = new Map(q.lire.all(u.id).map((r) => [r.evt + '|' + r.user_id, r]));
  const l = collecter(Date.now() - PERIODES['7j']).map((e) => pourProfil(e, u, suivi)).filter((e) => e.statut === 'nouveau');
  return { nonVus: l.length, graves: l.filter((e) => GRAVITES.indexOf(e.gravite) >= 3).length };
}

const personnel = A.exigerRole('agent', 'admin');
const lireFiltres = (req) => ({ periode: PERIODES[req.query.periode] ? req.query.periode : '7j', gravite: GRAVITES.includes(req.query.gravite) ? req.query.gravite : '', type: TYPES.includes(req.query.type) ? req.query.type : '',
  statut: ['nouveau', 'vu', 'traite'].includes(req.query.statut) ? req.query.statut : '' });
router.get('/api/veille-securite', personnel, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(liste(req.user, lireFiltres(req))); });
router.get('/api/veille-securite/compte', personnel, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(nonVus(req.user)); });
router.post('/api/veille-securite/vu', personnel, (req, res) => {
  const ids = Array.isArray((req.body || {}).ids) ? req.body.ids.map(String).filter((x) => /^[a-z]{3}:[\w-]{3,60}$/.test(x)).slice(0, 300) : [];
  const t = maintenant();
  for (const id of ids) q.ecrire.run(id, req.user.id, 'vu', t, `${req.user.prenom} ${req.user.nom}`, '');
  res.json({ ok: true, marques: ids.length, nonVus: nonVus(req.user).nonVus });
});
router.post('/api/veille-securite/traite', personnel, (req, res) => {
  const id = String((req.body || {}).id || '');
  if (!/^[a-z]{3}:[\w-]{3,60}$/.test(id)) return res.status(400).json({ erreur: 'Événement inconnu.' });
  const e = collecter(0).find((x) => x.id === id);
  if (!e) return res.status(404).json({ erreur: 'Événement introuvable.' });
  if (e.type === 'incident') return res.status(409).json({ erreur: 'Un incident se clôt dans le Centre de sécurité (administrateur), avec une note.' });
  const note = String((req.body || {}).note || '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, 300);
  if (note.length < 3) return res.status(400).json({ erreur: 'Indiquez en quelques mots ce qui a été fait.' });
  const t = maintenant(), par = `${req.user.prenom} ${req.user.nom}`;
  q.ecrire.run(id, '*', 'traite', t, par, note);
  q.ecrire.run(id, req.user.id, 'vu', t, par, '');
  audit(req.user, { categorie: 'securite', action: 'Événement de sécurité marqué traité', objetId: id, objetLibelle: masquerTextes(e.phrase).slice(0, 120), avant: 'à traiter', apres: 'traité', motif: note });
  res.json({ ok: true, nonVus: nonVus(req.user).nonVus });
});

/* ---------- Événements de démonstration (une seule fois, repère seed: 'v20') ---------- */
function semer() {
  if (docs.tous('bouclier').some((b) => b.seed === 'v20') || !docs.compte('services')) return false;
  const il = (min) => new Date(Date.now() - min * 60e3).toISOString();
  const B = [
    { type: 'csrf', methode: 'POST', chemin: '/api/docs/demandes', ip: '198.51.100.x', compte: '', detail: 'Origin: https://exemple-malveillant.test', date: il(38) },
    { type: 'robot', methode: 'POST', chemin: '/api/docs/demandes', ip: '203.0.113.x', compte: '', detail: 'champ piège rempli', date: il(95) },
    { type: 'acces', methode: 'GET', chemin: '/api/indicateurs', ip: '192.0.2.x', compte: 'marc@nova.test', detail: 'accès refusé par les règles de rôle', date: il(260) },
    { type: 'debit', methode: 'POST', chemin: '/api/auth/connecter', ip: '203.0.113.x', compte: '', detail: 'règle « connexion » (20 en 1 min)', date: il(26 * 60) }
  ];
  B.forEach((b, i) => docs.put('bouclier', Object.assign({ id: 'blq-v20-' + i, seed: 'v20' }, b)));
  const J = [
    { type: 'verrouillage', email: 'jean@nova.test', detail: '5 min (203.0.113.x)', date: il(72) },
    { type: 'nouvel_appareil', email: 'amina@nova.test', detail: 'Firefox sur Android', date: il(180) },
    { type: 'tentative_bloquee', email: 'jean@nova.test', detail: '203.0.113.x', date: il(70) },
    { type: 'acces_sensible_refuse', email: 'agent@nova.test', detail: 'Léa Martin (non habilité)', date: il(30 * 60) }
  ];
  J.forEach((j, i) => docs.put('journal', Object.assign({ id: 'evt-v20-' + i, seed: 'v20' }, j)));
  return true;
}

module.exports = router;
Object.assign(module.exports, { nonVus, semer, collecter });
