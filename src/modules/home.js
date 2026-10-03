// D07 : page d'accueil hiérarchisée
const router = require('express').Router();
const { html, safe } = require('../views');
const { listServices, serviceCard } = require('./services');
const { latestNews, newsItem } = require('./news');

router.get('/', (req, res) => {
  const u = req.user;
  res.page({ active: 'home', body: html`
<section class="hero">
  <h1>Bienvenue sur la plateforme citoyenne de Terra Nova</h1>
  <p class="lead">Vos démarches, les services de la ville et les informations municipales, au même endroit.</p>
  <div class="actions">
    ${u ? safe`<a class="btn" href="/espace">Accéder à mon espace</a>` : safe`<a class="btn" href="/inscription">Créer mon compte</a><a class="btn ghost" href="/connexion">Se connecter</a>`}
    <a class="btn ghost" href="/contact">Contacter la mairie</a>
  </div>
</section>
<section aria-labelledby="quick"><h2 id="quick">Que souhaitez-vous faire ?</h2>
  <div class="grid quick">
    <a class="card quick-link" href="/services"><strong>Trouver un service</strong><span>État civil, urbanisme, écoles…</span></a>
    <a class="card quick-link" href="/contact"><strong>Poser une question</strong><span>Écrire aux services municipaux</span></a>
    <a class="card quick-link" href="/actualites"><strong>S'informer</strong><span>Annonces et infos pratiques</span></a>
    <a class="card quick-link" href="${u ? '/espace' : '/inscription'}"><strong>Suivre mes démarches</strong><span>Mon espace personnel</span></a>
  </div>
</section>
<section aria-labelledby="svc"><div class="row-between"><h2 id="svc">Services principaux</h2><a href="/services">Tous les services →</a></div>
  <div class="grid">${listServices().slice(0, 6).map(serviceCard)}</div>
</section>
<section aria-labelledby="news"><div class="row-between"><h2 id="news">Dernières actualités</h2><a href="/actualites">Toutes les actualités →</a></div>
  <div class="grid">${latestNews(3).map(newsItem)}</div>
</section>` });
});

module.exports = router;
