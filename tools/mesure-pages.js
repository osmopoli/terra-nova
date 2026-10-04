#!/usr/bin/env node
/* Terra Nova — vague 19 (F95, F96) : mesure réelle de chaque page dans un navigateur sans fenêtre (Edge ou Chrome),
   piloté par le protocole DevTools (aucune dépendance : WebSocket intégré à Node 22+).

   Pour chaque page, avec un cache vide et le profil qui y a accès (visiteur, habitant, agent, administrateur) :
   - nombre de requêtes (même origine, CDN, API), octets transférés (en-têtes compris), requêtes en double ;
   - JavaScript et CSS chargés et part réellement exécutée / utilisée (couverture DevTools) ;
   - appels à l'API pendant une fenêtre d'observation après le chargement (fréquence des mises à jour en direct) ;
   - plus grand affichage (LCP, en ms et élément), décalage de mise en page cumulé (CLS).

   Usage :
     node tools/mesure-pages.js --url http://localhost:3000                      # toutes les pages, poste de bureau
     node tools/mesure-pages.js --mobile --lent                                  # 360 px, « 3G lente » (400 ms, 400 kbit/s)
     node tools/mesure-pages.js --rapide                                         # réseau rapide émulé (affichage complet sur ordinateur)
     node tools/mesure-pages.js --pages index,services --observer 65 --json sortie.json
   Comptes : citoyen@nova.test / Citoyen2026 ; agents et admin : MESURE_AGENT=email:motdepasse, MESURE_ADMIN=email:motdepasse
   (par défaut les comptes de data/demo-seed.json en local). Navigateur : NAVIGATEUR=chemin\vers\msedge.exe */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const BASE = String(opt('url', 'http://localhost:3000')).replace(/\/$/, '');
const MOBILE = !!opt('mobile', false);
const LENT = !!opt('lent', false);
const RAPIDE = !!opt('rapide', false);   // réseau rapide émulé (le navigateur annonce alors une connexion 4G : pas de « l'essentiel d'abord » automatique)
const OBSERVER = Number(opt('observer', 0)) * 1000;   // fenêtre d'observation des appels API après le chargement
const SORTIE = opt('json', '');
const DETAIL = !!opt('detail', false);   // liste de chaque requête (adresse, type, octets, instant)
const PUBLIC = path.join(__dirname, '..', 'public');
const COMPTES = {
  citoyen: (process.env.MESURE_CITOYEN || 'citoyen@nova.test:Citoyen2026'),
  agent: (process.env.MESURE_AGENT || 'agent@nova.test:Agent2026'),
  admin: (process.env.MESURE_ADMIN || 'admin@nova.test:Admin2026')
};

/* ---------- Pages et profil qui y a accès (attribut data-roles du <body>) ---------- */
function pages() {
  const choix = opt('pages', '');
  const toutes = fs.readdirSync(PUBLIC).filter((f) => f.endsWith('.html')).sort();
  const liste = choix ? String(choix).split(',').map((p) => (p.endsWith('.html') || p.startsWith('/') ? p : p + '.html')) : toutes.concat(['/simple', '/essentiel']);
  return liste.map((p) => {
    if (p.startsWith('/')) return { page: p, profil: 'visiteur' };
    let roles = '';
    try { roles = (fs.readFileSync(path.join(PUBLIC, p), 'utf8').match(/data-roles="([^"]*)"/) || [])[1] || ''; } catch { /* page absente */ }
    const r = roles.split(',').map((x) => x.trim()).filter(Boolean);
    const profil = !r.length ? 'visiteur' : r.includes('agent') ? 'agent' : r.includes('admin') ? 'admin' : 'citoyen';
    return { page: p, profil };
  }).filter((p) => p.page.startsWith('/') || fs.existsSync(path.join(PUBLIC, p.page)));
}

/* ---------- Navigateur ---------- */
function navigateur() {
  const c = [process.env.NAVIGATEUR, 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  const t = c.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  if (!t) { console.error('Aucun navigateur Edge / Chrome trouvé : définir NAVIGATEUR=chemin'); process.exit(1); }
  return t;
}
async function lancer() {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'tn-mesure-'));
  const proc = spawn(navigateur(), ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + dossier, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
  const fichier = path.join(dossier, 'DevToolsActivePort');
  let port = '', chemin = '';
  for (let i = 0; i < 150 && !chemin; i++) {   // le fichier peut exister avant d'être entièrement écrit (ou verrouillé sous Windows)
    await attendre(100);
    try { [port, chemin] = fs.readFileSync(fichier, 'utf8').trim().split('\n'); } catch { /* pas encore prêt */ }
  }
  const ws = new WebSocket(`ws://127.0.0.1:${port}${chemin}`);
  await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });
  return { ws, fermer: () => { try { proc.kill(); } catch { /* déjà fermé */ } setTimeout(() => { try { fs.rmSync(dossier, { recursive: true, force: true }); } catch { /* verrou */ } }, 800); } };
}
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

/* Client CDP minimal : commandes avec sessionId, écouteurs d'événements */
function client(ws) {
  let id = 0; const attente = new Map(); const ecoute = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && attente.has(d.id)) { const { ok, ko } = attente.get(d.id); attente.delete(d.id); d.error ? ko(new Error(d.error.message)) : ok(d.result); }
    else if (d.method) ecoute.forEach((f) => f(d));
  };
  const envoyer = (method, params, sessionId) => new Promise((ok, ko) => { const n = ++id; attente.set(n, { ok, ko }); ws.send(JSON.stringify({ id: n, method, params: params || {}, sessionId })); });
  return { envoyer, ecouter: (f) => { ecoute.push(f); return () => ecoute.splice(ecoute.indexOf(f), 1); } };
}

/* Octets réellement exécutés d'après la couverture par fonction (plages imbriquées, la plus intérieure l'emporte) */
function octetsUtilises(fonctions, longueur) {
  const marques = new Uint8Array(longueur);
  const plages = [];
  for (const f of fonctions) for (const r of f.ranges) plages.push(r);
  plages.sort((a, b) => (a.startOffset - b.startOffset) || (b.endOffset - a.endOffset));
  for (const r of plages) marques.fill(r.count > 0 ? 1 : 0, Math.max(0, r.startOffset), Math.min(longueur, r.endOffset));
  let n = 0; for (let i = 0; i < longueur; i++) n += marques[i];
  return n;
}

async function mesurer(c, { page, profil }, cookies) {
  const ctx = (await c.envoyer('Target.createBrowserContext', { disposeOnDetach: true })).browserContextId;
  const { targetId } = await c.envoyer('Target.createTarget', { url: 'about:blank', browserContextId: ctx });
  const { sessionId: s } = await c.envoyer('Target.attachToTarget', { targetId, flatten: true });
  const e = (m, p) => c.envoyer(m, p, s);
  await e('Network.enable'); await e('Page.enable'); await e('Runtime.enable'); await e('DOM.enable'); await e('CSS.enable');
  await e('Debugger.enable'); await e('Profiler.enable');
  if (MOBILE) {
    await e('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
    await e('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 Edg/130.0' });
  } else await e('Emulation.setDeviceMetricsOverride', { width: 1366, height: 820, deviceScaleFactor: 1, mobile: false });
  if (LENT) await e('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8, connectionType: 'cellular3g' });
  else if (RAPIDE) await e('Network.emulateNetworkConditions', { offline: false, latency: 5, downloadThroughput: 50 * 1024 * 1024 / 8, uploadThroughput: 20 * 1024 * 1024 / 8, connectionType: 'wifi' });
  // connexion : cookie de session posé dans ce contexte (obtenu une fois par profil)
  if (cookies && cookies.length) await e('Network.setCookies', { cookies });

  const req = new Map(); const scripts = new Map(); const feuilles = new Map(); const erreurs = [];
  let charge = false, tChargement = 0;
  const debut = Date.now();
  const stop = c.ecouter((d) => {
    if (d.sessionId !== s) return;
    const p = d.params;
    if (d.method === 'Network.requestWillBeSent' && !/^data:|^blob:/.test(p.request.url)) {
      if (!req.has(p.requestId)) req.set(p.requestId, { url: p.request.url, type: p.type, t: Date.now() - debut, octets: 0, statut: 0, apres: charge });
    }
    if (d.method === 'Network.responseReceived' && req.has(p.requestId)) { const r = req.get(p.requestId); r.statut = p.response.status; r.sw = !!p.response.fromServiceWorker; r.type = p.type || r.type; }
    if (d.method === 'Network.loadingFinished' && req.has(p.requestId)) req.get(p.requestId).octets = p.encodedDataLength;
    if (d.method === 'Network.loadingFailed' && req.has(p.requestId)) req.get(p.requestId).echec = p.errorText;
    if (d.method === 'Debugger.scriptParsed' && p.url && !p.url.startsWith('data:')) scripts.set(p.scriptId, { url: p.url, longueur: p.length || 0 });
    if (d.method === 'CSS.styleSheetAdded') feuilles.set(p.header.styleSheetId, { url: p.header.sourceURL, longueur: p.header.length || 0 });
    if (d.method === 'Page.loadEventFired') { charge = true; tChargement = Date.now() - debut; }
    if (d.method === 'Runtime.exceptionThrown') erreurs.push(p.exceptionDetails.exception ? p.exceptionDetails.exception.description : p.exceptionDetails.text);
    if (d.method === 'Runtime.consoleAPICalled' && p.type === 'error') erreurs.push(p.args.map((a) => a.value || a.description || '').join(' '));
  });
  await e('Profiler.startPreciseCoverage', { callCount: false, detailed: false });
  await e('CSS.startRuleUsageTracking');
  await e('Page.addScriptToEvaluateOnNewDocument', { source: `window.__mes={lcp:0,el:'',cls:0};try{new PerformanceObserver(l=>{for(const x of l.getEntries()){__mes.lcp=x.startTime;__mes.el=x.element?(x.element.tagName+(x.element.id?'#'+x.element.id:'')+(x.element.className&&typeof x.element.className==='string'?'.'+x.element.className.split(' ')[0]:'')):''}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const x of l.getEntries())if(!x.hadRecentInput){__mes.cls+=x.value;if(x.value>0.01)(__mes.dec=__mes.dec||[]).push(Math.round(x.startTime)+'ms '+x.value.toFixed(3)+' '+(x.sources||[]).map(s=>s.node?(s.node.nodeName+(s.node.id?'#'+s.node.id:'')+(s.node.className&&typeof s.node.className==='string'?'.'+s.node.className.split(' ')[0]:'')):'?').join(','))}}).observe({type:'layout-shift',buffered:true})}catch(e){}` });
  await e('Page.navigate', { url: BASE + (page.startsWith('/') ? page : '/' + page) });
  // chargement puis réseau calme (1,5 s sans nouvelle requête), 30 s au plus
  for (let i = 0; i < 300 && !charge; i++) await attendre(100);
  let calme = 0, dernier = req.size;
  for (let i = 0; i < 200 && calme < 15; i++) { await attendre(100); if (req.size === dernier) calme++; else { calme = 0; dernier = req.size; } }
  const finChargement = Date.now() - debut;
  const mesures = (await e('Runtime.evaluate', { expression: 'JSON.stringify(window.__mes||{})', returnByValue: true })).result.value;
  const couverture = (await e('Profiler.takePreciseCoverage')).result;
  const regles = (await e('CSS.stopRuleUsageTracking')).ruleUsage;
  if (OBSERVER) await attendre(OBSERVER);
  stop();
  await c.envoyer('Target.closeTarget', { targetId }).catch(() => {});
  await c.envoyer('Target.disposeBrowserContext', { browserContextId: ctx }).catch(() => {});

  const l = [...req.values()];
  const origine = new URL(BASE).origin;
  const memeOrigine = l.filter((r) => r.url.startsWith(origine));
  const api = memeOrigine.filter((r) => new URL(r.url).pathname.startsWith('/api/'));
  const urls = l.map((r) => r.url.split('#')[0]);
  const doubles = [...new Set(urls.filter((u, i) => urls.indexOf(u) !== i))];
  // JS : octets exécutés / chargés (scripts externes uniquement, dédoublonnés par adresse)
  let js = 0, jsUtile = 0; const vus = new Set();
  for (const sc of couverture) {
    const info = [...scripts.values()].find((x) => x.url === sc.url);
    if (!sc.url || !info || vus.has(sc.url)) continue; vus.add(sc.url);
    js += info.longueur; jsUtile += octetsUtilises(sc.functions, info.longueur);
  }
  let css = 0, cssUtile = 0;
  for (const [id, f] of feuilles) { if (!f.url) continue; css += f.longueur; }
  for (const r of regles) if (r.used && feuilles.get(r.styleSheetId) && feuilles.get(r.styleSheetId).url) cssUtile += r.endOffset - r.startOffset;
  const m = JSON.parse(mesures || '{}');
  return {
    page, profil, requetes: l.length, memeOrigine: memeOrigine.length, cdn: l.length - memeOrigine.length, api: api.filter((r) => !r.apres).length,
    apiApres: api.filter((r) => r.t > finChargement).map((r) => new URL(r.url).pathname + ' @' + Math.round(r.t / 1000) + 's'),
    ko: Math.round(l.reduce((n, r) => n + (r.octets || 0), 0) / 102.4) / 10,
    koAvantCalme: Math.round(l.filter((r) => r.t <= finChargement).reduce((n, r) => n + (r.octets || 0), 0) / 102.4) / 10,
    jsKo: Math.round(js / 102.4) / 10, jsUtile: js ? Math.round((100 * jsUtile) / js) : 0, cssKo: Math.round(css / 102.4) / 10, cssUtile: css ? Math.round((100 * cssUtile) / css) : 0,
    doubles, chargementMs: tChargement, pretMs: finChargement, lcpMs: Math.round(m.lcp || 0), lcpElement: m.el || '', decalages: m.dec || [], cls: Math.round((m.cls || 0) * 1000) / 1000,
    detail: DETAIL ? l.map((r) => `${String(r.t).padStart(6)} ms ${String(r.octets).padStart(7)} o ${(r.type || '').padEnd(10)} ${r.statut}${r.sw ? ' (SW)' : ''} ${r.url.replace(origine, '')}`) : undefined,
    echecs: l.filter((r) => r.echec && !/ERR_ABORTED/.test(r.echec)).map((r) => r.url + ' ' + r.echec), erreurs: erreurs.slice(0, 5)
  };
}

async function cookiesDe(c, profil) {
  if (profil === 'visiteur') return [];
  const [email, motdepasse] = COMPTES[profil].split(':');
  const ctx = (await c.envoyer('Target.createBrowserContext', { disposeOnDetach: true })).browserContextId;
  const { targetId } = await c.envoyer('Target.createTarget', { url: BASE + '/sw.js', browserContextId: ctx });
  const { sessionId: s } = await c.envoyer('Target.attachToTarget', { targetId, flatten: true });
  await c.envoyer('Runtime.enable', {}, s);
  await attendre(600);
  const r = await c.envoyer('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression:
    `fetch('/api/auth/connecter',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify({ email, motdepasse, verificationReussie: false })})}).then(r=>r.json()).then(j=>JSON.stringify(j))` }, s);
  const rep = JSON.parse(r.result.value || '{}');
  await c.envoyer('Network.enable', {}, s);
  const cookies = (await c.envoyer('Network.getCookies', { urls: [BASE] }, s)).cookies;
  await c.envoyer('Target.closeTarget', { targetId }).catch(() => {});
  await c.envoyer('Target.disposeBrowserContext', { browserContextId: ctx }).catch(() => {});
  if (!rep.ok) { console.warn(`  (connexion ${profil} impossible : ${rep.erreur || (rep.deuxEtapes ? 'deuxième étape demandée' : 'refusée')})`); return null; }
  return cookies.map((k) => ({ name: k.name, value: k.value, domain: k.domain, path: k.path, httpOnly: k.httpOnly, secure: k.secure, sameSite: k.sameSite }));
}

(async () => {
  const liste = pages();
  const { ws, fermer } = await lancer();
  const c = client(ws);
  const sessions = {};
  const resultats = [];
  console.log(`Mesure de ${liste.length} page(s) sur ${BASE}${MOBILE ? ' · mobile 360 px' : ''}${LENT ? ' · 3G lente' : ''}${RAPIDE ? ' · réseau rapide' : ''}${OBSERVER ? ` · observation ${OBSERVER / 1000} s` : ''}`);
  try {
    for (const p of liste) {
      if (!(p.profil in sessions)) sessions[p.profil] = await cookiesDe(c, p.profil);
      if (sessions[p.profil] === null) continue;
      const r = await mesurer(c, p, sessions[p.profil]);
      resultats.push(r);
      if (r.detail) console.log(r.detail.concat(r.decalages.map((d) => '  décalage ' + d)).join('\n'));
      console.log(`${r.page.padEnd(24)} ${r.profil.padEnd(8)} ${String(r.requetes).padStart(3)} req (${r.memeOrigine} site, ${r.cdn} CDN, ${r.api} API) ${String(r.ko).padStart(7)} Ko · JS ${r.jsKo} Ko (${r.jsUtile} % exécuté) · CSS ${r.cssKo} Ko (${r.cssUtile} % utilisé) · LCP ${r.lcpMs} ms ${r.lcpElement} · CLS ${r.cls}`
        + (r.doubles.length ? ` · doubles : ${r.doubles.length}` : '') + (r.apiApres.length ? ` · API après chargement : ${r.apiApres.join(', ')}` : '') + (r.erreurs.length ? ` · ERREURS : ${r.erreurs.join(' | ')}` : '') + (r.echecs.length ? ` · ÉCHECS : ${r.echecs.join(' | ')}` : ''));
    }
  } finally { ws.close(); fermer(); }
  const tot = (k) => resultats.reduce((n, r) => n + r[k], 0);
  const moy = (k) => resultats.length ? Math.round((10 * tot(k)) / resultats.length) / 10 : 0;
  console.log(`\nMoyenne par page : ${moy('requetes')} requêtes · ${moy('ko')} Ko transférés · JS ${moy('jsKo')} Ko · CSS ${moy('cssKo')} Ko · LCP ${Math.round(moy('lcpMs'))} ms · CLS ${moy('cls')}`);
  if (SORTIE) { fs.writeFileSync(String(SORTIE), JSON.stringify({ date: new Date().toISOString(), base: BASE, mobile: MOBILE, lent: LENT, observer: OBSERVER, resultats }, null, 2)); console.log('Résultats :', SORTIE); }
})().catch((err) => { console.error(err); process.exit(1); });
