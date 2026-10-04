/* Terra Nova — vague 20 (F98, Haut Conseil) : quels services sont les plus utilisés ?
   Mesure anonyme et agrégée, côté serveur : uniquement des compteurs (jour, heure, quartier, service, événement), jamais
   de compte, d'adresse IP, de cookie ni d'identifiant. Événements comptés :
   - consultation d'un service (fiche ouverte), étapes d'une démarche (service choisi, type de démarche, informations et pièces) ;
   - démarches terminées, demandes déposées par service (contact, signalement, démarche), rendez-vous pris : comptés par le
     serveur au moment de l'enregistrement ;
   - recherches et réponses de l'assistant d'orientation qui mènent à un service.
   Une même consultation répétée par le même appareil dans les 30 minutes n'est comptée qu'une fois (mémoire du serveur,
   effacée au fil de l'eau, rien n'est écrit). Page agents « Usage des services » (agent-usage.html) : classement avec
   tendance, quartiers, taux de démarches menées au bout, heures et jours de pointe, « ce qu'il faut retenir » et actions
   recommandées calculés automatiquement, export CSV (inscrit dans l'historique des exports F88). */
const router = require('express').Router();
const crypto = require('node:crypto');
const db = require('../db');
const A = require('../auth');
const { docs, audit, uid, maintenant } = require('../donnees');

db.exec(`CREATE TABLE IF NOT EXISTS usage_compteurs (
  jour TEXT NOT NULL, heure INTEGER NOT NULL, quartier TEXT NOT NULL, service TEXT NOT NULL, evenement TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', n INTEGER NOT NULL,
  PRIMARY KEY (jour, heure, quartier, service, evenement, detail));
CREATE INDEX IF NOT EXISTS usage_jour ON usage_compteurs(jour);`);
const qAjout = db.prepare('INSERT INTO usage_compteurs (jour, heure, quartier, service, evenement, detail, n) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(jour, heure, quartier, service, evenement, detail) DO UPDATE SET n = n + excluded.n');

const TZ = process.env.TZ_VILLE || 'Indian/Mayotte';
const QUARTIERS = ['Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
const EVENEMENTS = ['vue', 'etape', 'demarche_terminee', 'demande', 'rdv', 'recherche', 'orientation'];
const ETAPES = ['choix', 'nature', 'informations'];
const TYPES = ['contact', 'signalement', 'demarche'];
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false });
function ville(d) { const p = Object.fromEntries(fmt.formatToParts(d).filter((x) => x.type !== 'literal').map((x) => [x.type, x.value])); return { jour: `${p.year}-${p.month}-${p.day}`, heure: Number(p.hour) % 24 }; }
const serviceOk = (id) => !!(id && docs.get('services', String(id)));

/* ---------- Enregistrement : en mémoire, écrit en base toutes les 10 s (une transaction) ---------- */
const tampon = new Map();
function compter(evenement, service, quartier, detail, n) {
  if (!EVENEMENTS.includes(evenement) || !service) return;
  const { jour, heure } = ville(new Date());
  const q = QUARTIERS.includes(quartier) ? quartier : 'inconnu';
  const cle = [jour, heure, q, String(service).slice(0, 40), evenement, String(detail || '').slice(0, 20)].join('|');
  tampon.set(cle, (tampon.get(cle) || 0) + (n || 1));
  if (tampon.size > 5000) vider();
}
function vider() {
  if (!tampon.size) return;
  const lignes = [...tampon.entries()]; tampon.clear();
  try { db.exec('BEGIN'); for (const [k, n] of lignes) { const p = k.split('|'); qAjout.run(p[0], Number(p[1]), p[2], p[3], p[4], p[5], n); } db.exec('COMMIT'); }
  catch (e) { try { db.exec('ROLLBACK'); } catch { /* rien à annuler */ } console.error('[usage]', e.message); }
}
setInterval(vider, 10e3).unref();
process.once('beforeExit', vider);
const quartierDe = (req, d) => (d && QUARTIERS.includes(d.quartier) ? d.quartier : req.user && QUARTIERS.includes(req.user.quartier) ? req.user.quartier : 'inconnu');

/* ---------- Balise du navigateur : consultation d'un service, étape d'une démarche ---------- */
const vus = new Map();   // empreinte éphémère (IP + service + événement) → horodatage ; jamais écrite
const debit = new Map(); // IP → horodatages (au plus 60 balises par minute)
setInterval(() => { const lim = Date.now() - 30 * 60e3; for (const [k, t] of vus) if (t < lim) vus.delete(k); for (const [k, l] of debit) if (!l.length || l[l.length - 1] < Date.now() - 60e3) debit.delete(k); }, 5 * 60e3).unref();
const empreinte = (s) => crypto.createHash('sha256').update(s).digest('base64url').slice(0, 16);
const balise = require('express').Router();
balise.post('/api/usage', (req, res) => {
  const b = req.body || {};
  const ev = String(b.evenement || ''), service = String(b.service || '').slice(0, 40), etape = String(b.etape || '');
  if (!['vue', 'etape'].includes(ev) || !serviceOk(service) || (ev === 'etape' && !ETAPES.includes(etape))) return res.status(204).end();
  const l = (debit.get(req.ip) || []).filter((t) => t > Date.now() - 60e3);
  if (l.length >= 60) return res.status(204).end();
  l.push(Date.now()); debit.set(req.ip, l);
  const cle = empreinte(`${req.ip}|${req.user ? req.user.id : ''}|${service}|${ev}|${etape}`);
  if (vus.has(cle) && Date.now() - vus.get(cle) < 30 * 60e3) return res.status(204).end();
  vus.set(cle, Date.now());
  compter(ev, service, quartierDe(req), ev === 'etape' ? etape : '');
  res.status(204).end();
});
/* Recherche et assistant d'orientation qui mènent à un service (réponses de src/modules/orientation.js) */
balise.use((req, res, next) => {
  const recherche = req.method === 'GET' && req.path === '/api/recherche';
  const assistant = req.method === 'POST' && req.path === '/api/orientation';
  if (!recherche && !assistant) return next();
  const json = res.json.bind(res);
  res.json = (o) => {
    try {
      if (res.statusCode === 200 && o) {
        const m = recherche ? o.meilleur : null;
        const svc = recherche ? (m && (m.type === 'service' ? m.id : m.service)) || ((o.groupes && o.groupes.services && o.groupes.services[0]) || {}).id
          : (o.reponse && (o.reponse.service && (o.reponse.service.id || o.reponse.service))) || '';
        if (svc && typeof svc === 'string' && serviceOk(svc)) compter(recherche ? 'recherche' : 'orientation', svc, quartierDe(req));
      }
    } catch (e) { /* la mesure ne doit jamais gêner la réponse */ }
    return json(o);
  };
  next();
});
/* Demandes et rendez-vous enregistrés (POST /api/docs/demandes, /api/docs/rdv) : comptés par le serveur */
function apresEcriture(req, res, next) {
  if (req.method !== 'POST' || !/^\/api\/docs\/(demandes|rdv)$/.test(req.path)) return next();
  const col = req.path.endsWith('rdv') ? 'rdv' : 'demandes';
  const json = res.json.bind(res);
  res.json = (o) => {
    try {
      if (res.statusCode === 200 && o) for (const d of Array.isArray(o) ? o : [o]) {
        if (!d || !d.serviceId || !serviceOk(d.serviceId)) continue;
        if (col === 'rdv') compter('rdv', d.serviceId, quartierDe(req, d));
        else {
          compter('demande', d.serviceId, quartierDe(req, d), TYPES.includes(d.type) ? d.type : 'contact');
          if (d.type === 'demarche') compter('demarche_terminee', d.serviceId, quartierDe(req, d));
        }
      }
    } catch (e) { /* idem */ }
    return json(o);
  };
  next();
}

/* ---------- Rapport ---------- */
const jourIso = (t) => ville(new Date(t)).jour;
// Agrégats calculés par SQLite (peu de lignes renvoyées) : cols = colonnes de regroupement en plus de l'événement
function lire(du, au, quartier, cols) {
  vider();
  const g = (cols || ['service']).concat(['evenement', 'detail']).join(', ');
  const args = [du, au];
  let sql = 'SELECT ' + g + ', SUM(n) n FROM usage_compteurs WHERE jour >= ? AND jour <= ?';
  if (quartier) { sql += ' AND quartier = ?'; args.push(quartier); }
  return db.prepare(sql + ' GROUP BY ' + g).all(...args);
}
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const tendance = (a, b) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);
function rapport(jours, quartier) {
  const t = Date.now();
  const fin = jourIso(t), debut = jourIso(t - (jours - 1) * 864e5);
  const finAvant = jourIso(t - jours * 864e5), debutAvant = jourIso(t - (2 * jours - 1) * 864e5);
  const cur = lire(debut, fin, quartier), prev = lire(debutAvant, finAvant, quartier);
  const services = docs.tous('services');
  const nomFr = (id) => { const s = services.find((x) => x.id === id); return s ? (s.nom && s.nom.fr) || id : id; };
  const base = () => ({ vues: 0, commencees: 0, nature: 0, informations: 0, terminees: 0, demandes: 0, contact: 0, signalement: 0, demarche: 0, rdv: 0, recherche: 0, orientation: 0 });
  function agreger(lignes) {
    const par = {};
    for (const l of lignes) {
      const s = (par[l.service] = par[l.service] || base());
      if (l.evenement === 'vue') s.vues += l.n;
      else if (l.evenement === 'etape') { if (l.detail === 'choix') s.commencees += l.n; else if (l.detail === 'nature') s.nature += l.n; else if (l.detail === 'informations') s.informations += l.n; }
      else if (l.evenement === 'demarche_terminee') s.terminees += l.n;
      else if (l.evenement === 'demande') { s.demandes += l.n; if (s[l.detail] !== undefined) s[l.detail] += l.n; }
      else if (l.evenement === 'rdv') s.rdv += l.n;
      else if (l.evenement === 'recherche') s.recherche += l.n;
      else if (l.evenement === 'orientation') s.orientation += l.n;
    }
    return par;
  }
  const A1 = agreger(cur), A0 = agreger(prev);
  const usages = (s) => (s ? s.demandes + s.rdv + s.commencees - Math.min(s.commencees, s.terminees) : 0);   // démarche terminée déjà comptée dans les demandes
  const totalUsages = Object.values(A1).reduce((n, s) => n + usages(s), 0);
  const totalDemarches = Object.values(A1).reduce((n, s) => n + s.demarche, 0);
  const totalVues = Object.values(A1).reduce((n, s) => n + s.vues, 0);
  const classement = services.map((sv) => {
    const s = A1[sv.id] || base(), p = A0[sv.id] || base();
    const debuts = Math.max(s.commencees, s.terminees);
    const etapes = [['choix', debuts], ['nature', Math.max(s.nature, s.informations, s.terminees)], ['informations', Math.max(s.informations, s.terminees)], ['envoi', s.terminees]];
    let pire = null;
    for (let i = 1; i < etapes.length; i++) { const perte = etapes[i - 1][1] - etapes[i][1]; if (debuts >= 5 && perte > 0 && (!pire || perte > pire.perdus)) pire = { etape: etapes[i - 1][0], perdus: perte, part: pct(perte, debuts) }; }
    return { id: sv.id, nom: sv.nom, etat: (sv.etat && sv.etat.code) || 'ok', usages: usages(s), usagesAvant: usages(p), tendance: tendance(usages(s), usages(p)), part: pct(usages(s), totalUsages),
      vues: s.vues, vuesAvant: p.vues, demandes: s.demandes, parType: { contact: s.contact, signalement: s.signalement, demarche: s.demarche }, rdv: s.rdv, trouvesParRecherche: s.recherche + s.orientation,
      demarches: { commencees: debuts, terminees: s.terminees, taux: debuts ? pct(s.terminees, debuts) : null, abandon: debuts ? Math.round(100 - pct(s.terminees, debuts)) : null, etapes, pireEtape: pire },
      partDemarches: pct(s.demarche, totalDemarches) };
  }).sort((a, b) => b.usages - a.usages || b.vues - a.vues);
  // quartiers (sur la période, tous quartiers même si un filtre est posé, pour comparer)
  const parQ = {};
  for (const l of lire(debut, fin, '', ['quartier', 'service'])) {
    if (!QUARTIERS.includes(l.quartier)) continue;
    const q = (parQ[l.quartier] = parQ[l.quartier] || { usages: 0, vues: 0, services: {} });
    const u = l.evenement === 'demande' || l.evenement === 'rdv' || (l.evenement === 'etape' && l.detail === 'choix') ? l.n : 0;
    q.usages += u; if (l.evenement === 'vue') q.vues += l.n;
    q.services[l.service] = (q.services[l.service] || 0) + u;
  }
  const totalQ = Object.values(parQ).reduce((n, q) => n + q.usages, 0);
  const quartiers = QUARTIERS.map((q) => {
    const x = parQ[q] || { usages: 0, vues: 0, services: {} };
    const top = Object.entries(x.services).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => ({ id, n, part: pct(n, x.usages) }));
    return { quartier: q, usages: x.usages, vues: x.vues, part: pct(x.usages, totalQ), top };
  });
  // surreprésentation : service plus utilisé dans un quartier que dans la moyenne de la ville
  let surrep = null;
  for (const q of QUARTIERS) {
    const x = parQ[q]; if (!x || x.usages < 20) continue;
    for (const [id, n] of Object.entries(x.services)) {
      const ville = Object.values(parQ).reduce((s, y) => s + (y.services[id] || 0), 0);
      if (ville < 20) continue;
      const ratio = (n / x.usages) / (ville / totalQ);
      if (ratio >= 1.5 && (!surrep || ratio > surrep.ratio)) surrep = { quartier: q, service: id, ratio: Math.round(ratio * 10) / 10 };
    }
  }
  // heures et jours de pointe (consultations + usages)
  const heures = Array(24).fill(0), jours7 = Array(7).fill(0);
  for (const l of lire(debut, fin, quartier, ['jour', 'heure'])) {
    if (!['vue', 'demande', 'rdv', 'etape'].includes(l.evenement) || (l.evenement === 'etape' && l.detail !== 'choix')) continue;
    heures[l.heure] += l.n;
    jours7[new Date(l.jour + 'T12:00:00Z').getUTCDay()] += l.n;
  }
  let pic = 0; for (let h = 0; h < 23; h++) if (heures[h] + heures[h + 1] > heures[pic] + heures[pic + 1]) pic = h;
  const jourPic = jours7.indexOf(Math.max(...jours7));
  // ce qu'il faut retenir (données structurées : le texte est rédigé dans la langue de l'agent par la page)
  const retenir = [], actions = [];
  const premier = classement.find((s) => s.demandes > 0) || classement[0];
  const parDemarches = classement.filter((s) => s.parType.demarche > 0).sort((a, b) => b.parType.demarche - a.parType.demarche)[0];
  if (parDemarches) {
    const avant = (A0[parDemarches.id] || base()).demarche;
    retenir.push({ code: 'partDemarches', service: parDemarches.id, part: Math.round(parDemarches.partDemarches), tendance: tendance(parDemarches.parType.demarche, avant), jours });
  }
  if (premier && premier.usages) retenir.push({ code: 'premier', service: premier.id, usages: premier.usages, part: Math.round(premier.part), tendance: premier.tendance, jours });
  const hausse = classement.filter((s) => s.usagesAvant >= 10 && s.tendance >= 15 && s !== premier).sort((a, b) => b.tendance - a.tendance)[0];
  if (hausse) { retenir.push({ code: 'hausse', service: hausse.id, tendance: hausse.tendance, jours }); actions.push({ code: 'renforcer', service: hausse.id, tendance: hausse.tendance }); }
  const baisse = classement.filter((s) => s.usagesAvant >= 10 && s.tendance <= -20).sort((a, b) => a.tendance - b.tendance)[0];
  if (baisse) retenir.push({ code: 'baisse', service: baisse.id, tendance: baisse.tendance, jours });
  const abandon = classement.filter((s) => s.demarches.pireEtape && s.demarches.commencees >= 10 && s.demarches.pireEtape.part >= 15).sort((a, b) => b.demarches.pireEtape.part - a.demarches.pireEtape.part)[0];
  if (abandon) { retenir.push({ code: 'abandon', service: abandon.id, part: Math.round(abandon.demarches.pireEtape.part), etape: abandon.demarches.pireEtape.etape }); actions.push({ code: 'simplifier', service: abandon.id, etape: abandon.demarches.pireEtape.etape }); }
  if (heures.some((n) => n > 0)) { retenir.push({ code: 'pic', jour: jourPic, heure: pic }); actions.push({ code: 'pic', jour: jourPic, heure: pic }); }
  if (surrep) { retenir.push(Object.assign({ code: 'quartier' }, surrep)); actions.push(Object.assign({ code: 'quartier' }, surrep)); }
  const perturbe = classement.find((s) => s.etat !== 'ok' && s.usages + s.vues > 0 && classement.indexOf(s) < 8);
  if (perturbe) actions.push({ code: 'retablir', service: perturbe.id, usages: perturbe.usages, vues: perturbe.vues, etat: perturbe.etat });
  const recherche = classement.filter((s) => s.trouvesParRecherche > 0).sort((a, b) => b.trouvesParRecherche - a.trouvesParRecherche)[0];
  if (recherche) retenir.push({ code: 'recherche', service: recherche.id, n: recherche.trouvesParRecherche });
  return { genere: maintenant(), jours, quartier: quartier || '', periode: { du: debut, au: fin, duAvant: debutAvant, auAvant: finAvant },
    totaux: { usages: totalUsages, usagesAvant: Object.values(A0).reduce((n, s) => n + usages(s), 0), vues: totalVues, demarchesCommencees: classement.reduce((n, s) => n + s.demarches.commencees, 0),
      demarchesTerminees: classement.reduce((n, s) => n + s.demarches.terminees, 0), rdv: classement.reduce((n, s) => n + s.rdv, 0), recherche: classement.reduce((n, s) => n + s.trouvesParRecherche, 0) },
    classement, quartiers, heures, jours: jours7, pic: { heure: pic, jour: jourPic }, retenir, actions, nomFr: Object.fromEntries(services.map((s) => [s.id, nomFr(s.id)])), anonyme: true };
}

const personnel = A.exigerRole('agent', 'admin');
const lireParams = (req) => ({ jours: [7, 30, 90].includes(Number(req.query.periode)) ? Number(req.query.periode) : 30, quartier: QUARTIERS.includes(req.query.quartier) ? req.query.quartier : '' });
// Rapport gardé 60 s par période et quartier (calcul de quelques dizaines de millisecondes, données agrégées peu mouvantes)
const memo = new Map();
function rapportMemo(jours, quartier) { const k = jours + '|' + quartier, e = memo.get(k); if (e && Date.now() - e.t < 60e3) return e.r; const r = rapport(jours, quartier); memo.set(k, { t: Date.now(), r }); return r; }
router.get('/api/usage/rapport', personnel, (req, res) => { const p = lireParams(req); res.set('Cache-Control', 'no-store'); res.json(rapportMemo(p.jours, p.quartier)); });
// Export CSV (Excel français : « ; », UTF-8 avec BOM) inscrit dans l'historique des exports (F88) et le journal d'audit
const cellule = (v) => { let s = String(v == null ? '' : v).replace(/\r?\n/g, ' '); if (/^[=+\-@\t]/.test(s)) s = "'" + s; return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
router.get('/api/usage/export', personnel, (req, res) => {
  const p = lireParams(req);
  const r = rapportMemo(p.jours, p.quartier);
  const v = (x) => (x == null ? '' : String(x).replace('.', ','));
  const entetes = ['Rang', 'Service', 'État', 'Utilisations', 'Période précédente', 'Tendance (%)', 'Part (%)', 'Consultations', 'Demandes', 'dont contacts', 'dont signalements', 'dont démarches', 'Rendez-vous', 'Démarches commencées', 'Démarches terminées', 'Taux de démarches menées au bout (%)', 'Étape la plus abandonnée', 'Trouvé par la recherche'];
  const ETAPE = { choix: 'Choix du service', nature: 'Type de démarche', informations: 'Informations et pièces' };
  const lignes = r.classement.map((s, i) => [i + 1, r.nomFr[s.id], s.etat, s.usages, s.usagesAvant, s.tendance, v(s.part), s.vues, s.demandes, s.parType.contact, s.parType.signalement, s.parType.demarche, s.rdv,
    s.demarches.commencees, s.demarches.terminees, v(s.demarches.taux), s.demarches.pireEtape ? `${ETAPE[s.demarches.pireEtape.etape]} (${v(s.demarches.pireEtape.part)} %)` : '', s.trouvesParRecherche]);
  const nom = `terra-nova-usage-services-${r.periode.du}-${r.periode.au}${p.quartier ? '-' + p.quartier.toLowerCase() : ''}.csv`;
  docs.put('exportsHistorique', { id: uid('exp'), date: maintenant(), parId: req.user.id, par: `${req.user.prenom} ${req.user.nom}`, jeu: 'usage-services', colonnes: entetes, filtres: { periode: p.jours + 'j', quartier: p.quartier },
    format: 'csv', lignes: lignes.length, pseudonymise: true, modele: '', fichier: nom });
  audit(req.user, { categorie: 'donnees', action: 'Export de données (anonymes)', objetId: 'usage-services', objetLibelle: 'Usage des services', apres: `${lignes.length} ligne(s), CSV`, motif: `période ${p.jours} jours${p.quartier ? ', quartier ' + p.quartier : ''}` });
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${nom}"`);
  res.send('﻿' + [entetes.map(cellule).join(';')].concat(lignes.map((l) => l.map(cellule).join(';'))).join('\r\n') + '\r\n');
});

/* ---------- Historique de démonstration (une seule fois, y compris sur une base déjà en service) ---------- */
function semerHistorique() {
  const fait = db.prepare('SELECT valeur FROM compteurs WHERE nom = ?').get('seed_vague20_usage');
  if (fait && fait.valeur > 0) return false;
  if (!docs.compte('services')) return false;
  let graine = 2026;
  const alea = () => { graine |= 0; graine = (graine + 0x6D2B79F5) | 0; let x = Math.imul(graine ^ (graine >>> 15), 1 | graine); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const poisson = (m) => { if (m <= 0) return 0; if (m > 30) return Math.max(0, Math.round(m + Math.sqrt(m) * (alea() + alea() + alea() - 1.5) * 1.4)); let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= alea(); } while (p > L); return k - 1; };
  // usages quotidiens moyens par service, répartition par quartier, part de démarches, part d'abandon par étape
  const S = {
    'etat-civil': { j: 15, q: [30, 15, 20, 20, 15], dem: 0.62, rdv: 0.25, ab: [0.12, 0.08, 0.06], hausse: 0.14 },
    logement: { j: 9, q: [12, 10, 18, 45, 15], dem: 0.55, rdv: 0.12, ab: [0.08, 0.1, 0.48], hausse: 0.04 },
    sante: { j: 10, q: [25, 20, 20, 20, 15], dem: 0.1, rdv: 0.55, ab: [0.1, 0.05, 0.05] },
    transports: { j: 6, q: [20, 20, 25, 20, 15], dem: 0.05, rdv: 0, ab: [0.2, 0.1, 0.1], hausse: 0.3 },
    voirie: { j: 7, q: [20, 20, 22, 18, 20], dem: 0.02, rdv: 0, ab: [0.1, 0.1, 0.1] },
    social: { j: 5, q: [15, 12, 38, 20, 15], dem: 0.5, rdv: 0.3, ab: [0.1, 0.1, 0.22] },
    emploi: { j: 4, q: [15, 12, 18, 15, 40], dem: 0.35, rdv: 0.35, ab: [0.1, 0.1, 0.15] },
    education: { j: 4.5, q: [18, 38, 15, 14, 15], dem: 0.6, rdv: 0.15, ab: [0.1, 0.08, 0.12] },
    'eau-energie': { j: 3, q: [20, 20, 20, 20, 20], dem: 0.3, rdv: 0, ab: [0.1, 0.1, 0.1] },
    dechets: { j: 3, q: [18, 20, 22, 20, 20], dem: 0.05, rdv: 0, ab: [0.1, 0.1, 0.1] },
    culture: { j: 2.2, q: [25, 15, 15, 30, 15], dem: 0.3, rdv: 0.2, ab: [0.15, 0.1, 0.1], baisse: 0.35 },
    urbanisme: { j: 1.6, q: [30, 20, 15, 20, 15], dem: 0.7, rdv: 0.2, ab: [0.15, 0.15, 0.3] }
  };
  const SEMAINE = [0.45, 1.35, 1.15, 1.05, 1.1, 1.0, 0.6];   // dimanche → samedi
  const HEURES = [0, 0, 0, 0, 0, 0.2, 0.6, 1.6, 3.2, 4.6, 4.4, 3.4, 2.2, 2.4, 3.3, 3.5, 3.0, 2.6, 2.1, 1.7, 1.2, 0.7, 0.3, 0.1];
  const sommeH = HEURES.reduce((a, b) => a + b, 0);
  const tirerHeure = () => { let r = alea() * sommeH; for (let h = 0; h < 24; h++) { r -= HEURES[h]; if (r <= 0) return h; } return 10; };
  const tirerQ = (q) => { let r = alea() * 100; for (let i = 0; i < 5; i++) { r -= q[i]; if (r <= 0) return QUARTIERS[i]; } return 'Centre'; };
  const lignes = new Map();
  const ajout = (jour, h, q, s, ev, d, n) => { if (!n) return; const k = [jour, h, q, s, ev, d].join('|'); lignes.set(k, (lignes.get(k) || 0) + n); };
  const existants = new Set(docs.tous('services').map((s) => s.id));
  for (let i = 89; i >= 0; i--) {
    const t = Date.now() - i * 864e5, { jour } = ville(new Date(t));
    const dow = new Date(jour + 'T12:00:00Z').getUTCDay();
    for (const [id, c] of Object.entries(S)) {
      if (!existants.has(id)) continue;
      let m = c.j * SEMAINE[dow];
      if (c.hausse && i < 7) m *= 1 + c.hausse * 1.6;
      if (c.baisse && i < 10) m *= 1 - c.baisse;
      const usages = poisson(m);
      for (let k = 0; k < usages; k++) {
        const h = tirerHeure(), q = tirerQ(c.q), r = alea();
        if (r < c.dem) {   // démarche : service choisi → type → informations et pièces → envoi
          ajout(jour, h, q, id, 'etape', 'choix', 1);
          if (alea() < c.ab[0]) continue;
          ajout(jour, h, q, id, 'etape', 'nature', 1);
          if (alea() < c.ab[1]) continue;
          ajout(jour, h, q, id, 'etape', 'informations', 1);
          if (alea() < c.ab[2]) continue;
          ajout(jour, h, q, id, 'demarche_terminee', '', 1); ajout(jour, h, q, id, 'demande', 'demarche', 1);
        } else if (r < c.dem + c.rdv) ajout(jour, h, q, id, 'rdv', '', 1);
        else ajout(jour, h, q, id, 'demande', id === 'voirie' || id === 'dechets' || id === 'eau-energie' ? (alea() < 0.75 ? 'signalement' : 'contact') : 'contact', 1);
      }
      for (const [ev, f] of [['vue', 3.2], ['recherche', 0.45], ['orientation', 0.15]]) {
        const n = poisson(m * f);
        for (let k = 0; k < n; k++) ajout(jour, tirerHeure(), tirerQ(c.q), id, ev, '', 1);
      }
    }
  }
  db.exec('BEGIN');
  try { for (const [k, n] of lignes) { const p = k.split('|'); qAjout.run(p[0], Number(p[1]), p[2], p[3], p[4], p[5], n); } docs.fixerCompteur('seed_vague20_usage', 1); db.exec('COMMIT'); }
  catch (e) { db.exec('ROLLBACK'); console.error('[usage] historique', e.message); return false; }
  return true;
}

module.exports = router;
Object.assign(module.exports, { balise, apresEcriture, compter, rapport, semerHistorique, vider });
