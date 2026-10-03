// Terra Nova · serveur Express : pages statiques (public/), API JSON (src/modules/api.js), polling de l'API Webcup.
const express = require('express');
const path = require('node:path');
const { chargerUtilisateur, comptesEquipe } = require('./src/auth');
const { semer } = require('./src/seed');
const { startPolling } = require('./src/webcup');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback, linklocal, uniquelocal');   // derrière un proxy HTTPS : origine correcte pour les clés d'accès
const bouclier = require('./src/bouclier');   // vague 13 (F69) : en-têtes stricts, anti-CSRF, limitation de débit
app.use(bouclier.avant(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));   // photos de signalement (miniatures ~60 Ko)
app.use(chargerUtilisateur);

// Surveillance de la prod (ne pas supprimer ni modifier) : même forme que l'ancienne API.
app.get('/api/health', (req, res) => {
  let database = 'ok';
  try { require('./src/db').prepare('SELECT 1').get(); } catch { database = 'error'; }
  res.status(database === 'ok' ? 200 : 503).json({ status: database === 'ok' ? 'ok' : 'degraded', service: 'terra-nova', database, time: new Date().toISOString() });
});
app.use('/api', require('./src/statique').jsonCompresse);   // F58 : réponses JSON compressées
app.use(bouclier.apres);   // vague 13 (F69, F70) : validation des entrées, filtrage des champs réservés, journal des refus
app.use(require('./src/modules/formulaires').garde);   // vague 16 : formulaires protégés contre les robots (F81), envois sans doublon (F82)
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
app.use(require('./src/statique').statique(path.join(__dirname, 'public')));   // F58 : fichiers compressés + cache navigateur
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use('/api', (req, res) => res.status(404).json({ erreur: 'Route inconnue.' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(err.type === 'entity.too.large' ? 413 : 400).json({ erreur: 'Données refusées : format inattendu.' });   // F69
  console.error(err);
  res.status(500).json({ erreur: 'Une erreur est survenue. Merci de réessayer.' });
});

semer();
comptesEquipe();
startPolling();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Terra Nova sur http://localhost:${port}`));
