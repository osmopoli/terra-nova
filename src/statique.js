/* Terra Nova — envoi sobre des fichiers (F58, F59)
   - textes (HTML, CSS, JS, SVG, JSON) compressés en Brotli ou gzip, compressés une seule fois puis gardés en mémoire ;
   - empreinte (ETag) : un fichier inchangé n'est pas renvoyé (304) ;
   - cache navigateur : pages, scripts et styles revalidés à chaque visite (304 si inchangés), images et polices gardées 1 h ;
   - réponses JSON de l'API compressées en gzip au-delà de 1,4 Ko. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const IMAGES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function statique(racine) {
  const memoire = new Map();   // chemin → { mtime, etag, brut, br, gz }
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let rel = decodeURIComponent(req.path);
    if (rel.endsWith('/')) rel += 'index.html';
    let fichier = path.join(racine, path.normalize(rel));
    if (!fichier.startsWith(racine)) return next();
    if (!path.extname(fichier) && fs.existsSync(fichier + '.html')) fichier += '.html';
    const ext = path.extname(fichier).toLowerCase();
    const type = TYPES[ext] || IMAGES[ext];
    if (!type) return next();
    let st; try { st = fs.statSync(fichier); } catch { return next(); }
    if (!st.isFile()) return next();

    let e = memoire.get(fichier);
    if (!e || e.mtime !== st.mtimeMs) {
      const brut = fs.readFileSync(fichier);
      e = { mtime: st.mtimeMs, brut, etag: '"' + crypto.createHash('sha1').update(brut).digest('base64url').slice(0, 20) + '"' };
      if (TYPES[ext] && brut.length > 1024) {
        e.br = zlib.brotliCompressSync(brut, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10 } });
        e.gz = zlib.gzipSync(brut, { level: 9 });
      }
      memoire.set(fichier, e);
    }
    res.setHeader('Content-Type', type);
    res.setHeader('ETag', e.etag);
    res.setHeader('Vary', 'Accept-Encoding');
    // pages, scripts et styles revalidés à chaque visite (304 sans corps si inchangés) : jamais d'ancien script après un déploiement
    res.setHeader('Cache-Control', TYPES[ext] ? 'no-cache' : 'public, max-age=3600, stale-while-revalidate=604800');
    if (req.headers['if-none-match'] === e.etag) { res.statusCode = 304; return res.end(); }
    const accepte = String(req.headers['accept-encoding'] || '');
    let corps = e.brut;
    if (e.br && /\bbr\b/.test(accepte)) { corps = e.br; res.setHeader('Content-Encoding', 'br'); }
    else if (e.gz && /\bgzip\b/.test(accepte)) { corps = e.gz; res.setHeader('Content-Encoding', 'gzip'); }
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
