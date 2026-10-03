// D19 : espace de travail agents (distinct de l'espace citoyen) + suivi de l'API Nova Terra
// F22 : vue des demandes des habitants, état et actions restantes
const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { html, safe, fmtDate } = require('../views');
const webcup = require('../webcup');
const { STATUS } = require('./espace');

const staff = requireRole('agent', 'admin');
const FILTERS = { action: "À traiter", nouveau: 'Nouvelles', en_cours: 'En cours', traite: 'Traitées', all: 'Toutes' };

function counts() {
  const rows = db.prepare('SELECT status, COUNT(*) n FROM messages GROUP BY status').all();
  const c = { nouveau: 0, en_cours: 0, traite: 0 };
  rows.forEach((r) => (c[r.status] = r.n));
  return c;
}

router.get('/agent', staff, (req, res) => {
  const filter = FILTERS[req.query.filtre] ? req.query.filtre : 'action';
  const where = filter === 'all' ? '' : filter === 'action' ? "WHERE status != 'traite'" : 'WHERE status = ?';
  const args = ['nouveau', 'en_cours', 'traite'].includes(filter) ? [filter] : [];
  const msgs = db.prepare(`SELECT m.*, s.name service_name FROM messages m LEFT JOIN services s ON s.slug = m.service_slug ${where}
    ORDER BY CASE status WHEN 'nouveau' THEN 0 WHEN 'en_cours' THEN 1 ELSE 2 END, created_at ASC`).all(...args);
  const c = counts();
  res.page({ title: 'Espace agents', active: 'agent', scripts: ['/agent.js'], body: html`
<header class="agent-head"><h1>Espace de travail des agents</h1><p class="muted">Interface réservée aux agents municipaux et administrateurs.</p></header>

<section class="kpis" aria-label="Indicateurs">
  <div class="kpi warn"><span>${c.nouveau}</span>Nouvelles demandes</div>
  <div class="kpi info"><span>${c.en_cours}</span>En cours</div>
  <div class="kpi ok"><span>${c.traite}</span>Traitées</div>
  <div class="kpi"><span id="api-count">…</span>Demandes API Nova Terra</div>
</section>

<section class="card" aria-labelledby="dem">
  <div class="row-between"><h2 id="dem">Demandes des habitants</h2>
  <nav class="chips" aria-label="Filtrer">${Object.entries(FILTERS).map(([k, l]) => safe`<a href="/agent?filtre=${k}" class="${k === filter ? 'active' : ''}">${l}</a>`)}</nav></div>
  ${msgs.length ? safe`<table class="table"><thead><tr><th>État</th><th>N°</th><th>Habitant</th><th>Service</th><th>Objet</th><th>Reçue</th><th>Action</th></tr></thead><tbody>
  ${msgs.map((m) => safe`<tr class="${m.status !== 'traite' ? 'needs-action' : ''}">
    <td><span class="status s-${m.status}">${STATUS[m.status]}</span></td><td>${m.reference}</td><td>${m.name}<br><small>${m.email}</small></td>
    <td>${m.service_name || '—'}</td><td><details><summary>${m.subject}</summary><p>${m.body}</p></details></td><td>${fmtDate(m.created_at)}</td>
    <td><form method="post" action="/agent/demandes/${m.id}" class="inline-form">
      <select name="status" aria-label="État">${Object.entries(STATUS).map(([k, l]) => safe`<option value="${k}" ${k === m.status ? 'selected' : ''}>${l}</option>`)}</select>
      <input name="agent_note" placeholder="Réponse à l'habitant" value="${m.agent_note || ''}" aria-label="Réponse">
      <button class="btn small">Mettre à jour</button></form></td></tr>`)}
  </tbody></table>` : safe`<p class="muted">Aucune demande dans cette vue.</p>`}
</section>

<section class="card" aria-labelledby="api">
  <div class="row-between"><h2 id="api">Activité de l'API Nova Terra</h2><span id="api-new" class="badge new" hidden></span></div>
  <div id="api-session" class="api-session muted">Chargement…</div>
  <table class="table"><thead><tr><th>Code</th><th>Demandeur</th><th>Message</th><th>Difficulté</th><th>XP</th><th>Vague</th><th>Fait</th></tr></thead>
  <tbody id="api-requests"></tbody></table>
</section>` });
});

router.post('/agent/demandes/:id', staff, (req, res) => {
  const status = STATUS[req.body.status] ? req.body.status : 'nouveau';
  db.prepare("UPDATE messages SET status = ?, agent_note = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, String(req.body.agent_note || '').slice(0, 1000) || null, Number(req.params.id));
  res.redirect(req.get('referer')?.includes('/agent') ? req.get('referer') : '/agent');
});

// API JSON consommée par public/agent.js (polling navigateur → notre backend, jamais l'API Webcup directement)
router.get('/api/webcup/state', staff, (req, res) => res.json(webcup.getState()));
router.post('/api/webcup/:code/done', staff, (req, res) => {
  const changed = webcup.setDone(req.params.code, !!req.body.done);
  res.status(changed ? 200 : 404).json({ ok: !!changed });
});
router.post('/api/webcup/refresh', requireRole('admin'), async (req, res) => {
  await webcup.pollOnce();
  res.json(webcup.getState());
});

module.exports = router;
