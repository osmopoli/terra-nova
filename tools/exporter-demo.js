// Exporte les données de démonstration de la maquette (ancien store localStorage) vers data/demo-seed.json.
// Les dates sont stockées en décalage relatif (« @<ms avant l'export> ») pour rester « récentes » à chaque démarrage.
// Usage : node tools/exporter-demo.js <chemin vers l'ancien store.js>
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = process.argv[2];
if (!source) { console.error('Usage : node tools/exporter-demo.js <ancien store.js>'); process.exit(1); }
const memoire = {};
const localStorage = { getItem: k => (k in memoire ? memoire[k] : null), setItem: (k, v) => { memoire[k] = String(v); }, removeItem: k => { delete memoire[k]; } };
const documentFactice = { documentElement: { style: {}, classList: { add() {} }, lang: '', dir: '' } };
const ctx = { window: {}, document: documentFactice, localStorage, console, Date, Math, JSON };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(source, 'utf8'), ctx);

const maintenant = Date.now();
const relatif = v => {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) return '@' + (maintenant - Date.parse(v));
  if (Array.isArray(v)) return v.map(relatif);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, relatif(x)]));
  return v;
};
const lire = cle => JSON.parse(memoire['nt:' + cle] || '[]');
const MOTS_DE_PASSE = { 'citoyen@nova.test': 'Citoyen2026', 'agent@nova.test': 'Agent2026', 'admin@nova.test': 'Admin2026', 'marc@nova.test': 'Citoyen2026', 'amina@nova.test': 'Citoyen2026', 'jean@nova.test': 'Citoyen2026' };
const utilisateurs = lire('utilisateurs').map(({ sel, mdp, ...u }) => Object.assign(u, { motdepasseDemo: MOTS_DE_PASSE[u.email] }));
const sortie = {
  genere: new Date(maintenant).toISOString(),
  compteur: JSON.parse(memoire['nt:compteur'] || '1040'),
  utilisateurs: relatif(utilisateurs),
  services: relatif(lire('services')),
  demandes: relatif(lire('demandes')),
  annonces: relatif(lire('annonces')),
  audit: relatif(lire('audit'))
};
const cible = path.join(__dirname, '..', 'data', 'demo-seed.json');
fs.writeFileSync(cible, JSON.stringify(sortie, null, 1));
console.log('demo-seed.json :', Object.entries(sortie).filter(([, v]) => Array.isArray(v)).map(([k, v]) => k + '=' + v.length).join(', '));
