// Vague 20 (F97-F100) : données de démonstration chargées une seule fois, y compris sur une base déjà en service.
// - F97 : trois lignes interrompues (N4 jusqu'à 18 h, N1 en panne sur le tronçon nord, N2 : Canal Sud non desservi, montée des
//   eaux). Repère « demo » : tant qu'aucun agent ne les a modifiées ou levées, elles sont renouvelées quand leur fin est passée,
//   pour que la démonstration reste parlante (sans prévenir les abonnés). Une interruption modifiée par un agent ne l'est plus.
// - F99 : deux partenaires (comptes lumen@nova.test et velo@nova.test, mot de passe Partenaire2026), six offres dont cinq
//   vérifiées et publiées et une en attente de vérification, deux réservations.
// - F98 : historique anonyme de 90 jours de compteurs d'usage (src/modules/usage.js).
// - F100 : quelques événements de sécurité récents (repère seed: 'v20').
const { docs, maintenant } = require('./donnees');
const { creerCompte, parEmail } = require('./auth');
const mobilite = require('./modules/mobilite');

function semerMobilite() {
  if (docs.get('interruptions', 'INT-demo-n4') || !docs.compte('services')) return false;
  const h = (n) => new Date(Date.now() + n * 3600e3).toISOString();
  const fin18 = mobilite.aHeureVille(Date.parse(mobilite.aHeureVille(0, '18:00')) - Date.now() > 3600e3 ? 0 : 1, '18:00');
  const base = { cree: maintenant(), maj: maintenant(), declarePar: 'Service Mobilité', demo: true, notifie: { debut: true, fin: false }, tad: true };
  docs.put('interruptions', Object.assign({}, base, { id: 'INT-demo-n4', troncons: [{ ligne: 'N4', de: 'kepler', a: 'quai' }], debut: h(-2), fin: fin18, motif: 'travaux',
    precision: 'Travaux de réparation de la voie entre Lycée Kepler et Quai des Arrivées',
    remplacement: { type: 'bus-relais', texte: 'Bus-relais au même arrêt que la navette, signalé par un panneau bleu', frequence: 10, arrets: ['kepler', 'culturel', 'quai'] },
    gabarit: { debutHeures: 2, finHeure: '18:00' } }));
  docs.put('interruptions', Object.assign({}, base, { id: 'INT-demo-n1', troncons: [{ ligne: 'N1', de: 'serres', a: 'observatoire' }], debut: h(-5), fin: mobilite.aHeureVille(2, '20:00'), motif: 'panne',
    precision: 'Navette en panne : réparation en atelier',
    remplacement: { type: 'navette', texte: 'Navette de remplacement (minibus) depuis Parc des Serres', frequence: 20, arrets: ['serres', 'orion', 'observatoire'] },
    gabarit: { debutHeures: 5, finJours: 2 } }));
  docs.put('interruptions', Object.assign({}, base, { id: 'INT-demo-n2', troncons: [{ ligne: 'N2', de: 'canal', a: 'pionniers' }], debut: h(-20), fin: null, motif: 'meteo',
    precision: 'Montée des eaux dans le quartier Sud : l’arrêt Canal Sud n’est plus desservi', remplacement: { type: 'aucun', texte: '', frequence: 15, arrets: [] } }));
  docs.fixerCompteur('interruptions', Math.max(3, (docs.tous('interruptions').length)));
  return true;
}

const PARTENAIRES = [
  { id: 'par-lumen', nom: 'Fondation Lumen Numérique', domaine: 'numerique', description: 'Accompagnement au numérique : ateliers, prêt de matériel et aide aux démarches en ligne.',
    contact: { tel: '01 55 00 18 10', email: 'contact@lumen.test' }, compte: { email: 'lumen@nova.test', prenom: 'Nadia', nom: 'Benali', quartier: 'Centre' } },
  { id: 'par-velo', nom: 'Coopérative Vélo Solidaire', domaine: 'mobilite', description: 'Réparation de vélos à prix libre, location et cours de remise en selle.',
    contact: { tel: '01 55 00 18 20', email: 'atelier@velo-solidaire.test' }, compte: { email: 'velo@nova.test', prenom: 'Hugo', nom: 'Ferrand', quartier: 'Est' } }
];
const OFFRES = [
  { id: 'off-lumen-ateliers', p: 'par-lumen', c: { titre: 'Atelier « Premiers pas sur le numérique »', description: 'En petit groupe, apprenez à utiliser un smartphone ou un ordinateur : envoyer un e-mail, créer un mot de passe sûr, ouvrir un document. Matériel prêté sur place.',
    public: 'Adultes débutants, seniors', conditions: 'Aucune condition. Venir avec son téléphone si possible.', quartier: 'Centre', lieu: 'Médiathèque, salle 2 (Hôtel de ville, niveau 0)', horaires: 'Mardi et jeudi 14h–16h', capacite: 8,
    gratuit: true, prix: '', action: 'reserver', lien: '', tel: '01 55 00 18 10', email: 'contact@lumen.test', serviceId: 'etat-civil', motsCles: 'ordinateur internet smartphone email debutant numerique' },
    d: { statut: 'disponible', placesRestantes: 3 } },
  { id: 'off-lumen-pret', p: 'par-lumen', c: { titre: 'Prêt d’ordinateur portable pour 3 mois', description: 'Un ordinateur portable reconditionné prêté gratuitement pendant 3 mois pour chercher un emploi, suivre une formation ou faire vos démarches.',
    public: 'Demandeurs d’emploi, étudiants, familles sans ordinateur', conditions: 'Habiter Terra Nova. Une pièce d’identité à présenter au retrait.', quartier: 'Toute la ville', lieu: 'Fondation Lumen, Quai des Arrivées', horaires: 'Retrait du lundi au vendredi 9h–12h', capacite: 20,
    gratuit: true, prix: '', action: 'reserver', lien: '', tel: '01 55 00 18 10', email: 'contact@lumen.test', serviceId: 'emploi', motsCles: 'ordinateur pret portable emploi formation' },
    d: { statut: 'complet', placesRestantes: 0, note: 'Nouveaux ordinateurs attendus le mois prochain' } },
  { id: 'off-lumen-demarches', p: 'par-lumen', c: { titre: 'Aide aux démarches en ligne', description: 'Un médiateur numérique vous aide à remplir une démarche en ligne (acte d’état civil, aide sociale, logement) et à scanner vos pièces justificatives.',
    public: 'Tous les habitants', conditions: 'Apporter les documents nécessaires à la démarche.', quartier: 'Sud', lieu: 'Centre social, quartier Sud', horaires: 'Lundi, mercredi, vendredi 9h–12h', capacite: null,
    gratuit: true, prix: '', action: 'demande', lien: '', tel: '', email: '', serviceId: 'social', motsCles: 'aide demarche formulaire scanner piece justificative logement' },
    d: { statut: 'disponible', placesRestantes: null } },
  { id: 'off-velo-reparation', p: 'par-velo', c: { titre: 'Réparation de vélo à prix libre', description: 'Venez réparer votre vélo avec l’aide d’un mécanicien bénévole : crevaison, freins, dérailleur, éclairage. Pièces d’occasion disponibles.',
    public: 'Tous les habitants', conditions: 'Participation libre (pièces neuves au prix coûtant).', quartier: 'Est', lieu: 'Atelier de la coopérative, Zone des Ateliers', horaires: 'Mercredi 15h–19h, samedi 10h–17h', capacite: null,
    gratuit: false, prix: 'Prix libre', action: 'contact', lien: '', tel: '01 55 00 18 20', email: 'atelier@velo-solidaire.test', serviceId: 'transports', motsCles: 'velo reparation crevaison frein mobilite' },
    d: { statut: 'disponible', placesRestantes: null } },
  { id: 'off-velo-selle', p: 'par-velo', c: { titre: 'Cours de remise en selle', description: 'Deux séances pour (ré)apprendre à rouler en ville en sécurité : équilibre, freinage, circulation sur les voies partagées. Vélo et casque prêtés.',
    public: 'Adultes', conditions: 'Savoir tenir sur un vélo n’est pas nécessaire.', quartier: 'Centre', lieu: 'Parvis de la Gare orbitale', horaires: 'Samedi 9h–11h', capacite: 6,
    gratuit: false, prix: '5 € les deux séances', action: 'reserver', lien: '', tel: '01 55 00 18 20', email: 'atelier@velo-solidaire.test', serviceId: 'transports', motsCles: 'velo cours apprendre rouler securite' },
    d: { statut: 'suspendu', placesRestantes: 6, note: 'Moniteur absent', jours: 9 } },
  { id: 'off-velo-location', p: 'par-velo', c: { titre: 'Location de vélo à assistance électrique', description: 'Location à la semaine ou au mois d’un vélo à assistance électrique, entretien compris. Tarif réduit pour les étudiants et les demandeurs d’emploi.',
    public: 'Habitants de 16 ans et plus', conditions: 'Dépôt de garantie restitué au retour du vélo.', quartier: 'Toute la ville', lieu: 'Atelier de la coopérative, Zone des Ateliers', horaires: 'Du mardi au samedi 10h–18h', capacite: 12,
    gratuit: false, prix: '15 € la semaine', action: 'lien', lien: 'https://velo-solidaire.test/location', tel: '01 55 00 18 20', email: '', serviceId: 'transports', motsCles: 'velo electrique location' },
    d: { statut: 'disponible', placesRestantes: 12 }, enAttente: true }
];
function semerPartenaires() {
  if (docs.get('partenaires', 'par-lumen') || !docs.compte('services')) return false;
  const jour = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const comptes = {};
  for (const p of PARTENAIRES) {
    let row = parEmail(p.compte.email);
    if (!row) { creerCompte({ prenom: p.compte.prenom, nom: p.compte.nom, email: p.compte.email, role: 'citoyen', quartier: p.compte.quartier, telephone: '', premiereConnexion: false, profilComplet: true }, 'Partenaire2026'); row = parEmail(p.compte.email); }
    comptes[p.id] = row && row.role === 'citoyen' ? row.doc_id : null;
    const { compte, ...doc } = p;   // eslint-disable-line no-unused-vars
    docs.put('partenaires', Object.assign(doc, { statut: 'actif', comptes: comptes[p.id] ? [comptes[p.id]] : [], cree: maintenant(), valideLe: maintenant(), validePar: 'Coordination Solidaire' }));
  }
  for (const o of OFFRES) {
    const dispo = Object.assign({ prochaineDate: o.d.jours ? jour(o.d.jours) : o.d.statut === 'complet' ? jour(21) : '', note: o.d.note || '', maj: maintenant() }, { statut: o.d.statut, placesRestantes: o.d.placesRestantes });
    docs.put('offresPartenaires', o.enAttente
      ? { id: o.id, partenaireId: o.p, publiee: null, proposition: o.c, cree: maintenant(), maj: maintenant(), moderation: { statut: 'en_attente', soumisLe: maintenant(), soumisPar: 'Hugo Ferrand' }, disponibilite: dispo }
      : { id: o.id, partenaireId: o.p, publiee: o.c, proposition: null, cree: maintenant(), maj: maintenant(), moderation: { statut: 'publiee', par: 'Coordination Solidaire', le: maintenant(), motif: '' },
        verification: { par: 'Coordination Solidaire', le: maintenant() }, disponibilite: dispo });
  }
  // deux réservations de démonstration (habitants de démo)
  const lea = parEmail('citoyen@nova.test'), amina = parEmail('amina@nova.test');
  const dem = [[lea, 'off-lumen-ateliers', 'reservation', 'Je voudrais apprendre à envoyer des photos par e-mail.', 'acceptee', 'Inscription confirmée pour mardi 14h. À bientôt !'],
    [amina, 'off-lumen-pret', 'attente', 'Pour suivre une formation à distance.', 'envoyee', '']];
  for (const [row, offreId, type, message, statut, reponse] of dem) {
    if (!row) continue;
    const u = docs.get('utilisateurs', row.doc_id); const o = OFFRES.find((x) => x.id === offreId);
    if (!u) continue;
    const n = docs.prochainNumero('partenaireDemandes', 0);
    docs.put('partenaireDemandes', { id: 'PAR-' + String(n).padStart(4, '0'), offreId, offreTitre: o.c.titre, partenaireId: o.p, userId: u.id, type, statut, message, reponse, cree: maintenant(),
      habitant: { prenom: u.prenom, initiale: String(u.nom || '').slice(0, 1) + '.', quartier: u.quartier || '' }, partageEmail: '', seed: 'v20' });
  }
  return true;
}

function semer() {
  const r = {};
  try { r.mobilite = semerMobilite(); } catch (e) { console.error('[seed v20] mobilité', e.message); }
  try { r.partenaires = semerPartenaires(); } catch (e) { console.error('[seed v20] partenaires', e.message); }
  try { r.usage = require('./modules/usage').semerHistorique(); } catch (e) { console.error('[seed v20] usage', e.message); }
  try { r.securite = require('./modules/veille-securite').semer(); } catch (e) { console.error('[seed v20] sécurité', e.message); }
  try { mobilite.verifier(); } catch (e) { console.error('[seed v20] renouvellement', e.message); }
  if (Object.values(r).some(Boolean)) console.log('[demo] vague 20 :', Object.entries(r).filter(([, v]) => v).map(([k]) => k).join(', '));
  return r;
}

module.exports = { semer };
