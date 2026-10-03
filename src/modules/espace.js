// D03 : espace personnel clairement identifié
const router = require('express').Router();
const db = require('../db');
const { requireAuth, ROLE_LABELS } = require('../auth');
const { html, safe, fmtDate } = require('../views');

const STATUS = { nouveau: 'Reçue', en_cours: 'En cours de traitement', traite: 'Traitée' };

router.get('/espace', requireAuth, (req, res) => {
  const u = req.user;
  const msgs = db.prepare('SELECT * FROM messages WHERE user_id = ? OR email = ? ORDER BY created_at DESC').all(u.id, u.email);
  res.page({ title: 'Mon espace', active: 'espace', body: html`
${req.query.bienvenue ? safe`<div class="alert success" role="status">Bienvenue ${u.name}, votre compte est créé.</div>` : ''}
<header class="espace-head"><h1>Mon espace personnel</h1><p class="muted">Connecté en tant que <strong>${u.name}</strong> (${u.email}) · ${ROLE_LABELS[u.role]} · inscrit le ${fmtDate(u.created_at)}</p></header>
<div class="grid two">
  <section class="card">
    <div class="row-between"><h2>Mes demandes</h2><a class="btn small" href="/contact">Nouvelle demande</a></div>
    ${msgs.length ? safe`<table class="table"><thead><tr><th>N°</th><th>Objet</th><th>Date</th><th>État</th></tr></thead><tbody>${msgs.map((m) => safe`<tr><td>${m.reference}</td><td>${m.subject}${m.agent_note ? safe`<br><small class="muted">Réponse : ${m.agent_note}</small>` : ''}</td><td>${fmtDate(m.created_at)}</td><td><span class="status s-${m.status}">${STATUS[m.status]}</span></td></tr>`)}</tbody></table>`
      : safe`<p class="muted">Vous n'avez encore envoyé aucune demande.</p>`}
  </section>
  <section class="card">
    <h2>Raccourcis</h2>
    <ul class="links"><li><a href="/services">Trouver un service</a></li><li><a href="/actualites">Dernières actualités</a></li><li><a href="/contact">Contacter la mairie</a></li>
    ${['agent', 'admin'].includes(u.role) ? safe`<li><a href="/agent">Espace agents</a></li>` : ''}</ul>
  </section>
</div>` });
});

module.exports = router;
module.exports.STATUS = STATUS;
