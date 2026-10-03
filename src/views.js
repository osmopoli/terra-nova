// Rendu HTML côté serveur, sans moteur de template.
const { ROLE_LABELS } = require('./auth');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const html = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (i < vals.length ? (vals[i]?.__safe ? vals[i].v : Array.isArray(vals[i]) ? vals[i].map((x) => (x?.__safe ? x.v : esc(x))).join('') : esc(vals[i])) : ''), '');
const raw = (v) => ({ __safe: true, v });
const safe = (strings, ...vals) => raw(html(strings, ...vals));
const fmtDate = (d) => (d ? new Date(d.replace(' ', 'T') + (d.includes('Z') ? '' : 'Z')).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Indian/Reunion' }) : '');

function nav(user, active) {
  const link = (href, label, key) => safe`<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
  const items = [link('/', 'Accueil', 'home'), link('/services', 'Services', 'services'), link('/actualites', 'Actualités', 'news'), link('/contact', 'Contact', 'contact')];
  if (user) items.push(link('/espace', 'Mon espace', 'espace'));
  if (user && ['agent', 'admin'].includes(user.role)) items.push(link('/agent', 'Espace agents', 'agent'), link('/veille', 'Veille API', 'veille'));
  if (user && user.role === 'admin') items.push(link('/admin', 'Administration', 'admin'));
  return items;
}

function layout({ title, user, active, body, scripts = [] }) {
  return html`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? `${title} · ` : ''}Terra Nova</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><span class="logo">◈</span> Terra Nova <small>Plateforme citoyenne</small></a>
    <nav class="main-nav" aria-label="Navigation principale">${nav(user, active)}</nav>
    <div class="account">
      ${user
        ? safe`<span class="who">${user.name} <span class="badge role-${user.role}">${ROLE_LABELS[user.role]}</span></span>
          <form method="post" action="/deconnexion"><button class="link">Se déconnecter</button></form>`
        : safe`<a href="/connexion">Se connecter</a> <a class="btn small" href="/inscription">Créer un compte</a>`}
    </div>
  </div>
</header>
<main id="main" class="wrap">${raw(body)}</main>
<footer class="site-footer"><div class="wrap">Ville de Terra Nova · Hôtel de ville, 1 place de la Fondation · 0262 00 00 00</div></footer>
${scripts.map((s) => safe`<script src="${s}" defer></script>`)}
</body>
</html>`;
}

module.exports = { esc, html, raw, safe, layout, fmtDate };
