/* Terra Nova — envoi sobre des fichiers (F58, F59)
   - textes (HTML, CSS, JS, SVG, JSON) compressés en Brotli ou gzip, compressés une seule fois puis gardés en mémoire ;
   - empreinte (ETag) : un fichier inchangé n'est pas renvoyé (304) ;
   - versions : dans les pages et les scripts, chaque « assets/…css|js » reçoit l'empreinte de son contenu (?v=…).
     Un fichier modifié change donc d'adresse : un navigateur ne peut plus garder une ancienne feuille de style ou un
     ancien script après un déploiement, quel que soit ce qu'il a en cache. Les fichiers versionnés sont gardés un an ;
   - pages, et fichiers demandés sans version : revalidés à chaque visite (304 si inchangés), images et polices gardées 1 h ;
   - réponses JSON de l'API compressées en gzip au-delà de 1,4 Ko. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const IMAGES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
// « assets/css/x.css » ou « assets/js/x.js » entre guillemets (attribut HTML ou chaîne JS), sans version déjà posée
const REFERENCE = /(["'])(\/?assets\/(?:css|js)\/[\w.-]+\.(?:css|js))\1/g;

const empreinte = (buf) => crypto.createHash('sha1').update(buf).digest('base64url').slice(0, 20);

function statique(racine) {
  const memoire = new Map();   // chemin → { mtime, etag, version, brut, br, gz, deps }
  const versions = new Map();  // chemin → { mtime, version } (empreinte du contenu d'origine)

  function versionDe(fichier) {
    let st; try { st = fs.statSync(fichier); } catch { return null; }
    const v = versions.get(fichier);
    if (v && v.mtime === st.mtimeMs) return v.version;
    const version = empreinte(fs.readFileSync(fichier)).slice(0, 10);
    versions.set(fichier, { mtime: st.mtimeMs, version });
    return version;
  }
  // Pose ?v=… sur les références ; retient les fichiers référencés pour reconstruire si l'un d'eux change
  function versionner(texte, dossier) {
    const deps = [];
    const sortie = texte.replace(REFERENCE, (tout, q, ref) => {
      const cible = ref.startsWith('/') ? path.join(racine, ref) : path.join(racine, ref);
      const v = versionDe(cible);
      if (!v) return tout;
      deps.push(cible);
      return q + ref + '?v=' + v + q;
    });
    return { sortie, deps };
  }
  const depsAJour = (e) => !e.deps || e.deps.every(d => { const v = versions.get(d); try { return v && fs.statSync(d).mtimeMs === v.mtime; } catch { return false; } });

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let rel;
    try { rel = decodeURIComponent(req.path); } catch { return next(); }   // %E0%A4%A… : chemin indécodable, pas un fichier
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
    if (!e || e.mtime !== st.mtimeMs || !depsAJour(e)) {
      let brut = fs.readFileSync(fichier);
      const version = empreinte(brut).slice(0, 10);
      let deps;
      if (ext === '.html' || ext === '.js') { const r = versionner(brut.toString('utf8'), path.dirname(fichier)); brut = Buffer.from(r.sortie, 'utf8'); deps = r.deps; }
      e = { mtime: st.mtimeMs, brut, version, deps, etag: '"' + empreinte(brut) + '"' };
      if (TYPES[ext] && brut.length > 1024) {
        e.br = zlib.brotliCompressSync(brut, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10 } });
        e.gz = zlib.gzipSync(brut, { level: 9 });
      }
      memoire.set(fichier, e);
    }
    res.setHeader('Content-Type', type);
    res.setHeader('ETag', e.etag);
    res.setHeader('Vary', 'Accept-Encoding');
    // fichier demandé avec sa version exacte : son contenu ne changera jamais à cette adresse
    const versionne = (ext === '.css' || ext === '.js') && req.query && req.query.v === versionDe(fichier);
    res.setHeader('Cache-Control', versionne ? 'public, max-age=31536000, immutable'
      : TYPES[ext] ? 'no-cache' : 'public, max-age=3600, stale-while-revalidate=604800');
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
