/* Terra Nova — vague 17 (F87, DSI) : sauvegardes vérifiées.
   - Sauvegarde cohérente de la base SQLite par « VACUUM INTO » (instantané complet, même pendant que la plateforme écrit),
     dans ~/terranova-data/sauvegardes/ (à côté de la base, jamais dans public/ ni dans le dépôt), horodatée, avec son
     empreinte SHA-256, sa taille et le nombre d'éléments par collection (fiche JSON à côté du fichier).
   - Sauvegarde automatique quotidienne et rétention (les 7 dernières automatiques ; SAUVEGARDES_GARDER pour changer).
   - Test de restauration : la sauvegarde est copiée dans une base temporaire puis vérifiée (empreinte inchangée,
     PRAGMA integrity_check, tables et colonnes attendues, comptes comparés à la base en service, documents lisibles, données
     chiffrées qui se déchiffrent avec la clé actuelle) → verdict en langage clair et quoi faire en cas de problème.
   - Téléchargement réservé à l'administrateur, après confirmation du mot de passe, inscrit au journal d'audit.
   La clé de chiffrement n'est jamais copiée dans la sauvegarde : elle se conserve à part (voir README). */
const router = require('express').Router();
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const db = require('../db');
const A = require('../auth');
const { docs, audit, maintenant } = require('../donnees');
const { dechiffrer, CHAMPS, PREFIXE } = require('../chiffrement');

const fichierBase = process.env.DB_PATH
  || (process.env.NODE_ENV === 'production' ? path.join(os.homedir(), 'terranova-data', 'terranova.db') : path.join(__dirname, '..', '..', 'data', 'terranova.db'));
const DOSSIER = process.env.SAUVEGARDES_DIR || path.join(path.dirname(fichierBase), 'sauvegardes');
const GARDER = Math.max(1, Number(process.env.SAUVEGARDES_GARDER) || 7);
const NOM = /^terranova-\d{8}-\d{6}(-auto)?\.db$/;   // aucun autre nom n'est jamais lu ni servi (pas de traversée de dossier)
const TABLES = { users: ['id', 'email', 'name', 'password_hash', 'role', 'doc_id'], sessions: ['token', 'user_id', 'expires_at'], docs: ['col', 'id', 'data', 'cree'], compteurs: ['nom', 'valeur'], securite: ['email', 'etat'] };

const sha256 = (f) => new Promise((ok, ko) => { const h = crypto.createHash('sha256'); fs.createReadStream(f).on('data', (c) => h.update(c)).on('end', () => ok(h.digest('hex'))).on('error', ko); });
const sha256Sync = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const deux = (n) => String(n).padStart(2, '0');
const horodatage = (d) => `${d.getFullYear()}${deux(d.getMonth() + 1)}${deux(d.getDate())}-${deux(d.getHours())}${deux(d.getMinutes())}${deux(d.getSeconds())}`;
const fiche = (nom) => path.join(DOSSIER, nom.replace(/\.db$/, '.json'));
const lireFiche = (nom) => { try { return JSON.parse(fs.readFileSync(fiche(nom), 'utf8')); } catch { return null; } };
const ecrireFiche = (nom, f) => fs.writeFileSync(fiche(nom), JSON.stringify(f, null, 2), { mode: 0o600 });

function compter(base) {
  const collections = Object.fromEntries(base.prepare('SELECT col, COUNT(*) n FROM docs GROUP BY col ORDER BY col').all().map((r) => [r.col, r.n]));
  const tables = {};
  for (const t of ['users', 'docs', 'sessions', 'compteurs']) { try { tables[t] = base.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n; } catch { tables[t] = null; } }
  return { collections, tables, documents: Object.values(collections).reduce((a, b) => a + b, 0) };
}

/* ---------- Créer ---------- */
function creer(type, acteur) {
  fs.mkdirSync(DOSSIER, { recursive: true, mode: 0o700 });
  const d = new Date();
  let nom = `terranova-${horodatage(d)}${type === 'auto' ? '-auto' : ''}.db`;
  if (fs.existsSync(path.join(DOSSIER, nom))) nom = `terranova-${horodatage(new Date(d.getTime() + 1000))}${type === 'auto' ? '-auto' : ''}.db`;
  const cible = path.join(DOSSIER, nom);
  const t0 = Date.now();
  db.exec(`VACUUM INTO '${cible.replace(/'/g, "''")}'`);
  try { fs.chmodSync(cible, 0o600); } catch { /* Windows */ }
  const b = new DatabaseSync(cible, { readOnly: true });
  let comptes; try { comptes = compter(b); } finally { b.close(); }
  const f = { fichier: nom, cree: d.toISOString(), type, par: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Sauvegarde automatique', sha256: sha256Sync(cible),
    taille: fs.statSync(cible).size, dureeMs: Date.now() - t0, ...comptes, dernierTest: null };
  ecrireFiche(nom, f);
  audit(acteur || null, { categorie: 'plateforme', action: type === 'auto' ? 'Sauvegarde automatique créée' : 'Sauvegarde créée', objetId: nom, objetLibelle: 'Sauvegarde de la base',
    apres: `${f.documents} documents, ${Math.round(f.taille / 1024)} Ko`, motif: `SHA-256 ${f.sha256.slice(0, 16)}…` });
  retention();
  return f;
}
function liste() {
  let noms = [];
  try { noms = fs.readdirSync(DOSSIER).filter((n) => NOM.test(n)); } catch { return []; }
  return noms.map((n) => { const f = lireFiche(n) || { fichier: n, cree: null }; try { f.tailleActuelle = fs.statSync(path.join(DOSSIER, n)).size; } catch { /* supprimé entre-temps */ } return f; })
    .sort((a, b) => String(b.cree || b.fichier).localeCompare(String(a.cree || a.fichier)));
}
function retention() {
  const auto = liste().filter((f) => f.type === 'auto' || /-auto\.db$/.test(f.fichier));
  for (const f of auto.slice(GARDER)) { for (const p of [path.join(DOSSIER, f.fichier), fiche(f.fichier)]) { try { fs.unlinkSync(p); } catch { /* déjà parti */ } } }
  const manuelles = liste().filter((f) => !(f.type === 'auto' || /-auto\.db$/.test(f.fichier)));
  for (const f of manuelles.slice(20)) { for (const p of [path.join(DOSSIER, f.fichier), fiche(f.fichier)]) { try { fs.unlinkSync(p); } catch { /* déjà parti */ } } }
}

/* ---------- Tester la restauration ---------- */
const ko = (n) => (n / 1024 < 1024 ? `${(n / 1024).toFixed(0)} Ko` : `${(n / 1048576).toFixed(1).replace('.', ',')} Mo`);
const dateFr = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: process.env.TZ_VILLE || 'Indian/Mayotte' }).replace(' à ', ' ');
async function tester(nom) {
  const source = path.join(DOSSIER, nom);
  const f = lireFiche(nom) || { fichier: nom };
  const etapes = [];
  const ajouter = (code, ok, detail, conseil, grave) => etapes.push({ code, ok, detail, conseil: ok ? '' : conseil || '', grave: !ok && grave !== false });
  const t0 = Date.now();
  const empreinte = await sha256(source);
  ajouter('empreinte', !f.sha256 || empreinte === f.sha256, f.sha256 ? (empreinte === f.sha256 ? 'Empreinte SHA-256 identique à celle relevée à la création.' : 'L’empreinte a changé depuis la création : le fichier a été modifié ou abîmé.') : 'Aucune empreinte de référence (fiche absente) : empreinte calculée maintenant.',
    'Ne pas utiliser ce fichier : créez une nouvelle sauvegarde et vérifiez l’espace disque et les droits du dossier.');
  const tmp = path.join(os.tmpdir(), `terranova-test-${process.pid}-${Date.now()}.db`);
  fs.copyFileSync(source, tmp);
  let b = null, comptes = null, live = null;
  try {
    b = new DatabaseSync(tmp);
    const ic = b.prepare('PRAGMA integrity_check').all().map((r) => Object.values(r)[0]);
    ajouter('integrite', ic.length === 1 && ic[0] === 'ok', ic[0] === 'ok' ? 'Structure interne de la base intacte (PRAGMA integrity_check : ok).' : `Problèmes de structure : ${ic.slice(0, 3).join(' ; ')}`, 'Fichier abîmé : utilisez une autre sauvegarde et créez-en une nouvelle tout de suite.');
    const manque = [];
    for (const [t, cols] of Object.entries(TABLES)) {
      const presentes = b.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
      if (!presentes.length) manque.push(t); else cols.filter((c) => !presentes.includes(c)).forEach((c) => manque.push(`${t}.${c}`));
    }
    ajouter('schema', !manque.length, manque.length ? `Éléments absents : ${manque.join(', ')}` : 'Toutes les tables et colonnes attendues sont présentes.', 'Sauvegarde d’une version trop ancienne ou incomplète : refaites une sauvegarde depuis la version en service.');
    comptes = compter(b);
    live = compter(db);
    const essentielles = ['utilisateurs', 'services', 'demandes'];
    const vides = essentielles.filter((c) => !comptes.collections[c]);
    const ecarts = Object.keys(Object.assign({}, live.collections, comptes.collections)).map((c) => ({ collection: c, sauvegarde: comptes.collections[c] || 0, enService: live.collections[c] || 0 }))
      .filter((e) => e.sauvegarde !== e.enService);
    const pertes = ecarts.filter((e) => essentielles.includes(e.collection) && e.sauvegarde < e.enService);
    ajouter('comptes', !vides.length, vides.length ? `Collections essentielles vides : ${vides.join(', ')}.` : `${comptes.documents} documents, ${comptes.tables.users} comptes. ${ecarts.length ? ecarts.length + ' collection(s) ont changé depuis (activité normale).' : 'Identique à la base en service.'}`,
      'Cette sauvegarde ne contient pas l’essentiel : ne pas restaurer, refaire une sauvegarde.');
    let lus = 0, illisibles = 0;
    for (const r of b.prepare('SELECT col, id, data FROM docs').all()) { try { JSON.parse(r.data); lus++; } catch { illisibles++; } }
    ajouter('documents', !illisibles, illisibles ? `${illisibles} document(s) illisible(s) sur ${lus + illisibles}.` : `Les ${lus} documents se relisent correctement.`, 'Des documents sont abîmés : comparez avec la sauvegarde précédente.');
    let chiffres = 0, dechiffres = 0;
    for (const [col, champs] of Object.entries(CHAMPS)) {
      for (const r of b.prepare('SELECT id, data FROM docs WHERE col = ? LIMIT 200').all(col)) {
        let d; try { d = JSON.parse(r.data); } catch { continue; }
        for (const c of champs) if (typeof d[c] === 'string' && d[c].startsWith(PREFIXE)) { chiffres++; if (dechiffrer(d[c], `${col}:${d.id}:${c}`, null) !== null) dechiffres++; }
      }
    }
    const temoin = b.prepare("SELECT valeur FROM compteurs WHERE nom = 'chiffrement_temoin'").get();
    const temoinOk = !temoin || dechiffrer(String(temoin.valeur), 'chiffrement_temoin', null) === 'ok';
    ajouter('chiffrement', temoinOk && dechiffres === chiffres, chiffres ? `${dechiffres} donnée(s) chiffrée(s) sur ${chiffres} se déchiffrent avec la clé actuelle (échantillon).` : 'Aucune donnée chiffrée dans l’échantillon.',
      'Les données chiffrées ne se lisent pas avec la clé actuelle : retrouvez la clé utilisée à la date de la sauvegarde (DATA_ENCRYPTION_KEY ou terranova.key) et conservez-la avec les sauvegardes.');
    f.pertes = pertes;
    f.ecarts = ecarts.slice(0, 20);
  } catch (e) {
    ajouter('ouverture', false, `La sauvegarde ne s’ouvre pas : ${e.message}`, 'Fichier inutilisable : utilisez une autre sauvegarde.');
  } finally { try { if (b) b.close(); } catch { /* déjà fermée */ } for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(tmp + s); } catch { /* absent */ } } }
  const problemes = etapes.filter((e) => !e.ok);
  const ok = !problemes.length;
  const quand = f.cree ? dateFr(f.cree) : nom;
  const verdict = ok
    ? `Sauvegarde du ${quand} : complète et restaurable, ${((comptes && comptes.documents) || 0).toLocaleString('fr-FR')} documents, ${ko(fs.statSync(source).size)}.`
    : `Sauvegarde du ${quand} : à ne pas utiliser telle quelle (${problemes.length} problème${problemes.length > 1 ? 's' : ''}).`;
  const test = { date: maintenant(), ok, verdict, etapes, cree: f.cree || null, taille: fs.statSync(source).size, problemes: problemes.length, documents: comptes ? comptes.documents : 0, collections: comptes ? comptes.collections : {}, enService: live ? live.collections : {},
    ecarts: f.ecarts || [], quoiFaire: ok ? ['Rien à faire. Conservez aussi la clé de chiffrement (DATA_ENCRYPTION_KEY ou terranova.key) à part, en lieu sûr.'] : [...new Set(problemes.map((p) => p.conseil))], dureeMs: Date.now() - t0 };
  const fi = lireFiche(nom);
  if (fi) { fi.dernierTest = { date: test.date, ok, verdict }; ecrireFiche(nom, fi); }
  return test;
}

/* ---------- Routes (administrateur) ---------- */
const admin = A.exigerRole('admin');
const exiger = (req, res) => require('./anomalies').exigerConfirmation(req, res);
router.get('/api/sauvegardes', admin, (req, res) => {
  const l = liste();
  const auto = l.find((f) => f.type === 'auto');
  res.set('Cache-Control', 'no-store');
  res.json({ sauvegardes: l, dossier: DOSSIER.replace(os.homedir(), '~'), garder: GARDER, derniereAuto: auto ? auto.cree : null,
    prochaineAuto: new Date(prochaineAuto()).toISOString(), base: { taille: fs.existsSync(fichierBase) ? fs.statSync(fichierBase).size : null, ...compter(db) } });
});
router.post('/api/sauvegardes', admin, (req, res) => {
  try { res.json(creer('manuel', req.user)); } catch (e) { console.error('[sauvegardes]', e); res.status(500).json({ erreur: `La sauvegarde a échoué : ${e.message}. Vérifiez l’espace disque et les droits du dossier.` }); }
});
router.post('/api/sauvegardes/:nom/tester', admin, async (req, res) => {
  const nom = String(req.params.nom);
  if (!NOM.test(nom) || !fs.existsSync(path.join(DOSSIER, nom))) return res.status(404).json({ erreur: 'Sauvegarde introuvable.' });
  try {
    const t = await tester(nom);
    audit(req.user, { categorie: 'plateforme', action: 'Test de restauration d’une sauvegarde', objetId: nom, objetLibelle: 'Sauvegarde de la base', apres: t.ok ? 'restaurable' : 'problème', motif: t.verdict });
    res.json(t);
  } catch (e) { console.error('[sauvegardes] test', e); res.status(500).json({ erreur: `Le test n’a pas pu aller au bout : ${e.message}` }); }
});
router.get('/api/sauvegardes/:nom/telecharger', admin, (req, res) => {
  const nom = String(req.params.nom);
  if (!NOM.test(nom) || !fs.existsSync(path.join(DOSSIER, nom))) return res.status(404).json({ erreur: 'Sauvegarde introuvable.' });
  if (!exiger(req, res)) return;
  if (req.query.verifier === '1') return res.json({ ok: true });   // le navigateur vérifie d'abord que le mot de passe est confirmé, puis télécharge
  audit(req.user, { categorie: 'plateforme', action: 'Téléchargement d’une sauvegarde', objetId: nom, objetLibelle: 'Sauvegarde de la base', motif: 'Copie hors du serveur (administrateur, mot de passe confirmé)' });
  res.set('Cache-Control', 'no-store');
  res.download(path.join(DOSSIER, nom), nom);
});

/* ---------- Sauvegarde automatique quotidienne ---------- */
const JOUR = 864e5, DEMARRAGE = Date.now();
function prochaineAuto() { const a = liste().find((f) => f.type === 'auto'); return a && a.cree ? Date.parse(a.cree) + JOUR : DEMARRAGE + 2 * 60e3; }
function planifier() {
  const verifier = () => { try { if (prochaineAuto() <= Date.now() + 1000) creer('auto', null); } catch (e) { console.error('[sauvegardes] automatique', e.message); } };
  setTimeout(verifier, 2 * 60e3).unref();
  setInterval(verifier, 3600e3).unref();
}

module.exports = router;
module.exports.planifier = planifier;
module.exports.creer = creer;
module.exports.tester = tester;
module.exports.DOSSIER = DOSSIER;
