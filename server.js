// Terra Nova · serveur Express : pages statiques (public/), API JSON (src/modules/api.js), polling de l'API Webcup.
const express = require('express');
const path = require('node:path');
const { chargerUtilisateur, comptesEquipe } = require('./src/auth');
const { semer } = require('./src/seed');
const { startPolling } = require('./src/webcup');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback, linklocal, uniquelocal');   // derrière un proxy HTTPS : origine correcte pour les clés d'accès
const charge = require('./src/charge');   // vague 15 (F77, F78) : mesure de la charge, délestage, file équitable, mémoïsation
app.use(charge.mesurer);
const bouclier = require('./src/bouclier');   // vague 13 (F69) : en-têtes stricts, anti-CSRF, limitation de débit
app.use(bouclier.avant(path.join(__dirname, 'public')));
app.use(charge.proteger);   // vague 15 : l'essentiel passe toujours, le non essentiel attend quand le serveur est surchargé
app.use(express.json({ limit: '1mb' }));   // photos de signalement (miniatures ~60 Ko)
/* Vague 19 (F93, F94) : lecture de session protégée (base en panne → visiteur), lectures essentielles servies depuis la dernière
   copie bonne pendant un incident (src/continuite.js) */
const continuite = require('./src/continuite');
app.use(continuite.contexte(chargerUtilisateur));
app.use(continuite.secours);
/* Vague 17 (F85) : registre d'audit scellé (chargé avant toute écriture d'audit) et surveillance de l'activité inhabituelle */
const integrite = require('./src/modules/integrite');
app.use(require('./src/modules/anomalies').surveiller);

// Surveillance de la prod (ne pas supprimer ni modifier) : même forme que l'ancienne API.
app.get('/api/health', (req, res) => {
  let database = 'ok';
  try { require('./src/db').prepare('SELECT 1').get(); } catch { database = 'error'; }
  res.status(database === 'ok' ? 200 : 503).json({ status: database === 'ok' ? 'ok' : 'degraded', service: 'terra-nova', database, time: new Date().toISOString() });
});
app.use('/api', require('./src/statique').jsonCompresse);   // F58 : réponses JSON compressées
app.use(require('./src/etag-api').etagApi);   // vague 19 (F95) : JSON inchangé → 304 (If-None-Match)
app.use(bouclier.apres);   // vague 13 (F69, F70) : validation des entrées, filtrage des champs réservés, journal des refus
/* Vague 18 (D10, F89-F92) : recherche globale, assistant d'orientation, langage clair. Monté avant la mémoïsation de la vague 15 :
   un message à l'assistant (POST) n'est pas une écriture et ne doit pas vider le cache des autres lectures. */
/* Vague 20 (F98, F99) : balise d'usage anonyme et offres des partenaires dans la recherche, avant l'orientation et la mémoïsation */
const vague20 = require('./src/modules/vague20');
app.use(vague20.avant);
const orientation = require('./src/modules/orientation');
app.use(orientation);
app.use(require('./src/modules/formulaires').garde);   // vague 16 : formulaires protégés contre les robots (F81), envois sans doublon (F82)
app.use(charge.memo);   // vague 15 : lectures chaudes (GET /api/etat…) mémorisées par profil, invalidées à chaque écriture
app.use(charge.router);
app.use(continuite.router);   // vague 19 (F93-F95) : paquet essentiel, résumé personnel, « pouls », incident simulé
app.use(require('./src/modules/essentiel').router);   // vague 19 (F94) : page « Infos essentielles » (/essentiel), favicon   // vague 15 : GET /api/charge (public), /api/charge/details, POST /api/charge/forcer (admin)
app.use(require('./src/modules/priorites'));   // vague 15 : priorité des dossiers pour les agents (F80)
const seedVague15 = require('./src/seed-vague15');
app.post('/api/demo/reinitialiser', (req, res, next) => { res.on('finish', () => { if (res.statusCode === 200) seedVague15.semer(); }); next(); });
/* Vague 17 : urgence médicale repérée au dépôt (F86) ; après une réinitialisation de la démo, registre rescellé et contenus rechargés */
app.use(require('./src/modules/urgences').avantCreation);
const seedVague17 = require('./src/seed-vague17');
app.post('/api/demo/reinitialiser', (req, res, next) => { res.on('finish', () => { if (res.statusCode === 200) { seedVague17.semer(); integrite.rescellerApresDemo(req.user); } }); next(); });
const seedVague20 = require('./src/seed-vague20');
app.post('/api/demo/reinitialiser', (req, res, next) => { res.on('finish', () => { if (res.statusCode === 200) seedVague20.semer(); }); next(); });
app.use(vague20.apresEcriture);   // vague 20 (F98) : demandes et rendez-vous comptés (compteurs anonymes) à leur enregistrement
app.use(require('./src/modules/api'));
app.use(require('./src/renfort').router);   // vague 9 : clés d'accès, deux étapes, appareils
app.use(require('./src/modules/sobriete'));   // vague 10 : diagnostic de sobriété (F57)
app.use(require('./src/modules/simple'));   // vague 11 : version simple et rapide des pages essentielles (F62)
app.use(require('./src/modules/participation'));   // vague 12 : consultations, avis, projets, idées (F65-F68)
app.use(require('./src/modules/securite'));   // vague 13 : centre de sécurité, habilitations (F69, F70)
app.use(require('./src/modules/accueil'));   // vague 13 : comptes sans e-mail, guide d'arrivée (F71, F72)
app.use(require('./src/modules/officiel'));   // vague 14 : message officiel du Haut Conseil (F73)
app.use(require('./src/modules/associations'));   // vague 14 : associations partenaires (F74)
app.use(require('./src/modules/doublons'));   // vague 14 : demandes semblables, rattachement, attention (F75)
app.use(require('./src/modules/avis-services'));   // vague 14 : avis après un service, reçu COM-xxxx (F76)
app.use(require('./src/modules/formulaires'));   // vague 16 : jetons de formulaire, centre anti-robots (F81, F82)
app.use(require('./src/modules/accuses'));   // vague 16 : accusés de réception vérifiables (F83)
app.use(require('./src/modules/echanges'));   // vague 16 : réponses des agents, fil d'échanges (F84)
/* Vague 17 : intégrité et incidents (F85), urgences médicales (F86), sauvegardes vérifiées (F87), exports (F88) */
app.use(integrite);
app.use(require('./src/modules/anomalies'));
app.use(require('./src/modules/urgences'));
const sauvegardes = require('./src/modules/sauvegardes');
app.use(sauvegardes);
app.use(require('./src/modules/exports'));
/* Vague 20 : lignes interrompues (F97), usage des services (F98), offres des partenaires (F99), événements de sécurité (F100) */
app.use(vague20.router);
app.use(require('./src/statique').statique(path.join(__dirname, 'public')));   // F58 : fichiers compressés + cache navigateur
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use(continuite.erreur);   // vague 19 (F93) : panne de la base → 503 clair ou page essentielle, jamais 500
app.use('/api', (req, res) => res.status(404).json({ erreur: 'Route inconnue.' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(err.type === 'entity.too.large' ? 413 : 400).json({ erreur: 'Données refusées : format inattendu.' });   // F69
  console.error(err);
  res.status(500).json({ erreur: 'Une erreur est survenue. Merci de réessayer.' });
});

integrite.initialiser();   // vague 17 : premier scellement du registre d'audit (base déjà en service comprise), avant toute nouvelle écriture
semer();
seedVague15.semer();   // vague 15 : données de démonstration ajoutées une seule fois, y compris sur une base déjà en service
comptesEquipe();
startPolling();
seedVague17.semer();   // vague 17 : modèles d'export, urgence médicale traitée (une seule fois)
orientation.semer();   // vague 18 (F89) : versions en langage clair, ajoutées une seule fois, jamais écrasées
continuite.semer();   // vague 19 (F93, F94) : numéros d'urgence, contacts utiles et consignes (une seule fois)
seedVague20.semer();   // vague 20 : interruptions, partenaires et offres, historique d'usage, événements de sécurité (une seule fois)
require('./src/modules/mobilite').planifier();   // vague 20 (F97) : abonnés prévenus au début et à la fin d'une interruption
integrite.planifier();   // vague 17 : contrôle d'intégrité 30 s après le démarrage puis toutes les 6 h
sauvegardes.planifier();   // vague 17 : sauvegarde automatique quotidienne + rétention

const port = Number(process.env.PORT) || 3000;
charge.regler(app.listen(port, () => console.log(`Terra Nova sur http://localhost:${port}`)));
