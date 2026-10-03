// D06 : publications de la ville (lecture publique, publication réservée agents/admin)
const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { html, safe, fmtDate } = require('../views');
const { ah } = require('../async');

const CATEGORIES = ['Annonce', 'Changement de service', 'Information pratique'];
const latestNews = (n = 50, cat) => (cat
  ? db.all('SELECT * FROM news WHERE category = ? ORDER BY published_at DESC, id DESC LIMIT ?', [cat, n])
  : db.all('SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT ?', [n]));
const newsItem = (n) => safe`<article class="card news"><span class="tag">${n.category}</span><h3><a href="/actualites/${n.id}">${n.title}</a></h3><time>${fmtDate(n.published_at)}</time><p>${n.summary}</p></article>`;

router.get('/actualites', ah(async (req, res) => {
  const cat = CATEGORIES.includes(req.query.categorie) ? req.query.categorie : null;
  const canPublish = req.user && ['agent', 'admin'].includes(req.user.role);
  const items = await latestNews(50, cat);
  res.page({ title: 'Actualités', active: 'news', body: html`
<div class="row-between"><h1>Actualités de la ville</h1>${canPublish ? safe`<a class="btn" href="/actualites/publier">Publier une information</a>` : ''}</div>
<nav class="chips" aria-label="Filtrer par catégorie"><a href="/actualites" class="${!cat ? 'active' : ''}">Toutes</a>${CATEGORIES.map((c) => safe`<a href="/actualites?categorie=${encodeURIComponent(c)}" class="${cat === c ? 'active' : ''}">${c}</a>`)}</nav>
<div class="stack">${items.map(newsItem)}</div>` });
}));

router.get('/actualites/publier', requireRole('agent', 'admin'), (req, res) => {
  res.page({ title: 'Publier', active: 'news', body: html`
<section class="card narrow"><h1>Publier une information</h1>
<form method="post" action="/actualites" class="form">
  <label>Titre<input name="title" required maxlength="150"></label>
  <label>Catégorie<select name="category">${CATEGORIES.map((c) => safe`<option>${c}</option>`)}</select></label>
  <label>Résumé<input name="summary" required maxlength="250"></label>
  <label>Contenu<textarea name="body" rows="8" required></textarea></label>
  <button class="btn">Publier</button>
</form></section>` });
});

router.post('/actualites', requireRole('agent', 'admin'), ah(async (req, res) => {
  const { title, category, summary, body } = req.body;
  if (!title || !summary || !body) return res.redirect('/actualites/publier');
  const info = await db.run('INSERT INTO news (title, category, summary, body, author_id) VALUES (?,?,?,?,?)',
    [title, CATEGORIES.includes(category) ? category : 'Annonce', summary, body, req.user.id]);
  res.redirect(`/actualites/${info.insertId}`);
}));

router.get('/actualites/:id', ah(async (req, res, next) => {
  const n = await db.get('SELECT * FROM news WHERE id = ?', [Number(req.params.id) || 0]);
  if (!n) return next();
  res.page({ title: n.title, active: 'news', body: html`
<p><a href="/actualites">← Toutes les actualités</a></p>
<article class="card"><span class="tag">${n.category}</span><h1>${n.title}</h1><time>Publié le ${fmtDate(n.published_at)}</time><p class="lead">${n.summary}</p>${n.body.split(/\n+/).map((p) => safe`<p>${p}</p>`)}</article>` });
}));

module.exports = router;
module.exports.latestNews = latestNews;
module.exports.newsItem = newsItem;
