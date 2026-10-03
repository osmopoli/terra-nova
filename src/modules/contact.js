// D04 : contacter les services municipaux, avec confirmation d'envoi
const router = require('express').Router();
const crypto = require('node:crypto');
const db = require('../db');
const { html, safe } = require('../views');
const { listServices } = require('./services');

function form(req, res, { errors = [], values = {} } = {}) {
  const v = { name: req.user?.name, email: req.user?.email, service_slug: req.query.service, ...values };
  res.status(errors.length ? 400 : 200).page({ title: 'Contacter la mairie', active: 'contact', body: html`
<section class="card narrow">
  <h1>Contacter les services municipaux</h1>
  <p class="muted">Une question, une difficulté ? Écrivez-nous. Vous recevrez un numéro de suivi.</p>
  ${errors.length ? safe`<div class="alert error" role="alert"><ul>${errors.map((e) => safe`<li>${e}</li>`)}</ul></div>` : ''}
  <form method="post" action="/contact" class="form">
    <label>Nom<input name="name" required maxlength="100" value="${v.name || ''}"></label>
    <label>E-mail<input type="email" name="email" required value="${v.email || ''}"></label>
    <label>Service concerné<select name="service_slug"><option value="">Je ne sais pas</option>${listServices().map((s) => safe`<option value="${s.slug}" ${s.slug === v.service_slug ? 'selected' : ''}>${s.name}</option>`)}</select></label>
    <label>Objet<input name="subject" required maxlength="150" value="${v.subject || ''}"></label>
    <label>Message<textarea name="body" rows="6" required maxlength="5000">${v.body || ''}</textarea></label>
    <button class="btn">Envoyer ma demande</button>
  </form>
</section>` });
}

router.get('/contact', (req, res) => form(req, res));

router.post('/contact', (req, res) => {
  const { name = '', email = '', service_slug = '', subject = '', body = '' } = req.body;
  const errors = [];
  if (!name.trim()) errors.push('Indiquez votre nom.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Adresse e-mail invalide.');
  if (!subject.trim()) errors.push("Indiquez l'objet de votre demande.");
  if (body.trim().length < 10) errors.push('Votre message doit contenir au moins 10 caractères.');
  if (errors.length) return form(req, res, { errors, values: req.body });
  const reference = `TN-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const svc = listServices().find((s) => s.slug === service_slug);
  db.prepare('INSERT INTO messages (reference, user_id, name, email, service_slug, subject, body) VALUES (?,?,?,?,?,?,?)')
    .run(reference, req.user?.id ?? null, name.trim(), email.trim(), svc ? svc.slug : null, subject.trim(), body.trim());
  res.redirect(`/contact/confirmation/${reference}`);
});

router.get('/contact/confirmation/:ref', (req, res, next) => {
  const m = db.prepare('SELECT reference, subject, email FROM messages WHERE reference = ?').get(req.params.ref);
  if (!m) return next();
  res.page({ title: 'Demande envoyée', active: 'contact', body: html`
<section class="card narrow success-box" role="status">
  <h1>✅ Votre demande a bien été envoyée</h1>
  <p>Numéro de suivi : <strong class="ref">${m.reference}</strong></p>
  <p>Objet : ${m.subject}</p>
  <p class="muted">Un agent municipal va la traiter. Une réponse sera adressée à ${m.email}.</p>
  ${req.user ? safe`<a class="btn" href="/espace">Suivre mes demandes</a>` : safe`<p><a href="/inscription">Créez un compte</a> pour suivre vos demandes en ligne.</p>`}
</section>` });
});

module.exports = router;
