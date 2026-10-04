/* Terra Nova — vague 19 (F95) : ne pas renvoyer une réponse JSON inchangée.
   Chaque réponse GET de l'API reçoit une empreinte (ETag) calculée sur son contenu. Quand le navigateur renvoie cette
   empreinte (If-None-Match, posé par store.js pour les lectures répétées : mises à jour en direct, « pouls »), le serveur
   répond 304 sans corps. Les réponses gardent « Cache-Control: no-store » : rien n'est stocké par le navigateur ou un
   intermédiaire, la comparaison est faite par la page elle-même (données personnelles comprises, en sécurité).
   Express compare normalement lui-même l'ETag, mais ignore If-None-Match dès que la requête porte « Cache-Control: no-cache »,
   ce que fait tout fetch() en mode « no-store » : la comparaison est donc faite ici. */
const crypto = require('node:crypto');

const empreinte = (texte) => '"j' + crypto.createHash('sha1').update(texte).digest('base64url').slice(0, 22) + '"';
const correspond = (entete, etag) => !!entete && String(entete).split(',').some((x) => x.trim().replace(/^W\//, '') === etag);

function etagApi(req, res, next) {
  if (req.method !== 'GET' || !req.path.startsWith('/api/')) return next();
  const json = res.json.bind(res);
  res.json = (obj) => {
    if (res.statusCode !== 200 || res.getHeader('ETag')) return json(obj);
    const texte = JSON.stringify(obj);
    if (texte === undefined) return json(obj);
    const etag = empreinte(texte);
    res.setHeader('ETag', etag);
    if (correspond(req.headers['if-none-match'], etag)) { res.statusCode = 304; res.removeHeader('Content-Type'); return res.end(); }
    return json(obj);
  };
  next();
}

module.exports = { etagApi, correspond };
