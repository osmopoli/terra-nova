// Vague 15 (F79, F80) : demandes de démonstration aux sujets variés (tri par sujet côté habitant) et aux priorités
// différentes (dossier critique, correction motivée par un agent, simple question). Chargées une seule fois, y compris
// sur une base déjà en service : le repère « seed: 'v15' » sur les demandes évite tout doublon ; après une
// réinitialisation de la démonstration (qui vide les demandes), elles sont rechargées. Les numéros NT-xxxx suivent le
// compteur pour ne jamais écraser une vraie demande.
const fs = require('node:fs');
const path = require('node:path');
const { docs } = require('./donnees');
const { parEmail } = require('./auth');

const FICHIER = path.join(__dirname, '..', 'data', 'demo-seed.json');
const absolu = (v, t) => (typeof v === 'string' && /^@-?\d+$/.test(v) ? new Date(t - Number(v.slice(1))).toISOString()
  : Array.isArray(v) ? v.map((x) => absolu(x, t)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolu(x, t)])) : v);

function semer() {
  try {
    if (!docs.compte('services')) return false;   // base pas encore initialisée
    if (docs.tous('demandes').some((d) => d.seed === 'v15')) return false;
    const v = absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')).vague15 || {}, Date.now());
    const existe = (id) => !!(id && docs.get('utilisateurs', id));
    for (const d of v.demandes || []) {
      const { ref, historique, prioriteDossier, ...dem } = d;
      if (dem.userId && !existe(dem.userId)) dem.userId = null;
      const id = 'NT-' + docs.prochainNumero('demandes', 1040);
      const doc = Object.assign(dem, { id, seed: 'v15', seedRef: ref,
        historique: [{ date: dem.cree, statut: 'recue', note: 'Demande enregistrée et transmise au service concerné.', par: 'Système' }].concat(historique || []) });
      if (prioriteDossier) {
        const agent = parEmail(prioriteDossier.email);
        const { email, ...p } = prioriteDossier;   // eslint-disable-line no-unused-vars
        doc.prioriteDossier = Object.assign(p, { parId: agent ? agent.doc_id : null });
        docs.put('audit', { id: 'aud-v15-' + ref, date: p.date, categorie: 'demande', action: 'Priorité du dossier modifiée', objetId: id, objetLibelle: dem.objet,
          avant: 'haute', apres: p.niveau, motif: p.justification, acteurId: agent ? agent.doc_id : null, acteurNom: p.par, acteurRole: 'agent', cree: p.date });
      }
      docs.put('demandes', doc);
    }
    console.log('[demo] demandes de la vague 15 chargées (sujets variés, priorités)');
    return true;
  } catch (e) { console.error('[demo] vague 15', e.message); return false; }
}

module.exports = { semer };
