// Accès aux documents métier : chaque document est un objet JSON identique à celui que manipule le navigateur.
const crypto = require('node:crypto');
const db = require('./db');
const { sceller, ouvrir } = require('./chiffrement');   // F69 : champs sensibles chiffrés au repos

const maintenant = () => new Date().toISOString();
const uid = (prefixe) => (prefixe || 'id') + '-' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');

const q = {
  tous: db.prepare('SELECT data FROM docs WHERE col = ? ORDER BY cree'),
  un: db.prepare('SELECT data FROM docs WHERE col = ? AND id = ?'),
  ecrire: db.prepare(`INSERT INTO docs (col, id, data, cree) VALUES (?, ?, ?, ?)
    ON CONFLICT(col, id) DO UPDATE SET data = excluded.data`),
  suppr: db.prepare('DELETE FROM docs WHERE col = ? AND id = ?'),
  viderCol: db.prepare('DELETE FROM docs WHERE col = ?'),
  compte: db.prepare('SELECT COUNT(*) n FROM docs WHERE col = ?'),
  compteur: db.prepare('SELECT valeur FROM compteurs WHERE nom = ?'),
  majCompteur: db.prepare(`INSERT INTO compteurs (nom, valeur) VALUES (?, ?) ON CONFLICT(nom) DO UPDATE SET valeur = excluded.valeur`)
};

const docs = {
  tous: (col) => q.tous.all(col).map((r) => ouvrir(col, JSON.parse(r.data))),
  get: (col, id) => { const r = q.un.get(col, String(id)); return r ? ouvrir(col, JSON.parse(r.data)) : null; },
  put(col, obj) {
    if (!obj.id) obj.id = uid(col.slice(0, 3));
    if (!obj.cree) obj.cree = maintenant();
    q.ecrire.run(col, String(obj.id), JSON.stringify(sceller(col, obj)), obj.cree);
    return obj;
  },
  patch(col, id, patch) {
    const o = docs.get(col, id);
    if (!o) return null;
    return docs.put(col, Object.assign(o, patch, { id: o.id, cree: o.cree }));
  },
  suppr: (col, id) => q.suppr.run(col, String(id)).changes,
  vider: (col) => q.viderCol.run(col),
  compte: (col) => q.compte.get(col).n,
  // Numéro de demande NT-xxxx incrémental et unique
  prochainNumero(nom, depart) {
    const r = q.compteur.get(nom);
    const v = (r ? r.valeur : depart) + 1;
    q.majCompteur.run(nom, v);
    return v;
  },
  fixerCompteur: (nom, v) => q.majCompteur.run(nom, v)
};

// Journal de sécurité (connexions, échecs, verrouillages…) et journal d'audit (F47, F48)
function journal(type, email, detail) {
  docs.put('journal', { id: uid('evt'), date: maintenant(), type, email: String(email || '').toLowerCase(), detail: detail || '' });
}
function audit(acteur, { categorie, action, objetId, objetLibelle, avant, apres, motif }) {
  docs.put('audit', { id: uid('aud'), date: maintenant(), categorie, action, objetId: objetId || '', objetLibelle: objetLibelle || '',
    avant: avant === undefined ? null : avant, apres: apres === undefined ? null : apres, motif: motif || '',
    acteurId: acteur ? acteur.id : null, acteurNom: acteur ? `${acteur.prenom} ${acteur.nom}` : 'Système', acteurRole: acteur ? acteur.role : 'systeme' });
}
function notifier(userId, titre, texte, lien, niveau) {
  return docs.put('notifications', { id: uid('not'), userId, titre, texte, lien: lien || '', niveau: niveau || 'info', lu: false });
}

module.exports = { docs, journal, audit, notifier, uid, maintenant };
