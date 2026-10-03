const express = require('express');
const path = require('node:path');
const { loadUser, seedAccounts } = require('./src/auth');
const { layout, html } = require('./src/views');
const { seedContent } = require('./src/seed');
const { startPolling } = require('./src/webcup');

const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(loadUser);

// Helpers de rendu disponibles dans tous les modules
app.use((req, res, next) => {
  res.page = (opts) => res.send(layout({ user: req.user, ...opts }));
  res.render403 = () => res.page({ title: 'Accès refusé', body: html`<section class="card narrow"><h1>Accès refusé</h1><p>Votre profil ne permet pas d'accéder à cette page.</p><a class="btn" href="/">Retour à l'accueil</a></section>` });
  next();
});

// Chaque demande de l'API = un module. Ajouter une vague = ajouter un fichier dans src/modules.
for (const mod of ['home', 'accounts', 'services', 'news', 'contact', 'espace', 'agent', 'veille', 'admin']) {
  app.use(require(`./src/modules/${mod}`));
}

app.use((req, res) => res.status(404).page({ title: 'Page introuvable', body: html`<section class="card narrow"><h1>Page introuvable</h1><a class="btn" href="/">Retour à l'accueil</a></section>` }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).page({ title: 'Erreur', body: html`<section class="card narrow"><h1>Une erreur est survenue</h1><p>Merci de réessayer.</p></section>` });
});

seedAccounts();
seedContent();
startPolling();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Terra Nova sur http://localhost:${port}`));
