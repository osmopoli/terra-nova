/* Terra Nova — vague 17 (F85, Centre de cybersécurité) : incidents de sécurité.
   Un incident regroupe ce qui a été observé (événements) et ce que la plateforme a fait (actions) pour un même sujet
   (un compte, une adresse IP, le registre d'audit, les données métier). Un nouvel événement sur le même sujet, tant que
   l'incident est ouvert et récent (2 h), s'ajoute à sa frise au lieu de créer un doublon ; la gravité ne fait que monter.
   L'administrateur le marque « résolu » avec une note (journal d'audit). Collection « incidents », numéros INC-xxxx. */
const { docs, audit, notifier, maintenant } = require('./donnees');
const db = require('./db');

const GRAVITES = ['faible', 'moyenne', 'haute', 'critique'];
const rang = (g) => Math.max(0, GRAVITES.indexOf(g));
const REGROUPER = 2 * 3600e3;

// Prévient les administrateurs (cloche + message en direct F49) pour les incidents hauts et critiques
function prevenirAdmins(inc, texte) {
  const admins = db.prepare("SELECT doc_id FROM users WHERE role = 'admin'").all();
  for (const a of admins) if (a.doc_id) notifier(a.doc_id, `Incident ${inc.id} · ${inc.titre}`, texte, 'agent-securite.html#incidents', inc.gravite === 'critique' ? 'alerte' : 'importante');
}

/* Ouvre un incident ou complète celui déjà ouvert pour la même clé.
   o = { cle, titre, gravite, parties: [..], sujet: { type, libelle }, evenement, action } */
function signaler(o) {
  const t = maintenant();
  const ouverts = docs.tous('incidents').filter((i) => i.statut === 'ouvert' && i.cle === o.cle && Date.now() - Date.parse(i.maj) < REGROUPER);
  let inc = ouverts.pop();
  if (inc) {
    const avant = inc.gravite;
    const gravite = rang(o.gravite) > rang(inc.gravite) ? o.gravite : inc.gravite;
    const parties = [...new Set((inc.parties || []).concat(o.parties || []))];
    const evenements = (inc.evenements || []).concat(o.evenement ? [{ date: t, texte: String(o.evenement).slice(0, 300), gravite: o.gravite }] : []).slice(-60);
    const actions = (inc.actions || []).concat(o.action ? [{ date: t, texte: String(o.action).slice(0, 300) }] : []).slice(-60);
    inc = docs.patch('incidents', inc.id, { gravite, parties, evenements, actions, maj: t });
    if (rang(gravite) > rang(avant) && rang(gravite) >= 2) prevenirAdmins(inc, `Gravité relevée à « ${gravite} » : ${o.evenement || o.titre}`);
    return inc;
  }
  const n = docs.prochainNumero('incidents', 0);
  inc = docs.put('incidents', { id: 'INC-' + String(n).padStart(4, '0'), cree: t, maj: t, cle: o.cle, titre: String(o.titre).slice(0, 160),
    gravite: GRAVITES.includes(o.gravite) ? o.gravite : 'moyenne', parties: o.parties || [], sujet: o.sujet || null, statut: 'ouvert',
    evenements: o.evenement ? [{ date: t, texte: String(o.evenement).slice(0, 300), gravite: o.gravite }] : [],
    actions: o.action ? [{ date: t, texte: String(o.action).slice(0, 300) }] : [] });
  audit(null, { categorie: 'securite', action: 'Incident de sécurité ouvert', objetId: inc.id, objetLibelle: inc.titre, apres: inc.gravite, motif: o.evenement || '' });
  if (rang(inc.gravite) >= 2) prevenirAdmins(inc, o.evenement || inc.titre);
  return inc;
}

function ajouterAction(id, texte) {
  const inc = docs.get('incidents', id);
  if (!inc) return null;
  return docs.patch('incidents', id, { actions: (inc.actions || []).concat([{ date: maintenant(), texte: String(texte).slice(0, 300) }]).slice(-60), maj: maintenant() });
}

function resoudre(id, acteur, note) {
  const inc = docs.get('incidents', id);
  if (!inc) return null;
  const maj = docs.patch('incidents', id, { statut: 'resolu', resoluLe: maintenant(), resoluPar: `${acteur.prenom} ${acteur.nom}`, note: String(note || '').slice(0, 500),
    actions: (inc.actions || []).concat([{ date: maintenant(), texte: `Marqué résolu par ${acteur.prenom} ${acteur.nom}${note ? ' : ' + String(note).slice(0, 200) : ''}` }]) });
  audit(acteur, { categorie: 'securite', action: 'Incident de sécurité résolu', objetId: id, objetLibelle: inc.titre, avant: 'ouvert', apres: 'résolu', motif: String(note || '').slice(0, 300) });
  return maj;
}

module.exports = { signaler, ajouterAction, resoudre, GRAVITES };
