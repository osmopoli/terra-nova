// F34 : administration des comptes citoyens par les agents (recherche, consultation, désactivation / réactivation)
const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { html, safe, fmtDate } = require('../views');

const staff = requireRole('agent', 'admin');

// Jamais de password_hash dans les résultats ; seuls les comptes citoyens sont gérables ici.
function search(q = '') {
  const like = `%${String(q).trim().replace(/[!%_]/g, '!$&')}%`;
  return db.prepare(`SELECT id, name, email, disabled, created_at,
      (SELECT COUNT(*) FROM messages m WHERE m.user_id = users.id) AS messages_count
    FROM users WHERE role = 'citoyen' AND (name LIKE ? ESCAPE '!' OR email LIKE ? ESCAPE '!')
    ORDER BY created_at DESC LIMIT 200`).all(like, like);
}

function setDisabled(id, disabled) {
  const info = db.prepare("UPDATE users SET disabled = ? WHERE id = ? AND role = 'citoyen'").run(disabled, id);
  if (info.changes && disabled) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  return info.changes > 0;
}

router.get('/api/citoyens', staff, (req, res) => {
  res.json({ citoyens: search(req.query.q).map((u) => ({ ...u, disabled: !!u.disabled })) });
});

for (const [action, value] of [['desactiver', 1], ['reactiver', 0]]) {
  router.post(`/api/citoyens/:id/${action}`, staff, (req, res) => {
    if (!setDisabled(Number(req.params.id), value)) return res.status(404).json({ error: 'Compte citoyen introuvable' });
    res.json({ id: Number(req.params.id), disabled: !!value });
  });
  router.post(`/agent/citoyens/:id/${action}`, staff, (req, res) => {
    const ok = setDisabled(Number(req.params.id), value);
    const msg = ok ? (value ? 'Compte désactivé.' : 'Compte réactivé.') : 'Compte citoyen introuvable.';
    res.redirect('/agent/citoyens?msg=' + encodeURIComponent(msg));
  });
}

router.get('/agent/citoyens', staff, (req, res) => {
  const q = String(req.query.q || '').trim();
  const users = search(q);
  res.page({ title: 'Comptes citoyens', active: 'citoyens', body: html`
<h1>Comptes citoyens</h1>
<p class="muted">Un compte désactivé ne peut plus se connecter ; il peut être réactivé à tout moment.</p>
${req.query.msg ? safe`<div class="alert success" role="status">${req.query.msg}</div>` : ''}
<form method="get" action="/agent/citoyens" class="form" role="search">
  <label>Rechercher un citoyen (nom ou e-mail)<input type="search" name="q" value="${q}" maxlength="100"></label>
  <button class="btn">Rechercher</button>
</form>
<section class="card"><h2>${users.length} compte${users.length > 1 ? 's' : ''}</h2>
${users.length ? safe`<table class="table"><thead><tr><th>Nom</th><th>E-mail</th><th>Inscrit le</th><th>Demandes</th><th>État</th><th>Action</th></tr></thead><tbody>
${users.map((u) => safe`<tr><td>${u.name}</td><td>${u.email}</td><td>${fmtDate(u.created_at)}</td><td>${u.messages_count}</td>
<td>${u.disabled ? 'Désactivé' : 'Actif'}</td>
<td><form method="post" action="/agent/citoyens/${u.id}/${u.disabled ? 'reactiver' : 'desactiver'}" class="inline-form">
<button class="btn small" aria-label="${u.disabled ? 'Réactiver' : 'Désactiver'} le compte de ${u.name}">${u.disabled ? 'Réactiver' : 'Désactiver'}</button></form></td></tr>`)}
</tbody></table>` : safe`<p class="muted">Aucun compte citoyen ne correspond.</p>`}</section>` });
});

module.exports = router;
