// Terra Nova · serveur Express : pages statiques (public/), API JSON (src/modules/api.js), polling de l'API Webcup.
const express = require('express');
const path = require('node:path');
const { chargerUtilisateur, comptesEquipe } = require('./src/auth');
const { semer } = require('./src/seed');
const { startPolling } = require('./src/webcup');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback, linklocal, uniquelocal');   // derrière un proxy HTTPS : origine correcte pour les clés d'accès
app.use(express.json({ limit: '1mb' }));   // photos de signalement (miniatures ~60 Ko)
app.use(chargerUtilisateur);

// Surveillance de la prod (ne pas supprimer ni modifier) : même forme que l'ancienne API.
app.get('/api/health', (req, res) => {
  let database = 'ok';
  try { require('./src/db').prepare('SELECT 1').get(); } catch { database = 'error'; }
  res.status(database === 'ok' ? 200 : 503).json({ status: database === 'ok' ? 'ok' : 'degraded', service: 'terra-nova', database, time: new Date().toISOString() });
});
app.use('/api', require('./src/statique').jsonCompresse);   // F58 : réponses JSON compressées
app.use(require('./src/modules/api'));
app.use(require('./src/renfort').router);   // vague 9 : clés d'accès, deux étapes, appareils
app.use(require('./src/modules/sobriete'));   // vague 10 : diagnostic de sobriété (F57)
app.use(require('./src/modules/participation'));   // vague 12 : consultations, avis, projets, idées (F65-F68)
app.use(require('./src/statique').statique(path.join(__dirname, 'public')));   // F58 : fichiers compressés + cache navigateur
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ erreur: 'Une erreur est survenue. Merci de réessayer.' });
});

semer();
comptesEquipe();
startPolling();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Terra Nova sur http://localhost:${port}`));
