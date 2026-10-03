// Express 4 ne capte pas les rejets de promesse : on les renvoie vers le gestionnaire d'erreurs.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ah };
