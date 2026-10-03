// D08 : profils citoyen / agent / administrateur, gestion des rôles (fonction sensible, admin uniquement)
const router = require('express').Router();
const db = require('../db');
const { requireRole, ROLES, ROLE_LABELS, createUser, findUserByEmail } = require('../auth');
const { html, safe, fmtDate } = require('../views');
const { ah } = require('../async');

const admin = requireRole('admin');

router.get('/admin', admin, ah(async (req, res) => {
  const users = await db.all('SELECT id, name, email, role, created_at FROM users ORDER BY role DESC, created_at');
  const byRole = Object.fromEntries(ROLES.map((r) => [r, users.filter((u) => u.role === r).length]));
  res.page({ title: 'Administration', active: 'admin', body: html`
<h1>Administration des comptes</h1>
${req.query.msg ? safe`<div class="alert success" role="status">${req.query.msg}</div>` : ''}
<section class="kpis">${ROLES.map((r) => safe`<div class="kpi"><span>${byRole[r]}</span>${ROLE_LABELS[r]}s</div>`)}</section>
<section class="card"><h2>Utilisateurs</h2>
<table class="table"><thead><tr><th>Nom</th><th>E-mail</th><th>Inscrit le</th><th>Profil</th></tr></thead><tbody>
${users.map((u) => safe`<tr><td>${u.name}</td><td>${u.email}</td><td>${fmtDate(u.created_at)}</td><td>
  ${u.id === req.user.id ? safe`<span class="badge role-${u.role}">${ROLE_LABELS[u.role]}</span> (vous)` : safe`<form method="post" action="/admin/users/${u.id}/role" class="inline-form">
    <select name="role" aria-label="Profil de ${u.name}">${ROLES.map((r) => safe`<option value="${r}" ${r === u.role ? 'selected' : ''}>${ROLE_LABELS[r]}</option>`)}</select>
    <button class="btn small">Enregistrer</button></form>`}</td></tr>`)}
</tbody></table></section>
<section class="card narrow"><h2>Créer un compte agent</h2>
<form method="post" action="/admin/users" class="form">
  <label>Nom<input name="name" required></label><label>E-mail<input type="email" name="email" required></label>
  <label>Mot de passe provisoire<input type="password" name="password" minlength="8" required></label>
  <label>Profil<select name="role">${ROLES.map((r) => safe`<option value="${r}" ${r === 'agent' ? 'selected' : ''}>${ROLE_LABELS[r]}</option>`)}</select></label>
  <button class="btn">Créer</button>
</form></section>` });
}));

router.post('/admin/users/:id/role', admin, ah(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id || !ROLES.includes(req.body.role)) return res.redirect('/admin');
  await db.run('UPDATE users SET role = ? WHERE id = ?', [req.body.role, id]);
  await db.run('DELETE FROM sessions WHERE user_id = ?', [id]); // force la reconnexion avec les nouveaux droits
  res.redirect('/admin?msg=' + encodeURIComponent('Profil mis à jour.'));
}));

router.post('/admin/users', admin, ah(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 8 || !ROLES.includes(role) || (await findUserByEmail(email))) {
    return res.redirect('/admin?msg=' + encodeURIComponent('Création impossible : vérifiez les champs ou un compte existe déjà.'));
  }
  await createUser({ name, email, password, role });
  res.redirect('/admin?msg=' + encodeURIComponent('Compte créé.'));
}));

module.exports = router;
