#!/usr/bin/env node
/* Terra Nova — test de charge sans dépendance (vague 15 : F77, F78)
   N habitants virtuels ouvrent des pages et interrogent l'API en même temps, pendant une durée donnée.
   Mélange réaliste : accueil, scripts, état de la plateforme (visiteur et habitant connecté), messages officiels,
   état de charge, signalements publics, diagnostic de sobriété, et, sur demande (--ecritures), quelques dépôts de demandes.
   Résultat : débit, latence p50 / p95 / p99 par classe (essentiel / secondaire / pages), erreurs, réponses délestées (503).

   Usage :
     node tools/charge.js [--url http://localhost:3000] [--clients 50] [--duree 20] [--ecritures 0.005 (part de dépôts de demandes, 0 par défaut)] [--meme-ip] [--json]
   Exemple (avant / après) : lancer le serveur, puis `node tools/charge.js --clients 100 --duree 30`.
   Les écritures sont limitées par le bouclier (300 / min par adresse) : les 429 sont comptés à part (protection normale). */
'use strict';
const args = process.argv.slice(2);
const opt = (nom, def) => { const i = args.indexOf('--' + nom); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def; };
const URL_BASE = String(opt('url', 'http://localhost:3000')).replace(/\/$/, '');
const CLIENTS = Math.max(1, Number(opt('clients', 50)));
const DUREE = Math.max(1, Number(opt('duree', 20))) * 1000;
const TAUX_ECRITURE = Math.max(0, Number(opt('ecritures', 0)));   // 0 par défaut : ne jamais remplir une vraie base de demandes de test
const JSON_SORTIE = args.includes('--json');
const MEME_IP = args.includes('--meme-ip');   // tous les clients derrière une seule adresse (montre la file équitable par IP)
const ORIGINE = { Origin: URL_BASE, 'Content-Type': 'application/json' };

// Parcours pondérés (poids relatifs) : ce qu'un habitant fait réellement en arrivant pendant un pic d'affluence
const PARCOURS = [
  { poids: 14, classe: 'page', methode: 'GET', chemin: '/' },
  { poids: 6, classe: 'page', methode: 'GET', chemin: '/assets/js/ui.js' },
  { poids: 4, classe: 'page', methode: 'GET', chemin: '/services.html' },
  { poids: 3, classe: 'page', methode: 'GET', chemin: '/simple' },
  { poids: 20, classe: 'essentiel', methode: 'GET', chemin: '/api/etat' },
  { poids: 16, classe: 'essentiel', methode: 'GET', chemin: '/api/etat', session: 'citoyen' },
  { poids: 12, classe: 'essentiel', methode: 'GET', chemin: '/api/officiels' },
  { poids: 6, classe: 'essentiel', methode: 'GET', chemin: '/api/charge' },
  { poids: 2, classe: 'essentiel', methode: 'GET', chemin: '/api/health' },
  { poids: 6, classe: 'secondaire', methode: 'GET', chemin: '/api/demandes/publiques' },
  { poids: 3, classe: 'secondaire', methode: 'GET', chemin: '/api/associations' },
  { poids: 2, classe: 'secondaire', methode: 'GET', chemin: '/api/sobriete' },
  { poids: 3, classe: 'secondaire', methode: 'GET', chemin: '/api/demandes/groupes', session: 'agent' }
];
const TOTAL_POIDS = PARCOURS.reduce((s, p) => s + p.poids, 0);
function tirer() { let x = Math.random() * TOTAL_POIDS; for (const p of PARCOURS) { x -= p.poids; if (x <= 0) return p; } return PARCOURS[0]; }

async function connecter(email, motdepasse) {
  const r = await fetch(URL_BASE + '/api/auth/connecter', { method: 'POST', headers: ORIGINE, body: JSON.stringify({ email, motdepasse }) });
  const cookie = (r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || '']).map((c) => c.split(';')[0]).find((c) => c.startsWith('tn_session='));
  await r.arrayBuffer();
  return cookie || '';
}

const mesures = { essentiel: [], secondaire: [], page: [], ecriture: [] };
const statuts = {};
let reseau = 0, delestees = 0, limitees = 0, erreurs = 0, total = 0;
const pct = (l, p) => (l.length ? l[Math.min(l.length - 1, Math.floor((p / 100) * l.length))] : 0);

// Chaque client virtuel a sa propre adresse (plage de test 198.18.0.0/15) : le serveur, derrière un proxy local de confiance,
// la lit dans X-Forwarded-For comme le ferait Passenger. Avec --meme-ip, tous partagent l'adresse du poste de test.
async function client(sessions, fin, n) {
  const ip = '198.18.' + Math.floor(n / 250) + '.' + ((n % 250) + 1);
  while (Date.now() < fin) {
    const ecrire = sessions.citoyen && Math.random() < TAUX_ECRITURE;
    const p = ecrire ? { classe: 'ecriture', methode: 'POST', chemin: '/api/docs/demandes', session: 'citoyen' } : tirer();
    const entetes = { 'Accept-Encoding': 'gzip' };
    if (!MEME_IP) entetes['X-Forwarded-For'] = ip;
    if (p.session && sessions[p.session]) entetes.Cookie = sessions[p.session];
    if (p.methode === 'POST') Object.assign(entetes, ORIGINE);
    const t0 = performance.now();
    try {
      const r = await fetch(URL_BASE + p.chemin, { method: p.methode, headers: entetes,
        body: p.methode === 'POST' ? JSON.stringify({ type: 'contact', serviceId: 'culture', objet: 'Test de charge', message: 'Message envoyé par tools/charge.js pendant un test de charge.' }) : undefined });
      await r.arrayBuffer();
      const ms = performance.now() - t0;
      total++;
      statuts[r.status] = (statuts[r.status] || 0) + 1;
      if (r.status === 503) delestees++;
      else if (r.status === 429) limitees++;
      else if (r.status >= 500) erreurs++;
      if (r.status < 500 && r.status !== 429) mesures[p.classe].push(ms);
    } catch (e) { reseau++; total++; }
  }
}

(async () => {
  const sessions = {};
  try {
    sessions.citoyen = await connecter('citoyen@nova.test', 'Citoyen2026');
    sessions.agent = await connecter('agent@nova.test', 'Agent2026');
  } catch (e) { console.error('Serveur injoignable sur ' + URL_BASE + ' : ' + e.message); process.exit(1); }
  const debut = Date.now();
  const fin = debut + DUREE;
  await Promise.all(Array.from({ length: CLIENTS }, (_, n) => client(sessions, fin, n)));
  const secondes = (Date.now() - debut) / 1000;
  let charge = null;
  try { charge = await (await fetch(URL_BASE + '/api/charge')).json(); } catch { /* serveur arrêté */ }
  const classes = {};
  for (const [k, l] of Object.entries(mesures)) {
    l.sort((a, b) => a - b);
    classes[k] = { n: l.length, p50: Math.round(pct(l, 50)), p95: Math.round(pct(l, 95)), p99: Math.round(pct(l, 99)), max: Math.round(l[l.length - 1] || 0) };
  }
  const toutes = Object.values(mesures).flat().sort((a, b) => a - b);
  const res = { url: URL_BASE, clients: CLIENTS, dureeS: Math.round(secondes), requetes: total, parSeconde: Math.round(total / secondes),
    latence: { p50: Math.round(pct(toutes, 50)), p95: Math.round(pct(toutes, 95)), p99: Math.round(pct(toutes, 99)) }, classes,
    erreurs5xx: erreurs, erreursReseau: reseau, delestees503: delestees, limitees429: limitees, statuts, niveauFinal: charge && charge.niveau };
  if (JSON_SORTIE) { console.log(JSON.stringify(res, null, 2)); return; }
  console.log(`\nTerra Nova — test de charge sur ${URL_BASE}`);
  console.log(`${CLIENTS} clients simultanés pendant ${res.dureeS} s : ${total} requêtes (${res.parSeconde} / s)`);
  console.log(`Latence toutes requêtes : p50 ${res.latence.p50} ms · p95 ${res.latence.p95} ms · p99 ${res.latence.p99} ms`);
  console.log('\nClasse        n       p50     p95     p99     max (ms)');
  for (const [k, c] of Object.entries(classes)) if (c.n) console.log(`${k.padEnd(12)} ${String(c.n).padStart(6)} ${String(c.p50).padStart(7)} ${String(c.p95).padStart(7)} ${String(c.p99).padStart(7)} ${String(c.max).padStart(7)}`);
  console.log(`\nErreurs serveur (5xx hors délestage) : ${erreurs} · erreurs réseau : ${reseau}`);
  console.log(`Réponses délestées (503 + Retry-After, non essentielles) : ${delestees} · limitées par le bouclier (429) : ${limitees}`);
  console.log(`Statuts : ${Object.entries(statuts).map(([s, n]) => `${s}×${n}`).join(' ')} · niveau de charge à la fin : ${res.niveauFinal || '?'}\n`);
})();
