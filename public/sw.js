/* Terra Nova — Service Worker (vague 15 : F77, F78 ; vague 19 : F93 hors connexion, F95 sobriété).
   - « Paquet essentiel » copié à l'installation puis rafraîchi au plus toutes les 10 minutes (message « paquet » envoyé par
     assets/js/continuite.js) : accueil, services, annonces, carte, formulaire de demande, suivi, « Infos essentielles »
     (/essentiel, 4 langues), version simple (accueil, services et la fiche de chaque service), leurs styles et scripts,
     et les données publiques : GET /api/essentiel (alertes, messages officiels, consignes, numéros d'urgence, état des services,
     contacts utiles, associations), /api/officiels, /api/charge.
   - Résumé personnel (GET /api/essentiel/moi : mes demandes récentes, prochains rendez-vous) : seulement pour l'habitant connecté,
     dans un cache à part (terra-nova-perso) effacé à la déconnexion. Aucune autre donnée de l'API n'est copiée ; jamais une
     réponse marquée no-store (pages personnelles rendues par le serveur).
   - Toujours le RÉSEAU D'ABORD pour les pages, scripts, styles et données : la copie ne sert que si le réseau échoue (ou si une
     page ne répond pas en 4 s alors qu'une copie existe) → jamais d'ancien script après un déploiement. Une copie servie porte
     l'en-tête X-Copie-Du (date) pour que la page affiche « informations du … ».
   - Page de secours hors connexion : la page demandée si elle est copiée, sinon « Infos essentielles ».
   - Fichiers de Shoelace (adresse versionnée sur jsDelivr) : copiés à la première utilisation (cache d'abord), pour que
     l'interface complète reste utilisable hors connexion. */
'use strict';
const VERSION = 'v22-1';   // vague 22 : tempete.js dans l'enveloppe
const CACHE = 'terra-nova-' + VERSION;
const PERSO = 'terra-nova-perso';
const CDN = 'terra-nova-cdn-1';
const LANGUES = ['fr', 'en', 'es', 'ar'];
const COQUILLE = ['/', '/index.html', '/services.html', '/annonces.html', '/carte.html', '/demande.html', '/suivi.html', '/espace.html', '/essentiel', '/simple', '/simple/services',
  '/assets/css/theme.css', '/assets/css/vague15.css', '/assets/css/icones.css', '/assets/css/accueil.css', '/assets/css/services.css', '/assets/css/annonces.css', '/assets/css/simple.css', '/assets/css/essentiel.css',
  '/assets/css/demandes.css', '/assets/css/carte.css', '/assets/css/arrivee.css',
  '/assets/js/i18n.js', '/assets/js/store.js', '/assets/js/ui.js', '/assets/js/officiel.js', '/assets/js/resilience.js', '/assets/js/continuite.js', '/assets/js/services.js',
  '/assets/js/essentiel.js', '/assets/js/tempete.js', '/assets/js/demande.js', '/assets/js/formulaires.js', '/assets/js/carte.js', '/assets/js/associations.js', '/assets/js/nouveaux.js',
  '/assets/img/logo-embleme-96.webp'];
const MINIMAL = ['/essentiel', '/simple', '/assets/css/theme.css', '/assets/css/simple.css', '/assets/css/essentiel.css', '/assets/js/essentiel.js'];   // économiseur de données
const API_GARDEES = ['/api/officiels', '/api/charge', '/api/essentiel'];
const API_PERSO = ['/api/essentiel/moi'];
// Seul jsDelivr est autorisé en connect-src par la politique de sécurité (src/bouclier.js) : les polices (unpkg, gstatic) restent dans
// le cache HTTP du navigateur (gardées un an par leurs serveurs) et s'affichent aussi hors connexion.
const CDN_VERSIONNES = [/^https:\/\/cdn\.jsdelivr\.net\/npm\/@shoelace-style\/shoelace@2\.20\.1\//];

const econome = () => !!(self.navigator && self.navigator.connection && self.navigator.connection.saveData);
const copier = (cache, url) => fetch(new Request(url, { cache: 'no-cache', credentials: 'same-origin' }))
  .then((r) => (r.ok && !/\bno-store\b/i.test(r.headers.get('Cache-Control') || '') ? caches.open(cache).then((c) => c.put(url, r.clone())).then(() => r) : null)).catch(() => null);

// Paquet essentiel : pages et données publiques ; fiches simples de chaque service d'après /api/essentiel
function paquet(langue, personnel) {
  const l = LANGUES.includes(langue) ? langue : 'fr';
  const taches = [copier(CACHE, '/essentiel?lang=' + l), copier(CACHE, '/simple?lang=' + l), copier(CACHE, '/api/officiels'),
    copier(CACHE, '/api/essentiel').then((r) => (r && !econome() ? r.clone().json().then((d) => Promise.all((d.services || []).map((s) => copier(CACHE, '/simple/services/' + encodeURIComponent(s.id) + '?lang=' + l)))) : null)).catch(() => null)];
  if (personnel) taches.push(copier(PERSO, '/api/essentiel/moi'));
  return Promise.all(taches);
}

self.addEventListener('install', (ev) => {
  const liste = econome() ? MINIMAL : COQUILLE.concat(LANGUES.map((l) => '/essentiel?lang=' + l));
  ev.waitUntil(caches.open(CACHE).then((c) => Promise.all(liste.map((u) => c.add(new Request(u, { cache: 'no-cache' })).catch(() => null))))
    .then(() => paquet('fr', false)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then((l) => Promise.all(l.filter((k) => k.startsWith('terra-nova-') && ![CACHE, PERSO, CDN].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (ev) => {
  const d = ev.data || {};
  /* vague 22 (F104) : tempête solaire → paquet rafraîchi tout de suite et réponse « paquet-ok » à la page (heure affichée) */
  if (d.type === 'paquet' && d.urgent) {
    ev.waitUntil(paquet(d.langue, !!d.personnel).then((l) => copier(CACHE, '/essentiel').then(() => l))
      .then((l) => ({ ok: Array.isArray(l) && l.slice(0, 2).some(Boolean) })).catch(() => ({ ok: false }))
      .then((r) => { if (ev.source && ev.source.postMessage) ev.source.postMessage({ type: 'paquet-ok', id: d.id, ok: r.ok, t: Date.now() }); }));
    return;
  }
  if (d.type === 'paquet') ev.waitUntil(paquet(d.langue, !!d.personnel));
  if (d.type === 'deconnexion') ev.waitUntil(caches.delete(PERSO));
});

// Seules l'enveloppe, le paquet essentiel et les API prévues sont copiés, jamais une réponse marquée no-store
function conservable(url, r) {
  const chemin = new URL(url).pathname;
  if (!COQUILLE.includes(chemin) && !API_GARDEES.includes(chemin) && !/^\/simple\/services\/[\w-]+$/.test(chemin)) return false;
  return !/\bno-store\b/i.test(r.headers.get('Cache-Control') || '');
}
// Copie servie : en-tête X-Copie-Du (date de la copie) pour que la page l'indique
function marquer(r) {
  const h = new Headers(r.headers);
  h.set('X-Copie-Du', r.headers.get('Date') || new Date().toUTCString());
  return r.blob().then((b) => new Response(b, { status: r.status, statusText: r.statusText, headers: h }));
}
const horsLigneJson = () => new Response(JSON.stringify({ erreur: 'Serveur injoignable.', horsLigne: true }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
function secoursNavigation(req) {
  const l = new URL(req.url).searchParams.get('lang') || '';
  return caches.match(req, { ignoreSearch: true })
    .then((r) => r || caches.match('/essentiel?lang=' + (LANGUES.includes(l) ? l : 'fr')))
    .then((r) => r || caches.match('/essentiel', { ignoreSearch: true }))
    .then((r) => r || caches.match('/simple', { ignoreSearch: true }))
    .then((r) => r || new Response('<!doctype html><meta charset="utf-8"><title>Terra Nova</title><p>Hors connexion. Urgences : 15 · 17 · 18 · 112.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
}
function reseauDabord(req, cle, cache) {
  const api = new URL(req.url).pathname.startsWith('/api');
  const reseau = fetch(req).then((r) => {
    if (r && r.ok && r.type === 'basic' && (cache === PERSO || conservable(req.url, r))) { const copie = r.clone(); caches.open(cache || CACHE).then((c) => c.put(cle || req, copie)).catch(() => {}); }
    // plus connecté : la copie personnelle disparaît — sauf pendant un incident du serveur (incident: true), où la session n'est pas lisible
    if (r && r.status === 401 && cache === PERSO) r.clone().json().then((j) => (j && j.incident ? null : caches.delete(PERSO))).catch(() => caches.delete(PERSO));
    return r;
  });
  // styles et scripts : n'importe quelle version copiée convient hors connexion (src/statique.js pose ?v=… sur les adresses de ce fichier)
  const fichier = /^\/assets\//.test(new URL(req.url).pathname);
  const copie = () => (cache ? caches.open(cache).then((c) => c.match(cle || req)) : caches.match(cle || req, { ignoreSearch: fichier || (req.mode === 'navigate' && !cle) }));
  const principal = reseau.catch(() => copie().then((r) => (r ? marquer(r) : req.mode === 'navigate' ? secoursNavigation(req) : api ? horsLigneJson() : Response.error())));
  if (req.mode !== 'navigate') return principal;
  // une page lente à répondre (réseau qui flanche) : la copie au bout de 4 s si elle existe
  const delai = new Promise((res) => setTimeout(res, 4000)).then(() => copie()).then((r) => (r ? marquer(r) : principal));
  return Promise.race([principal, delai]);
}
function cacheDabord(req) {
  return caches.open(CDN).then((c) => c.match(req).then((r) => r || fetch(req).then((x) => { if (x && x.ok && x.type === 'cors') c.put(req, x.clone()).catch(() => {}); return x; })));
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (CDN_VERSIONNES.some((r) => r.test(req.url))) ev.respondWith(cacheDabord(req));
    return;   // autres ressources externes : le navigateur s'en charge
  }
  if (url.pathname.startsWith('/api')) {
    if (API_GARDEES.includes(url.pathname)) ev.respondWith(reseauDabord(req, url.pathname));
    else if (API_PERSO.includes(url.pathname)) ev.respondWith(reseauDabord(req, url.pathname, PERSO));
    return;   // toute autre réponse de l'API va directement au serveur, sans copie
  }
  if (url.pathname === '/sw.js') return;
  // styles et scripts versionnés (?v=…) : copie rangée sous l'adresse sans version, pour la retrouver hors connexion
  const asset = /^\/assets\/(css|js)\//.test(url.pathname) && url.search;
  // pages simples et essentielles : une copie par langue
  const lang = url.searchParams.get('lang');
  const parLangue = (url.pathname === '/essentiel' || url.pathname.startsWith('/simple')) && lang;
  ev.respondWith(reseauDabord(req, asset ? url.origin + url.pathname : parLangue ? url.pathname + '?lang=' + lang : undefined));
});
