// Terra Nova · serveur Express : pages statiques (public/), API JSON (src/modules/api.js), polling de l'API Webcup.
const express = require('express');
const path = require('node:path');
const { chargerUtilisateur, comptesEquipe } = require('./src/auth');
const { semer } = require('./src/seed');
const { startPolling } = require('./src/webcup');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));   // photos de signalement (miniatures ~60 Ko)
app.use(chargerUtilisateur);
app.use(require('./src/modules/api'));
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
