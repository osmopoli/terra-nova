'use strict'
// Point d'entrée Passenger sur HODI (copié dans server/build/ par tools/build-hodi.js).
// Passenger intercepte app.listen() : le serveur doit démarrer dans ce processus.
const fs = require('node:fs')
const path = require('node:path')

// Variables écrites par la commande de build Hodifly (printenv > .env)
const env = path.join(__dirname, '.env')
if (fs.existsSync(env)) process.loadEnvFile(env)

// node:sqlite est stable sans option depuis Node 22.13 : on masque seulement son avertissement « expérimental »
const emettre = process.emitWarning
process.emitWarning = (w, ...rest) => {
  const type = typeof rest[0] === 'string' ? rest[0] : rest[0] && rest[0].type
  if (type === 'ExperimentalWarning' || (w && w.name === 'ExperimentalWarning')) return
  return emettre.call(process, w, ...rest)
}

try {
  require('node:sqlite')
} catch (error) {
  console.error(`[terra-nova] node:sqlite indisponible sur Node ${process.version} : Node 22.13 ou plus récent est requis.`)
  throw error
}

require('./server.js')
