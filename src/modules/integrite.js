/* Terra Nova — vague 17 (F85, Centre de cybersécurité) : intégrité des données.
   1. Registre d'audit infalsifiable : chaque entrée du journal d'audit (F47, F48) est scellée dans la table audit_chaine
      avec l'empreinte SHA-256 de son contenu enchaînée à celle de l'entrée précédente, et un sceau HMAC (clé dérivée de la
      clé du serveur). Modifier, supprimer ou insérer une entrée directement dans la base casse la chaîne :
      GET /api/integrite/chaine répond « chaîne intacte (N entrées) » ou « rompue à l'entrée N » avec la raison.
      Le registre est scellé une première fois au démarrage (base existante comprise), puis chaque nouvelle entrée est
      ajoutée au moment de son écriture (docs.put). Une entrée apparue hors de ce chemin est signalée, jamais scellée en silence.
   2. Contrôles de cohérence périodiques des données métier (toutes les 6 h et à la demande) : statuts des demandes et
      historique, références orphelines, dates impossibles, rôles incohérents, compteurs en retard, documents qui ne
      respectent pas leur schéma, urgences médicales incohérentes. Rapport lisible + réparations sûres proposées, appliquées
      seulement après confirmation de l'administrateur (journal d'audit). Un problème grave ouvre un incident (src/incidents.js).
   Rôles contrôlés par le serveur : administrateur seulement (agent / citoyen 403, visiteur 401). */
const router = require('express').Router();
const crypto = require('node:crypto');
const db = require('../db');
const { docs, audit, uid, maintenant } = require('../donnees');
const { deriver } = require('../chiffrement');
const A = require('../auth');
const incidents = require('../incidents');

db.exec(`CREATE TABLE IF NOT EXISTS audit_chaine (
  seq INTEGER PRIMARY KEY, doc_id TEXT NOT NULL UNIQUE, empreinte TEXT NOT NULL, precedente TEXT NOT NULL, sceau TEXT NOT NULL, date TEXT NOT NULL
);`);
const CLE = deriver('audit-chaine-v17');
const ORIGINE = '0'.repeat(64);
const q = {
  dernier: db.prepare('SELECT seq, empreinte FROM audit_chaine ORDER BY seq DESC LIMIT 1'),
  existe: db.prepare('SELECT 1 FROM audit_chaine WHERE doc_id = ?'),
  ajouter: db.prepare('INSERT INTO audit_chaine (seq, doc_id, empreinte, precedente, sceau, date) VALUES (?, ?, ?, ?, ?, ?)'),
  tous: db.prepare('SELECT seq, doc_id, empreinte, precedente, sceau, date FROM audit_chaine ORDER BY seq'),
  compte: db.prepare('SELECT COUNT(*) n FROM audit_chaine'),
  vider: db.prepare('DELETE FROM audit_chaine'),
  brut: db.prepare("SELECT id, data FROM docs WHERE col = 'audit'"),
  brutTous: db.prepare('SELECT col, id, data FROM docs')
};

// Sérialisation stable (clés triées) : la même entrée donne toujours la même empreinte
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const empreinteDe = (precedente, doc) => sha(precedente + '|' + stable(doc));
const sceauDe = (seq, empreinte, precedente) => crypto.createHmac('sha256', CLE).update(`${seq}|${empreinte}|${precedente}`).digest('hex');

function sceller(doc) {
  if (!doc || !doc.id || q.existe.get(String(doc.id))) return;
  const d = q.dernier.get();
  const seq = d ? d.seq + 1 : 1, precedente = d ? d.empreinte : ORIGINE;
  const propre = JSON.parse(JSON.stringify(doc));   // exactement ce qui est enregistré dans la base
  const e = empreinteDe(precedente, propre);
  q.ajouter.run(seq, String(doc.id), e, precedente, sceauDe(seq, e, precedente), maintenant());
}

// Toute nouvelle entrée d'audit, quel que soit le module qui l'écrit, est scellée au moment de son écriture
const putOrigine = docs.put;
docs.put = function (col, obj) {
  const r = putOrigine.call(docs, col, obj);
  if (col === 'audit') { try { sceller(r); } catch (e) { console.error('[intégrité] scellement', e.message); } }
  return r;
};

// Premier scellement (registre vide) ou nouveau scellement après la réinitialisation de la démonstration
function scellerTout() {
  const l = q.brut.all().map((r) => { try { return JSON.parse(r.data); } catch { return null; } }).filter(Boolean)
    .sort((a, b) => String(a.date || a.cree || '').localeCompare(String(b.date || b.cree || '')) || String(a.id).localeCompare(String(b.id)));
  for (const d of l) sceller(d);
  return l.length;
}
function initialiser() {
  if (q.compte.get().n === 0) { const n = scellerTout(); if (n) console.log(`[intégrité] registre d'audit scellé (${n} entrées)`); }
}
function rescellerApresDemo(acteur) {
  q.vider.run();
  scellerTout();
  audit(acteur || null, { categorie: 'securite', action: 'Registre d’audit scellé de nouveau', objetId: 'audit_chaine', objetLibelle: 'Registre d’audit',
    motif: 'Réinitialisation des données de démonstration : le journal a été rechargé, la chaîne repart de zéro.' });
}

/* ---------- Vérification de la chaîne ---------- */
// alterer : { seq } pour la simulation (une entrée modifiée en mémoire seulement)
function verifierChaine(alterer) {
  const t0 = Date.now();
  const lignes = q.tous.all();
  const auditBrut = new Map(q.brut.all().map((r) => [r.id, r.data]));
  let precedente = ORIGINE, rupture = null;
  for (let i = 0; i < lignes.length && !rupture; i++) {
    const l = lignes[i], n = i + 1;
    if (l.seq !== n) { rupture = { entree: n, raison: 'manquante', texte: `L’entrée n° ${n} a été retirée du registre.` }; break; }
    if (l.precedente !== precedente) { rupture = { entree: n, raison: 'lien', texte: `Le lien entre l’entrée n° ${n - 1} et l’entrée n° ${n} ne correspond plus.` }; break; }
    if (sceauDe(l.seq, l.empreinte, l.precedente) !== l.sceau) { rupture = { entree: n, raison: 'sceau', texte: `Le sceau de l’entrée n° ${n} est invalide : le registre a été réécrit.` }; break; }
    const brut = auditBrut.get(l.doc_id);
    if (brut === undefined) { rupture = { entree: n, raison: 'supprimee', docId: l.doc_id, texte: `L’entrée n° ${n} du journal d’audit a été supprimée.` }; break; }
    let doc; try { doc = JSON.parse(brut); } catch { doc = { illisible: brut }; }
    if (alterer && alterer.seq === n) doc = Object.assign({}, doc, { motif: String(doc.motif || '') + ' (modifié)' });
    if (empreinteDe(l.precedente, doc) !== l.empreinte) { rupture = { entree: n, raison: 'modifiee', docId: l.doc_id, texte: `L’entrée n° ${n} du journal d’audit a été modifiée après son écriture.`, action: doc.action || '', date: doc.date || '' }; break; }
    precedente = l.empreinte;
  }
  const scelles = new Set(lignes.map((l) => l.doc_id));
  const horsRegistre = [...auditBrut.keys()].filter((id) => !scelles.has(id));
  const intacte = !rupture && !horsRegistre.length;
  return { intacte, entrees: lignes.length, rupture, horsRegistre: horsRegistre.length, exemplesHorsRegistre: horsRegistre.slice(0, 5),
    derniere: lignes.length ? { seq: lignes[lignes.length - 1].seq, empreinte: lignes[lignes.length - 1].empreinte.slice(0, 16), date: lignes[lignes.length - 1].date } : null,
    verifieLe: maintenant(), dureeMs: Date.now() - t0, simulation: !!alterer,
    texte: rupture ? `Chaîne rompue à l’entrée n° ${rupture.entree} : ${rupture.texte}`
      : horsRegistre.length ? `Chaîne intacte (${lignes.length} entrées), mais ${horsRegistre.length} entrée(s) du journal ont été ajoutées hors du registre.`
        : `Chaîne intacte : ${lignes.length} entrées vérifiées, aucune modification.` };
}

/* ---------- Contrôles de cohérence des données métier ---------- */
const STATUTS_DEMANDE = ['recue', 'en_cours', 'traitee', 'cloturee'];
const STATUTS_URGENCE = ['signalee', 'prise_en_charge', 'transmise', 'close'];
const SCHEMAS = {
  demandes: ['id', 'type', 'statut', 'cree', 'objet'], utilisateurs: ['id', 'email', 'prenom'], audit: ['id', 'date', 'action'],
  rdv: ['id', 'serviceId', 'debut'], services: ['id', 'nom'], incidents: ['id', 'titre', 'statut']
};
const COMPTEURS = [['demandes', 'demandes', /^NT-(\d+)$/], ['avisServices', 'avisServices', /^COM-(\d+)$/], ['contributions', 'contributions', /^CTR-(\d+)$/],
  ['officiels', 'officiels', /^OFF-(\d+)$/], ['idees', 'idees', /^IDE-(\d+)$/], ['avis', 'avis', /^AVI-(\d+)$/], ['incidents', 'incidents', /^INC-(\d+)$/]];
const valeurCompteur = db.prepare('SELECT valeur FROM compteurs WHERE nom = ?');
const dateOk = (s) => typeof s === 'string' && Number.isFinite(Date.parse(s));

function controles() {
  const l = [];
  const ajouter = (o) => l.push(Object.assign({ id: `${o.code}:${o.collection || '-'}:${o.docId || '-'}${o.suffixe ? ':' + o.suffixe : ''}` }, o));
  const futur = Date.now() + 10 * 60e3;
  const utilisateurs = docs.tous('utilisateurs');
  const idsProfils = new Set(utilisateurs.map((u) => u.id));
  const comptes = db.prepare('SELECT id, email, role, doc_id FROM users').all();
  const parDoc = new Map(comptes.map((c) => [c.doc_id, c]));
  const demandes = docs.tous('demandes');
  const idsDemandes = new Set(demandes.map((d) => d.id));

  // Documents illisibles et schémas
  for (const r of q.brutTous.all()) {
    let d; try { d = JSON.parse(r.data); } catch { ajouter({ code: 'document-illisible', gravite: 'haute', collection: r.col, docId: r.id, detail: 'contenu JSON illisible', reparation: null }); continue; }
    const req = SCHEMAS[r.col];
    if (req) { const manque = req.filter((k) => d[k] === undefined || d[k] === null || d[k] === ''); if (manque.length) ajouter({ code: 'schema', gravite: 'moyenne', collection: r.col, docId: r.id, detail: 'champ(s) manquant(s) : ' + manque.join(', '), reparation: null }); }
  }
  // Demandes : statuts, historique, dates, groupes, urgences
  for (const d of demandes) {
    const h = Array.isArray(d.historique) ? d.historique : [];
    if (!STATUTS_DEMANDE.includes(d.statut)) ajouter({ code: 'statut-inconnu', gravite: 'moyenne', collection: 'demandes', docId: d.id, detail: `statut « ${d.statut} »`, reparation: { code: 'statut-recue', libelle: 'Remettre au statut « Reçue » avec une note dans l’historique' } });
    else if (!h.length) ajouter({ code: 'historique-vide', gravite: 'faible', collection: 'demandes', docId: d.id, detail: 'aucune étape dans l’historique', reparation: { code: 'historique-initial', libelle: 'Créer l’étape « Reçue » à la date de dépôt' } });
    else if (h[h.length - 1].statut !== d.statut) ajouter({ code: 'statut-historique', gravite: 'moyenne', collection: 'demandes', docId: d.id, detail: `statut « ${d.statut} », dernière étape « ${h[h.length - 1].statut} »`, reparation: { code: 'aligner-historique', libelle: 'Ajouter une étape qui confirme le statut actuel' } });
    if (!dateOk(d.cree)) ajouter({ code: 'date-invalide', gravite: 'moyenne', collection: 'demandes', docId: d.id, detail: `date de dépôt « ${String(d.cree).slice(0, 30)} »`, reparation: { code: 'date-depuis-historique', libelle: 'Reprendre la date de la première étape' } });
    else if (Date.parse(d.cree) > futur) ajouter({ code: 'date-future', gravite: 'moyenne', collection: 'demandes', docId: d.id, detail: `déposée le ${d.cree} (dans le futur)`, reparation: { code: 'date-depuis-historique', libelle: 'Reprendre la date de la première étape' } });
    else if (h.some((x) => dateOk(x.date) && Date.parse(x.date) < Date.parse(d.cree) - 60e3)) ajouter({ code: 'date-historique', gravite: 'faible', collection: 'demandes', docId: d.id, detail: 'une étape est datée avant le dépôt', reparation: null });
    if (d.principale && !idsDemandes.has(d.principale)) ajouter({ code: 'groupe-casse', gravite: 'faible', collection: 'demandes', docId: d.id, detail: `rattachée à ${d.principale}, introuvable`, reparation: { code: 'retirer-lien', libelle: 'Retirer le lien vers la demande introuvable' } });
    const lieesPerdues = (d.liees || []).filter((x) => !idsDemandes.has(x));
    if (lieesPerdues.length) ajouter({ code: 'groupe-casse', gravite: 'faible', collection: 'demandes', docId: d.id, suffixe: 'liees', detail: `demandes rattachées introuvables : ${lieesPerdues.join(', ')}`, reparation: { code: 'retirer-lien', libelle: 'Retirer le lien vers la demande introuvable' } });
    const u = d.urgenceMedicale;
    if (u && (!STATUTS_URGENCE.includes(u.statut) || (['traitee', 'cloturee'].includes(d.statut) && u.statut === 'signalee')))
      ajouter({ code: 'urgence-incoherente', gravite: 'haute', collection: 'demandes', docId: d.id, detail: `urgence « ${u.statut} », demande « ${d.statut} »`, reparation: { code: 'urgence-close', libelle: 'Clore l’urgence médicale (la demande est déjà terminée)' } });
  }
  // Références orphelines vers un habitant supprimé
  for (const col of ['demandes', 'rdv', 'avis', 'idees', 'avisServices', 'contributions']) {
    for (const d of docs.tous(col)) if (d.userId && !idsProfils.has(d.userId)) ajouter({ code: 'auteur-inconnu', gravite: 'moyenne', collection: col, docId: d.id, detail: `compte ${d.userId} introuvable`, reparation: { code: 'anonymiser', libelle: 'Rendre anonyme (le compte n’existe plus)' } });
  }
  for (const n of docs.tous('notifications')) if (n.userId && !idsProfils.has(n.userId)) ajouter({ code: 'notification-orpheline', gravite: 'faible', collection: 'notifications', docId: n.id, detail: `destinataire ${n.userId} introuvable`, reparation: { code: 'supprimer-notification', libelle: 'Supprimer cette notification sans destinataire' } });
  // Rôles et comptes
  for (const p of utilisateurs) {
    const c = parDoc.get(p.id);
    if (!c) { ajouter({ code: 'profil-sans-compte', gravite: 'moyenne', collection: 'utilisateurs', docId: p.id, detail: `${p.email || p.id} : aucun identifiant de connexion`, reparation: null }); continue; }
    if (p.role && p.role !== c.role) ajouter({ code: 'role-incoherent', gravite: 'haute', collection: 'utilisateurs', docId: p.id, detail: `profil « ${p.role} », droits réels « ${c.role} »`, reparation: { code: 'aligner-role', libelle: 'Aligner le profil sur les droits réels (le serveur fait foi)' } });
    if (p.habilitation && p.habilitation.active && c.role !== 'agent') ajouter({ code: 'habilitation-incoherente', gravite: 'haute', collection: 'utilisateurs', docId: p.id, detail: `habilitation active pour le rôle « ${c.role} »`, reparation: { code: 'retirer-habilitation', libelle: 'Retirer l’habilitation (réservée aux agents)' } });
  }
  for (const c of comptes) if (!c.doc_id || !idsProfils.has(c.doc_id)) ajouter({ code: 'compte-sans-profil', gravite: 'moyenne', collection: 'users', docId: String(c.id), detail: `${c.email} : profil introuvable`, reparation: null });
  if (!comptes.some((c) => c.role === 'admin')) ajouter({ code: 'aucun-admin', gravite: 'critique', collection: 'users', docId: '-', detail: 'aucun compte administrateur', reparation: null });
  // Compteurs de numérotation
  for (const [nom, col, re] of COMPTEURS) {
    const max = docs.tous(col).reduce((m, d) => { const x = re.exec(String(d.id)); return x ? Math.max(m, Number(x[1])) : m; }, 0);
    const r = valeurCompteur.get(nom);
    if (max && r && r.valeur < max) ajouter({ code: 'compteur-retard', gravite: 'haute', collection: 'compteurs', docId: nom, detail: `compteur ${r.valeur}, numéro le plus haut utilisé ${max} (risque d’écraser un dossier)`, reparation: { code: 'avancer-compteur', libelle: `Avancer le compteur à ${max}`, valeur: max } });
  }
  return l;
}

function reparer(a, acteur) {
  const r = a.reparation;
  const par = `${acteur.prenom} ${acteur.nom}`;
  const note = (texte) => ({ date: maintenant(), statut: null, note: texte, par: 'Contrôle d’intégrité', interne: true });
  switch (r.code) {
    case 'statut-recue': { const d = docs.get('demandes', a.docId); if (!d) return false; docs.patch('demandes', d.id, { statut: 'recue', historique: (d.historique || []).concat([Object.assign(note(`Statut « ${d.statut} » inconnu remplacé par « Reçue » (confirmé par ${par}).`), { statut: 'recue' })]) }); return true; }
    case 'historique-initial': { const d = docs.get('demandes', a.docId); if (!d) return false; docs.patch('demandes', d.id, { historique: [{ date: d.cree, statut: d.statut, note: 'Étape reconstituée par le contrôle d’intégrité.', par: 'Système' }] }); return true; }
    case 'aligner-historique': { const d = docs.get('demandes', a.docId); if (!d) return false; docs.patch('demandes', d.id, { historique: (d.historique || []).concat([Object.assign(note(`Statut actuel confirmé par le contrôle d’intégrité (${par}).`), { statut: d.statut })]) }); return true; }
    case 'date-depuis-historique': {
      const d = docs.get('demandes', a.docId); if (!d) return false;
      const dates = (d.historique || []).map((h) => h.date).filter((x) => dateOk(x) && Date.parse(x) <= Date.now() + 10 * 60e3).sort();
      d.cree = dates[0] || maintenant(); docs.put('demandes', d); return true;   // docs.patch conserve la date de création : réécriture complète
    }
    case 'retirer-lien': {
      const d = docs.get('demandes', a.docId); if (!d) return false;
      const ids = new Set(docs.tous('demandes').map((x) => x.id));
      docs.patch('demandes', d.id, { principale: d.principale && !ids.has(d.principale) ? '' : d.principale || '', liees: (d.liees || []).filter((x) => ids.has(x)) }); return true;
    }
    case 'urgence-close': { const d = docs.get('demandes', a.docId); if (!d || !d.urgenceMedicale) return false; docs.patch('demandes', d.id, { urgenceMedicale: Object.assign({}, d.urgenceMedicale, { statut: 'close', closeLe: maintenant(), historique: (d.urgenceMedicale.historique || []).concat([{ date: maintenant(), statut: 'close', note: 'Clôturée par le contrôle d’intégrité : la demande était déjà terminée.', par }]) }) }); return true; }
    case 'anonymiser': { const d = docs.get(a.collection, a.docId); if (!d) return false; docs.patch(a.collection, d.id, { userId: null, anonymise: true }); return true; }
    case 'supprimer-notification': return docs.suppr('notifications', a.docId) > 0;
    case 'aligner-role': { const c = A.parDoc(a.docId); if (!c) return false; docs.patch('utilisateurs', a.docId, { role: c.role }); return true; }
    case 'retirer-habilitation': { const p = docs.get('utilisateurs', a.docId); if (!p) return false; docs.patch('utilisateurs', p.id, { habilitation: Object.assign({}, p.habilitation, { active: false, motif: 'Retirée par le contrôle d’intégrité (rôle non agent)', par, le: maintenant() }) }); return true; }
    case 'avancer-compteur': docs.fixerCompteur(a.docId, r.valeur); return true;
    default: return false;
  }
}

/* ---------- Rapport ---------- */
const PARTIES = { demandes: 'Demandes', utilisateurs: 'Comptes', users: 'Comptes', notifications: 'Notifications', compteurs: 'Numérotation', rdv: 'Rendez-vous', audit: 'Journal d’audit' };
function rapport(declencheur, acteur) {
  const t0 = Date.now();
  const chaine = verifierChaine();
  const anomalies = controles();
  const parGravite = anomalies.reduce((o, a) => ((o[a.gravite] = (o[a.gravite] || 0) + 1), o), {});
  const r = docs.put('integrite', { id: uid('ctl'), date: maintenant(), declencheur, par: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Contrôle automatique',
    chaine, anomalies, total: anomalies.length, reparables: anomalies.filter((a) => a.reparation).length, parGravite, dureeMs: Date.now() - t0 });
  const anciens = docs.tous('integrite');
  for (const x of anciens.slice(0, Math.max(0, anciens.length - 20))) docs.suppr('integrite', x.id);
  if (!chaine.intacte) incidents.signaler({ cle: 'integrite:chaine', titre: 'Registre d’audit altéré', gravite: 'critique', parties: ['Journal d’audit'], sujet: { type: 'donnees', libelle: 'Registre d’audit' },
    evenement: chaine.texte, action: 'Rapport d’intégrité conservé ; ne plus modifier la base et comparer avec la dernière sauvegarde (page Sauvegardes).' });
  const graves = anomalies.filter((a) => a.gravite === 'haute' || a.gravite === 'critique');
  if (graves.length) incidents.signaler({ cle: 'integrite:donnees', titre: 'Données métier incohérentes', gravite: graves.some((a) => a.gravite === 'critique') ? 'critique' : 'haute',
    parties: [...new Set(graves.map((a) => PARTIES[a.collection] || a.collection))], sujet: { type: 'donnees', libelle: 'Données métier' },
    evenement: `${graves.length} incohérence(s) importante(s) : ${[...new Set(graves.map((a) => a.code))].join(', ')}`, action: `${graves.filter((a) => a.reparation).length} réparation(s) sûre(s) proposée(s) à l’administrateur.` });
  return r;
}

/* ---------- Routes (administrateur) ---------- */
const admin = A.exigerRole('admin');
router.get('/api/integrite', admin, (req, res) => {
  const l = docs.tous('integrite');
  res.set('Cache-Control', 'no-store');
  res.json({ dernier: l[l.length - 1] || null, historique: l.slice(-10).reverse().map((r) => ({ id: r.id, date: r.date, declencheur: r.declencheur, par: r.par, total: r.total, intacte: r.chaine.intacte })),
    prochainControle: prochain ? new Date(prochain).toISOString() : null, intervalleHeures: INTERVALLE / 3600e3 });
});
router.get('/api/integrite/chaine', admin, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(verifierChaine()); });
// Démonstration sans rien abîmer : vérifie la chaîne comme si une entrée avait été modifiée (en mémoire seulement)
router.post('/api/integrite/chaine/simulation', admin, (req, res) => {
  const n = q.compte.get().n;
  if (!n) return res.status(400).json({ erreur: 'Le registre est vide.' });
  const seq = Math.max(1, Math.min(n, Math.round(Number((req.body || {}).entree) || Math.ceil(n / 2))));
  res.json(verifierChaine({ seq }));
});
router.post('/api/integrite/controler', admin, (req, res) => {
  const r = rapport('manuel', req.user);
  audit(req.user, { categorie: 'securite', action: 'Contrôle d’intégrité lancé', objetId: r.id, objetLibelle: 'Intégrité des données', apres: `${r.total} anomalie(s)`, motif: r.chaine.texte });
  res.json(r);
});
router.post('/api/integrite/reparer', admin, (req, res) => {
  const ids = new Set((Array.isArray((req.body || {}).ids) ? req.body.ids : []).map(String).slice(0, 500));
  if (!ids.size) return res.status(400).json({ erreur: 'Choisissez au moins une réparation.' });
  const faites = [], refusees = [];
  for (const a of controles().filter((x) => ids.has(x.id))) {
    if (!a.reparation) { refusees.push(a.id); continue; }
    let ok = false;
    try { ok = reparer(a, req.user); } catch (e) { console.error('[intégrité] réparation', e.message); }
    if (ok) {
      faites.push(a.id);
      audit(req.user, { categorie: 'securite', action: 'Réparation d’intégrité appliquée', objetId: a.docId, objetLibelle: `${a.collection} · ${a.code}`, avant: a.detail, apres: a.reparation.libelle, motif: 'Confirmée par l’administrateur depuis le Centre de sécurité' });
    } else refusees.push(a.id);
  }
  const r = rapport('apres-reparation', req.user);
  res.json({ ok: true, faites, refusees, rapport: r });
});

/* ---------- Contrôle périodique ---------- */
const INTERVALLE = Math.max(1, Number(process.env.INTEGRITE_INTERVALLE_HEURES) || 6) * 3600e3;
let prochain = Date.now() + 30e3;
function planifier() {
  setTimeout(function tour() {
    try { rapport('auto', null); } catch (e) { console.error('[intégrité] contrôle', e.message); }
    prochain = Date.now() + INTERVALLE;
    setTimeout(tour, INTERVALLE).unref();
  }, 30e3).unref();
}

module.exports = router;
module.exports.initialiser = initialiser;
module.exports.planifier = planifier;
module.exports.verifierChaine = verifierChaine;
module.exports.rescellerApresDemo = rescellerApresDemo;
module.exports.controles = controles;
