/* Terra Nova — vague 20 (F97-F100) : montage des modules et résumé léger lu par toutes les pages (assets/js/vague20.js).
   GET /api/vague20/resume : lignes interrompues et lignes suivies (tiroir « Alertes »), compte partenaire (lien « Espace
   partenaire »), pour le personnel : événements de sécurité non vus et offres à vérifier (pastilles du menu). */
const express = require('express');
const A = require('../auth');
const { docs } = require('../donnees');
const mobilite = require('./mobilite');
const usage = require('./usage');
const partenaires = require('./partenaires');
const veille = require('./veille-securite');

const router = express.Router();
router.get('/api/vague20/resume', (req, res) => {
  const u = req.user;
  const p = partenaires.partenaireDe(u);
  const staff = A.estPersonnel(u);
  res.set('Cache-Control', 'no-store');
  res.json({ mobilite: mobilite.resume(u), partenaire: p ? { id: p.id, nom: p.nom, statut: p.statut } : null,
    securite: staff ? veille.nonVus(u) : null,
    moderation: staff ? docs.tous('offresPartenaires').filter((o) => (o.moderation || {}).statut === 'en_attente').length : null });
});
router.use(mobilite);
router.use(usage);
router.use(partenaires);
router.use(veille);

// À monter avant l'orientation (vague 18) et la mémoïsation (vague 15) : balise d'usage, offres dans la recherche
const avant = [usage.balise, partenaires.avantRecherche];

module.exports = { router, avant, apresEcriture: usage.apresEcriture };
