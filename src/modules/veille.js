// Veille API : onglet qui suit toutes les 30 s les nouveautés dans les données de l'API Nova Terra
// (nouvelle demande, contenu modifié, changement de vague). Réservé aux agents et administrateurs.
const router = require('express').Router();
const { requireRole } = require('../auth');
const { html } = require('../views');
const webcup = require('../webcup');
const { ah } = require('../async');

const staff = requireRole('agent', 'admin');

router.get('/veille', staff, (req, res) => {
  res.page({ title: 'Veille API', active: 'veille', scripts: ['/veille.js'], body: html`
<header class="agent-head"><h1>Veille de l'API Nova Terra</h1>
<p class="muted">Le serveur interroge l'API toutes les 30 secondes. Chaque nouveauté apparaît ici automatiquement, sans recharger la page.</p></header>

<section class="kpis" aria-label="État de la veille">
  <div class="kpi"><span id="v-count">…</span>Demandes connues</div>
  <div class="kpi info"><span id="v-wave">…</span>Vague actuelle</div>
  <div class="kpi warn"><span id="v-unseen">0</span>Nouveautés non vues</div>
  <div class="kpi"><span id="v-next">…</span>Prochaine vérification</div>
</section>

<section class="card" aria-labelledby="v-title">
  <div class="row-between">
    <h2 id="v-title">Nouveautés détectées</h2>
    <div class="actions" style="margin:0">
      <button type="button" class="btn small ghost" id="v-seen">Tout marquer comme vu</button>
      <button type="button" class="btn small" id="v-check" data-admin="${req.user.role === 'admin' ? '1' : ''}">Vérifier maintenant</button>
    </div>
  </div>
  <p id="v-status" class="api-session muted" aria-live="polite">Chargement…</p>
  <ol id="v-feed" class="feed" aria-live="polite"></ol>
  <p id="v-empty" class="muted" hidden>Aucune nouveauté depuis le lancement de la veille. Les prochaines apparaîtront ici dès leur arrivée.</p>
</section>` });
});

router.get('/api/webcup/events', staff, ah(async (req, res) => res.json(await webcup.getEvents(req.query.since))));

module.exports = router;
