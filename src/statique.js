/* Terra Nova — envoi sobre des fichiers (F58, F59)
   - textes (HTML, CSS, JS, SVG, JSON) compressés en Brotli ou gzip, compressés une seule fois puis gardés en mémoire ;
   - empreinte (ETag) : un fichier inchangé n'est pas renvoyé (304) ;
   - versions : dans les pages, les scripts et les feuilles de style, chaque « assets/…css|js|img » reçoit l'empreinte de son
     contenu (?v=…).
     Un fichier modifié change donc d'adresse : un navigateur ne peut plus garder une ancienne feuille de style ou un
     ancien script après un déploiement, quel que soit ce qu'il a en cache. Les fichiers versionnés sont gardés un an ;
   - pages, et fichiers demandés sans version : revalidés à chaque visite (304 si inchangés), images et polices gardées 1 h ;
   - /favicon.ico : l'emblème (assets/img/favicon.ico), demandé d'office par les navigateurs ;
   - réponses JSON de l'API compressées en gzip au-delà de 1,4 Ko. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const { correspond } = require('./etag-api');   // If-None-Match : liste d'empreintes, préfixe W/ toléré

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const IMAGES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
// « assets/css/x.css » ou « assets/js/x.js » entre guillemets (attribut HTML ou chaîne JS), sans version déjà posée
const REFERENCE = /(["'])(\/?assets\/(?:css|js)\/[\w.-]+\.(?:css|js))\1/g;
// images : « assets/img/x.webp » (src, srcset, chaîne JS) ou « ../img/x.webp » (url() d'une feuille de style), sans version
const REFERENCE_IMG = /((?:\/?assets\/|\.\.\/)img\/[\w.-]+\.(?:webp|png|jpg|svg|ico))(?=[\s"'),])/g;
// v2 : les adresses versionnées de la v1 ont été gardées par le cache partagé de l'hébergeur avec un mauvais encodage
const SEL = 'v2|';
const VERSIONNABLES = new Set(['.css', '.js', '.webp', '.png', '.jpg', '.svg', '.ico']);

const empreinte = (buf) => crypto.createHash('sha1').update(buf).digest('base64url').slice(0, 20);

function statique(racine) {
  const memoire = new Map();   // chemin → { mtime, etag, version, brut, br, gz, deps }
  const versions = new Map();  // chemin → { mtime, version } (empreinte du contenu d'origine)

  // Version d'un fichier = empreinte de son contenu ET des versions des fichiers qu'il référence (un script qui charge
  // assets/js/officiel.js change de version quand officiel.js change) : sinon le navigateur garderait un an l'ancien
  // ui.js, qui pointe vers l'ancien officiel.js. Une référence circulaire est coupée (pile).
  function referencesDe(texte, dossier) {
    const refs = [];
    texte.replace(REFERENCE, (tout, q, ref) => { refs.push(path.join(racine, ref)); return tout; });
    texte.replace(REFERENCE_IMG, (ref) => { refs.push(ref.startsWith('../') ? path.join(dossier, ref) : path.join(racine, ref)); return ref; });
    return refs;
  }
  function versionDe(fichier, pile = new Set()) {
    let st; try { st = fs.statSync(fichier); } catch { return null; }
    if (pile.has(fichier)) { const v = versions.get(fichier); return v ? v.brute : null; }
    pile.add(fichier);
    const v = versions.get(fichier);
    if (v && v.mtime === st.mtimeMs && v.deps.every(d => versionDe(d.f, pile) === d.v)) { pile.delete(fichier); return v.version; }
    const brut = fs.readFileSync(fichier);
    const brute = empreinte(brut).slice(0, 10);
    const ext = path.extname(fichier).toLowerCase();
    let deps = [];
    if (ext === '.js' || ext === '.css') {
      versions.set(fichier, { mtime: st.mtimeMs, version: brute, brute, deps: [] });   // valeur provisoire si une dépendance revient ici
      deps = [...new Set(referencesDe(brut.toString('utf8'), path.dirname(fichier)))].map(f => ({ f, v: versionDe(f, pile) })).filter(d => d.v);
    }
    // SEL : changé quand des copies déjà mises en cache doivent être abandonnées (adresses toutes nouvelles)
    const version = empreinte(SEL + brute + deps.map(d => d.v).join('')).slice(0, 10);
    versions.set(fichier, { mtime: st.mtimeMs, version, brute, deps });
    pile.delete(fichier);
    return version;
  }
  // Pose ?v=… sur les références ; retient les fichiers référencés pour reconstruire si l'un d'eux change
  function versionner(texte, dossier) {
    const deps = [];
    const sortie = texte.replace(REFERENCE, (tout, q, ref) => {
      const cible = ref.startsWith('/') ? path.join(racine, ref) : path.join(racine, ref);
      const v = versionDe(cible);
      if (!v) return tout;
      deps.push({ f: cible, v });
      return q + ref + '?v=' + v + q;
    }).replace(REFERENCE_IMG, (ref) => {
      const cible = ref.startsWith('../') ? path.join(dossier, ref) : path.join(racine, ref);
      const v = versionDe(cible);
      if (!v) return ref;
      deps.push({ f: cible, v });
      return ref + '?v=' + v;
    });
    return { sortie, deps };
  }
  // contenu réécrit à jour tant que chaque fichier référencé garde la version posée (et non seulement sa date)
  const depsAJour = (e) => !e.deps || e.deps.every(d => versionDe(d.f) === d.v);

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let rel;
    try { rel = decodeURIComponent(req.path); } catch { return next(); }   // %E0%A4%A… : chemin indécodable, pas un fichier
    if (rel.endsWith('/')) rel += 'index.html';
    if (rel === '/favicon.ico') rel = '/assets/img/favicon.ico';   // demandé d'office par les navigateurs
    let fichier = path.join(racine, path.normalize(rel));
    if (!fichier.startsWith(racine)) return next();
    if (!path.extname(fichier) && fs.existsSync(fichier + '.html')) fichier += '.html';
    const ext = path.extname(fichier).toLowerCase();
    const type = TYPES[ext] || IMAGES[ext];
    if (!type) return next();
    let st; try { st = fs.statSync(fichier); } catch { return next(); }
    if (!st.isFile()) return next();

    let e = memoire.get(fichier);
    if (!e || e.mtime !== st.mtimeMs || !depsAJour(e)) {
      let brut = fs.readFileSync(fichier);
      const version = empreinte(brut).slice(0, 10);
      let deps;
      if (ext === '.html' || ext === '.js' || ext === '.css') { const r = versionner(brut.toString('utf8'), path.dirname(fichier)); brut = Buffer.from(r.sortie, 'utf8'); deps = r.deps; }
      e = { mtime: st.mtimeMs, brut, version, deps, empreinte: empreinte(brut) };
      if (TYPES[ext] && brut.length > 1024) {
        e.br = zlib.brotliCompressSync(brut, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10 } });
        e.gz = zlib.gzipSync(brut, { level: 9 });
      }
      memoire.set(fichier, e);
    }
    res.setHeader('Content-Type', type);
    res.setHeader('Vary', 'Accept-Encoding');
    // fichier demandé avec sa version exacte : son contenu ne changera jamais à cette adresse
    const versionne = VERSIONNABLES.has(ext) && req.query && req.query.v === versionDe(fichier);
    // « private » : seul le navigateur garde le fichier. Un cache partagé (proxy de l'hébergeur) servait la version
    // Brotli étiquetée gzip : le navigateur recevait des octets illisibles (page sans styles ni scripts).
    res.setHeader('Cache-Control', versionne ? 'private, max-age=31536000, immutable'
      : TYPES[ext] ? 'no-cache' : 'public, max-age=3600, stale-while-revalidate=604800');
    // Encodage choisi AVANT l'empreinte : un corps Brotli, gzip ou brut n'a pas la même empreinte (-br, -gz, -id). Un cache partagé
    // (proxy de l'hébergeur) qui revalide avec l'empreinte d'un autre encodage reçoit 200 et le bon corps, jamais 304 pour des
    // octets qu'il ne sait pas lire (page sans styles sur HODI).
    const accepte = String(req.headers['accept-encoding'] || '');
    let corps = e.brut, enc = 'id';
    if (e.br && /\bbr\b/.test(accepte)) { corps = e.br; enc = 'br'; res.setHeader('Content-Encoding', 'br'); }
    else if (e.gz && /\bgzip\b/.test(accepte)) { corps = e.gz; enc = 'gz'; res.setHeader('Content-Encoding', 'gzip'); }
    const etag = `"${e.empreinte}-${enc}"`;
    res.setHeader('ETag', etag);
    if (correspond(req.headers['if-none-match'], etag)) { res.statusCode = 304; return res.end(); }
    res.setHeader('Content-Length', corps.length);
    res.end(req.method === 'HEAD' ? undefined : corps);
  };
}

// res.json compressé pour les réponses volumineuses de l'API (GET /api/etat pèse plusieurs dizaines de Ko)
function jsonCompresse(req, res, next) {
  const json = res.json.bind(res);
  res.json = (obj) => {
    const texte = JSON.stringify(obj);
    if (texte === undefined || texte.length < 1400 || !/\bgzip\b/.test(String(req.headers['accept-encoding'] || ''))) return json(obj);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    return res.send(zlib.gzipSync(texte, { level: 6 }));
  };
  next();
}

module.exports = { statique, jsonCompresse };
