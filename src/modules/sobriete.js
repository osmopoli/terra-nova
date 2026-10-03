// Terra Nova — diagnostic de sobriété numérique (F57). Contenu fourni par la page sobriete.html.
// GET /api/sobriete : poids, requêtes et note « type EcoIndex » des pages principales, calculés
// à partir des fichiers réellement servis (public/) + une estimation fixe des ressources externes (CDN).
const express = require('express');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const router = express.Router();

const PUBLIC = path.join(__dirname, '..', '..', 'public');
const PAGES = ['index.html', 'services.html', 'carte.html', 'annonces.html', 'demande.html',
  'connexion.html', 'espace.html', 'agent.html', 'transports.html'];
const TEXTE = new Set(['.css', '.js', '.html', '.svg', '.json', '.txt', '.mjs']);
const DUREE_CACHE_MS = 10 * 60 * 1000;
const KO = 1024;

/* Estimation du poids TRANSFÉRÉ (compressé) des ressources externes, en octets.
   Ces fichiers sont servis par des CDN : on ne peut pas les mesurer hors ligne, donc on retient
   des ordres de grandeur fixes (premier chargement, sans cache). C'est une estimation, pas une mesure.
   Ces polices ne sont pas chargées du tout en « Mode connexion lente ». */
const EXTERNES = [
  { motif: /shoelace.*autoloader/i, nom: 'Shoelace — chargeur + composants utilisés', octets: 90 * KO },
  { motif: /shoelace.*themes\/dark\.css/i, nom: 'Shoelace — thème sombre', octets: 8 * KO },
  { motif: /phosphor.*\/regular\/style\.css/i, nom: 'Phosphor — icônes (CSS + police « regular »)', octets: 80 * KO },
  { motif: /phosphor.*\/duotone\/style\.css/i, nom: 'Phosphor — icônes (CSS + police « duotone »)', octets: 120 * KO },
  { motif: /fonts\.googleapis\.com\/css2/i, nom: 'Google Fonts — Inter + JetBrains Mono (CSS + polices)', octets: 70 * KO }
];
const EXTERNE_INCONNU = 20 * KO;   // ressource externe non répertoriée ci-dessus

let cache = null;

/* Poids d'un fichier local : { brut, compresse } (Brotli pour le texte, tel quel pour les images). */
function peser(chemin) {
  const fichier = path.join(PUBLIC, chemin);
  if (!fichier.startsWith(PUBLIC) || !fs.existsSync(fichier) || !fs.statSync(fichier).isFile()) return null;
  const buf = fs.readFileSync(fichier);
  const ext = path.extname(fichier).toLowerCase();
  return { brut: buf.length, compresse: TEXTE.has(ext) ? zlib.brotliCompressSync(buf).length : buf.length };
}

const estLocal = url => !!url && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);
const nettoyer = url => url.split('#')[0].split('?')[0].replace(/^\.?\//, '');

/* Extrait les URL référencées par une page : link href, script src, img src / srcset. */
function references(html) {
  const locales = []; const externes = new Set(); const srcsets = [];
  const ajouter = u => {
    if (!u) return;
    if (/^https?:\/\//i.test(u) || u.startsWith('//')) externes.add(u.startsWith('//') ? 'https:' + u : u);
    else if (estLocal(u)) locales.push(nettoyer(u));
  };
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = /rel\s*=\s*["']([^"']+)/i.exec(m[0]);
    const href = /href\s*=\s*["']([^"']+)/i.exec(m[0]);
    if (!href || (rel && /preconnect|dns-prefetch|canonical|alternate/i.test(rel[1]))) continue;
    ajouter(href[1]);
  }
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)/gi)) ajouter(m[1]);
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = /\bsrc\s*=\s*["']([^"']+)/i.exec(m[0]);
    const set = /\bsrcset\s*=\s*["']([^"']+)/i.exec(m[0]);
    if (set) {
      const cand = set[1].split(',').map(s => nettoyer(s.trim().split(/\s+/)[0])).filter(estLocal);
      if (cand.length) srcsets.push(cand);
    } else if (src) ajouter(src[1]);
  }
  return { locales: [...new Set(locales)], externes: [...externes], srcsets };
}

/* Note A–G « type EcoIndex » (estimation, ce n'est PAS le calcul officiel EcoIndex).
   score = 100 − 60 × min(1, poids/2 000 Ko) − 40 × min(1, requêtes/50)
   (poids = transféré : locaux compressés + externes estimés ; requêtes = locales + externes).
   A ≥ 80 · B ≥ 70 · C ≥ 60 · D ≥ 50 · E ≥ 40 · F ≥ 30 · G en dessous. */
function noter(poidsKo, requetes) {
  const score = Math.round(100 - 60 * Math.min(1, poidsKo / 2000) - 40 * Math.min(1, requetes / 50));
  const seuils = [[80, 'A'], [70, 'B'], [60, 'C'], [50, 'D'], [40, 'E'], [30, 'F']];
  const trouve = seuils.find(([s]) => score >= s);
  return { score, note: trouve ? trouve[1] : 'G' };
}

function analyserPage(nom) {
  const fichier = path.join(PUBLIC, nom);
  if (!fs.existsSync(fichier)) return null;
  const { locales, externes, srcsets } = references(fs.readFileSync(fichier, 'utf8'));
  const page = peser(nom);
  const ressources = [{ url: nom, type: 'html', brut: page.brut, compresse: page.compresse }];
  for (const l of locales) {
    const p = peser(l);
    if (p) ressources.push({ url: l, type: path.extname(l).slice(1).toLowerCase(), brut: p.brut, compresse: p.compresse });
  }
  // Images à srcset : la plus petite = « mobile », la plus grande = « bureau » (une seule est téléchargée).
  let mobile = 0; let bureau = 0; let nbSrcset = 0;
  for (const cand of srcsets) {
    const tailles = cand.map(c => peser(c)).filter(Boolean).sort((a, b) => a.compresse - b.compresse);
    if (!tailles.length) continue;
    nbSrcset++; mobile += tailles[0].compresse; bureau += tailles[tailles.length - 1].compresse;
  }
  const baseLocale = ressources.reduce((s, r) => s + r.compresse, 0);
  const baseBrut = ressources.reduce((s, r) => s + r.brut, 0);
  const ext = externes.map(u => {
    const e = EXTERNES.find(x => x.motif.test(u));
    return { url: u, nom: e ? e.nom : 'Ressource externe', octetsEstimes: e ? e.octets : EXTERNE_INCONNU };
  });
  const octetsExternes = ext.reduce((s, e) => s + e.octetsEstimes, 0);
  const requetes = ressources.length + nbSrcset + ext.length;
  const totalKo = Math.round((baseLocale + bureau + octetsExternes) / KO);
  return {
    page: nom,
    requetesLocales: ressources.length + nbSrcset, requetesExternes: ext.length, requetes,
    octetsBruts: baseBrut + bureau,
    octetsCompresses: baseLocale + bureau,
    octetsCompressesMobile: baseLocale + mobile,
    octetsExternesEstimes: octetsExternes,
    poidsTotalKo: totalKo,
    poidsTotalMobileKo: Math.round((baseLocale + mobile + octetsExternes) / KO),
    ...noter(totalKo, requetes),
    ressourcesLocales: ressources.map(r => ({ url: r.url, type: r.type, octetsBruts: r.brut, octetsCompresses: r.compresse })),
    ressourcesExternes: ext
  };
}

function calculer() {
  const pages = PAGES.map(analyserPage).filter(Boolean);
  const accueil = pages.find(p => p.page === 'index.html') || pages[0] || null;
  const n = pages.length || 1;
  const moy = Math.round(pages.reduce((s, p) => s + p.poidsTotalKo, 0) / n);
  const moyReq = Math.round(pages.reduce((s, p) => s + p.requetes, 0) / n);
  const co2g = ko => Math.round(ko / 1024 * 0.36 * 100) / 100;   // 0,36 g de CO2e par Mo (Sustainable Web Design)
  return {
    genereLe: new Date().toISOString(),
    estimation: true,
    methode: {
      co2: 'Modèle Sustainable Web Design : 0,81 kWh par Go transféré × 442 g de CO2e par kWh (moyenne mondiale) ≈ 0,36 g de CO2e par Mo.',
      note: 'Note de A à G estimée : 100 − 60 × min(1, poids/2 000 Ko) − 40 × min(1, requêtes/50). A ≥ 80, B ≥ 70, C ≥ 60, D ≥ 50, E ≥ 40, F ≥ 30, sinon G. Ce n’est pas le calcul officiel EcoIndex.',
      poids: 'Fichiers locaux : mesurés (Brotli pour le texte, images telles quelles). Ressources externes (CDN) : estimation fixe, premier chargement sans cache.',
      externes: EXTERNES.map(e => ({ nom: e.nom, octetsEstimes: e.octets })),
      externeParDefaut: EXTERNE_INCONNU
    },
    resume: { pages: pages.length, poidsMoyenKo: moy, requetesMoyennes: moyReq, co2MoyenG: co2g(moy), ...noter(moy, moyReq) },
    accueil: accueil && {
      poidsKo: accueil.poidsTotalKo, poidsMobileKo: accueil.poidsTotalMobileKo, requetes: accueil.requetes,
      co2G: co2g(accueil.poidsTotalKo), note: accueil.note, score: accueil.score
    },
    pages
  };
}

router.get('/api/sobriete', (req, res) => {
  try {
    if (!cache || Date.now() - cache.t > DUREE_CACHE_MS) cache = { t: Date.now(), data: calculer() };
    res.set('Cache-Control', 'public, max-age=600');
    res.json(cache.data);
  } catch (e) {
    res.status(500).json({ erreur: 'Diagnostic indisponible.' });
  }
});

module.exports = router;
