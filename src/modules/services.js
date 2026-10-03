// D05 : présentation des services municipaux
const router = require('express').Router();
const db = require('../db');
const { html, safe } = require('../views');

const listServices = () => db.prepare('SELECT * FROM services ORDER BY sort_order').all();
const serviceCard = (s) => safe`<a class="card service" href="/services/${s.slug}"><span class="icon" aria-hidden="true">${s.icon}</span><h3>${s.name}</h3><p>${s.summary}</p></a>`;

router.get('/services', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const services = listServices().filter((s) => !q || `${s.name} ${s.summary} ${s.details}`.toLowerCase().includes(q));
  res.page({ title: 'Services municipaux', active: 'services', body: html`
<h1>Services municipaux</h1>
<p class="lead">Trouvez le service qui correspond à votre besoin.</p>
<form class="search" method="get"><label class="sr-only" for="q">Rechercher un service</label><input id="q" name="q" placeholder="Ex. : passeport, encombrants, cantine…" value="${q}"><button class="btn">Rechercher</button></form>
<div class="grid">${services.length ? services.map(serviceCard) : safe`<p>Aucun service ne correspond à « ${q} ».</p>`}</div>` });
});

router.get('/services/:slug', (req, res, next) => {
  const s = db.prepare('SELECT * FROM services WHERE slug = ?').get(req.params.slug);
  if (!s) return next();
  res.page({ title: s.name, active: 'services', body: html`
<p><a href="/services">← Tous les services</a></p>
<article class="card">
  <h1><span aria-hidden="true">${s.icon}</span> ${s.name}</h1>
  <p class="lead">${s.summary}</p>
  <p>${s.details}</p>
  <dl class="facts"><dt>Horaires</dt><dd>${s.hours}</dd><dt>Contact</dt><dd>${s.contact}</dd></dl>
  <a class="btn" href="/contact?service=${s.slug}">Contacter ce service</a>
</article>` });
});

module.exports = router;
module.exports.listServices = listServices;
module.exports.serviceCard = serviceCard;
