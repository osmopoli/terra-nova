// Vague 17 (F86, F88) : contenus de démonstration chargés une seule fois, y compris sur une base déjà en service.
// - modèles d'export partagés (« Transmission hebdo au Service Qualité ») : identifiant fixe, jamais en double ;
// - une urgence médicale déjà traitée (prise en charge en 3 min, transmise aux secours, close) pour montrer la frise :
//   repère « seed: 'v17' » sur la demande ; rechargée après une réinitialisation de la démonstration (qui vide les demandes).
//   Le numéro NT-xxxx suit le compteur pour ne jamais écraser une vraie demande.
// Aucun incident ni alerte de sécurité inventés : ils naissent de l'activité réelle (src/modules/anomalies.js, integrite.js).
const fs = require('node:fs');
const path = require('node:path');
const { docs } = require('./donnees');
const { parEmail } = require('./auth');

const FICHIER = path.join(__dirname, '..', 'data', 'demo-seed.json');
const absolu = (v, t) => (typeof v === 'string' && /^@-?\d+$/.test(v) ? new Date(t - Number(v.slice(1))).toISOString()
  : Array.isArray(v) ? v.map((x) => absolu(x, t)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolu(x, t)])) : v);
const minutes = (a, b) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 60000));

function semer() {
  try {
    if (!docs.compte('services')) return false;
    const v = absolu(JSON.parse(fs.readFileSync(FICHIER, 'utf8')).vague17 || {}, Date.now());
    let ajout = false;
    for (const m of v.modelesExport || []) {
      if (docs.get('exportsModeles', m.id)) continue;
      const { auteurEmail, ...modele } = m;
      const a = parEmail(auteurEmail);
      docs.put('exportsModeles', Object.assign(modele, { auteurId: a ? a.doc_id : null, cree: new Date().toISOString() }));
      ajout = true;
    }
    if (!docs.tous('demandes').some((d) => d.seed === 'v17')) {
      const existe = (id) => !!(id && docs.get('utilisateurs', id));
      for (const d of v.urgences || []) {
        const { ref, urgence: u, ...dem } = d;
        if (dem.userId && !existe(dem.userId)) dem.userId = null;
        const id = 'NT-' + docs.prochainNumero('demandes', 1040);
        const prise = minutes(u.signaleeLe, u.priseLe);
        docs.put('demandes', Object.assign(dem, { id, seed: 'v17', seedRef: ref,
          historique: [
            { date: dem.cree, statut: 'recue', note: 'Demande enregistrée et transmise au service concerné.', par: 'Système' },
            { date: dem.cree, statut: 'recue', note: 'URGENCE MÉDICALE : traitée hors de la file normale, en priorité absolue. Terra Nova ne remplace pas les secours (15 / 112).', par: 'Système' },
            { date: u.priseLe, statut: 'en_cours', note: 'Urgence médicale : Prise en charge.', par: u.par },
            { date: u.transmiseLe, statut: 'en_cours', note: 'Urgence médicale : Transmise aux secours.', par: u.par },
            { date: u.closeLe, statut: 'traitee', note: 'Urgence médicale : Close. ' + u.noteClose, par: u.par }],
          urgenceMedicale: { statut: 'close', signaleeLe: u.signaleeLe, echeance: new Date(Date.parse(u.signaleeLe) + 5 * 60e3).toISOString(), delaiMinutes: 5, motifs: u.motifs, explicite: u.explicite,
            priseEnCharge: { le: u.priseLe, par: u.par, parId: (parEmail('agent@nova.test') || {}).doc_id || null, minutes: prise }, escalade: null, transmiseLe: u.transmiseLe, closeLe: u.closeLe,
            historique: [
              { date: u.signaleeLe, statut: 'signalee', note: 'Urgence médicale enregistrée : les agents de garde sont alertés immédiatement.', par: 'Système' },
              { date: u.priseLe, statut: 'prise_en_charge', note: `Prise en charge par ${u.par} en ${prise} min.`, par: u.par },
              { date: u.transmiseLe, statut: 'transmise', note: 'Transmise aux secours (SAMU / pompiers).', par: u.par },
              { date: u.closeLe, statut: 'close', note: 'Urgence close. ' + u.noteClose, par: u.par }] } }));
      }
      ajout = true;
    }
    if (ajout) console.log('[demo] contenus de la vague 17 chargés (modèles d’export, urgence médicale traitée)');
    return ajout;
  } catch (e) { console.error('[demo] vague 17', e.message); return false; }
}

module.exports = { semer };
