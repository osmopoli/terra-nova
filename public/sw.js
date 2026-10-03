/* Terra Nova — Service Worker (vague 15 : F77, F78). Rôle volontairement limité :
   - garder une copie de l'enveloppe des pages essentielles (accueil, services, annonces, carte, version simple) et de
     leurs styles et scripts, pour qu'elles s'affichent même quand le serveur est saturé ou la connexion coupée ;
   - garder le dernier état connu des messages officiels (GET /api/officiels) et de la charge (GET /api/charge) ;
   - toujours le RÉSEAU D'ABORD pour les pages, les scripts et les styles : la copie ne sert que si le réseau échoue,
     donc jamais d'ancien script après un déploiement. Aucune autre donnée de l'API n'est gardée (rien de personnel). */
'use strict';
const VERSION = 'v15-1';
const CACHE = 'terra-nova-' + VERSION;
const COQUILLE = ['/', '/index.html', '/services.html', '/annonces.html', '/carte.html', '/simple',
  '/assets/css/theme.css', '/assets/css/accueil.css', '/assets/css/services.css', '/assets/css/annonces.css',
  '/assets/js/i18n.js', '/assets/js/store.js', '/assets/js/ui.js', '/assets/js/officiel.js', '/assets/js/resilience.js', '/assets/js/services.js'];
const API_GARDEES = ['/api/officiels', '/api/charge'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => Promise.all(COQUILLE.map((u) => c.add(new Request(u, { cache: 'no-cache' })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then((l) => Promise.all(l.filter((k) => k.startsWith('terra-nova-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function reseauDabord(req, cle) {
  return fetch(req).then((r) => {
    if (r && r.ok && r.type === 'basic') { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(cle || req, copie)).catch(() => {}); }
    return r;
  }).catch(() => caches.match(cle || req, { ignoreSearch: req.mode === 'navigate' }).then((r) => r
    || (req.mode === 'navigate' ? caches.match('/simple').then((s) => s || caches.match('/')) : undefined)
    || new Response(JSON.stringify({ erreur: 'Serveur injoignable.' }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } })));
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // CDN (Shoelace, icônes, polices) : le navigateur s'en charge
  if (url.pathname.startsWith('/api')) {
    if (API_GARDEES.includes(url.pathname)) ev.respondWith(reseauDabord(req, url.pathname));
    return;   // toute autre réponse de l'API va directement au serveur, sans copie
  }
  if (url.pathname === '/sw.js') return;
  ev.respondWith(reseauDabord(req));
});
