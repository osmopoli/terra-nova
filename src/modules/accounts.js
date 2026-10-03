// D01 : création de compte · D03 : connexion / déconnexion
const router = require('express').Router();
const { createUser, findUserByEmail, verifyPassword, createSession, destroySession } = require('../auth');
const { html, safe } = require('../views');
const { ah } = require('../async');

const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/espace');
const errorBox = (errors) => (errors.length ? safe`<div class="alert error" role="alert"><ul>${errors.map((e) => safe`<li>${e}</li>`)}</ul></div>` : '');

function signupForm(res, { errors = [], values = {} } = {}) {
  res.status(errors.length ? 400 : 200).page({ title: 'Créer un compte', active: 'signup', body: html`
<section class="card narrow">
  <h1>Créer mon compte habitant</h1>
  <p class="muted">Un compte vous donne accès à votre espace personnel et au suivi de vos démarches.</p>
  ${errorBox(errors)}
  <form method="post" action="/inscription" class="form">
    <label>Nom complet<input name="name" required maxlength="100" autocomplete="name" value="${values.name || ''}"></label>
    <label>Adresse e-mail<input type="email" name="email" required autocomplete="email" value="${values.email || ''}"></label>
    <label>Mot de passe <small>(8 caractères minimum)</small><input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
    <label>Confirmer le mot de passe<input type="password" name="password2" required minlength="8" autocomplete="new-password"></label>
    <button class="btn">Créer mon compte</button>
  </form>
  <p>Déjà inscrit ? <a href="/connexion">Se connecter</a></p>
</section>` });
}

router.get('/inscription', (req, res) => (req.user ? res.redirect('/espace') : signupForm(res)));

router.post('/inscription', ah(async (req, res) => {
  const { name = '', email = '', password = '', password2 = '' } = req.body;
  const errors = [];
  if (!name.trim()) errors.push('Indiquez votre nom.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Adresse e-mail invalide.');
  if (password.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  if (password !== password2) errors.push('Les deux mots de passe ne correspondent pas.');
  if (!errors.length && (await findUserByEmail(email))) errors.push('Un compte existe déjà avec cette adresse.');
  if (errors.length) return signupForm(res, { errors, values: { name, email } });
  const id = await createUser({ name, email, password, role: 'citoyen' }); // l'inscription publique crée toujours un citoyen
  await createSession(res, id);
  res.redirect('/espace?bienvenue=1');
}));

function loginForm(req, res, { error, email = '' } = {}) {
  res.status(error ? 401 : 200).page({ title: 'Connexion', active: 'login', body: html`
<section class="card narrow">
  <h1>Se connecter</h1>
  ${error ? safe`<div class="alert error" role="alert">${error}</div>` : ''}
  <form method="post" action="/connexion" class="form">
    <input type="hidden" name="next" value="${safeNext(req.query.next || req.body?.next)}">
    <label>Adresse e-mail<input type="email" name="email" required autocomplete="email" value="${email}"></label>
    <label>Mot de passe<input type="password" name="password" required autocomplete="current-password"></label>
    <button class="btn">Se connecter</button>
  </form>
  <p>Pas encore de compte ? <a href="/inscription">Créer un compte</a></p>
</section>` });
}

router.get('/connexion', (req, res) => (req.user ? res.redirect('/espace') : loginForm(req, res)));

router.post('/connexion', ah(async (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return loginForm(req, res, { error: 'E-mail ou mot de passe incorrect.', email });
  await createSession(res, user.id);
  const fallback = user.role === 'citoyen' ? '/espace' : '/agent';
  res.redirect(req.body.next && req.body.next !== '/espace' ? safeNext(req.body.next) : fallback);
}));

router.post('/deconnexion', ah(async (req, res) => {
  await destroySession(req, res);
  res.redirect('/');
}));

module.exports = router;
