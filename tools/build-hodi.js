// Construit server/build/ pour Hodifly (HODI) : la commande de build du projet est figée
//   npm ci && npm run build && cd server/build && npm ci --omit=dev && printenv … > .env
// et Passenger démarre server/build/loader.cjs. Ce script copie l'application telle quelle (pas de bundling).
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const sortie = path.join(racine, 'server', 'build');
fs.rmSync(sortie, { recursive: true, force: true });
fs.mkdirSync(path.join(sortie, 'data'), { recursive: true });

for (const f of ['server.js', 'package.json', 'package-lock.json']) fs.copyFileSync(path.join(racine, f), path.join(sortie, f));
for (const d of ['src', 'public']) fs.cpSync(path.join(racine, d), path.join(sortie, d), { recursive: true });
for (const f of ['demo-seed.json', 'initial-requests.json']) fs.copyFileSync(path.join(racine, 'data', f), path.join(sortie, 'data', f));
fs.copyFileSync(path.join(racine, 'tools', 'loader.cjs'), path.join(sortie, 'loader.cjs'));

console.log('Build Hodifly prêt :', path.relative(racine, sortie));
