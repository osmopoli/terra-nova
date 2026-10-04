#!/usr/bin/env node
/* Terra Nova — vague 19 (F95) : feuille d'icônes réduite aux icônes réellement utilisées.
   Avant : chaque page chargeait deux feuilles Phosphor complètes depuis unpkg (≈ 1 500 icônes chacune, 36 Ko transférés).
   Après : public/assets/css/icones.css, servie par Terra Nova (compressée, versionnée, gardée un an, copiée hors connexion),
   ne contient que les icônes trouvées dans public/, src/ et data/ (≈ 200). Les polices restent celles d'unpkg (mêmes fichiers).
   En « Mode connexion lente » (html.leger), les icônes duotone utilisent la police « regular » : la police duotone
   (165 Ko) n'est alors jamais téléchargée.
   À relancer après l'ajout d'une nouvelle icône :   node tools/icones.js   (lit les feuilles Phosphor 2.1.1 sur unpkg) */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const VERSION = '2.1.1';
const BASE = `https://unpkg.com/@phosphor-icons/web@${VERSION}/src`;
const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'public', 'assets', 'css', 'icones.css');
const EN_PLUS = ['play-circle', 'prohibit', 'wifi-slash', 'wifi-high', 'cloud-arrow-up', 'tray-arrow-up', 'clock-counter-clockwise', 'printer', 'caret-down', 'caret-up', 'map-trifold', 'list-plus'];   // noms construits dans le code (services.js) et icônes de la vague 19

function fichiers(dossier, ext) {
  const l = [];
  for (const f of fs.readdirSync(dossier, { withFileTypes: true })) {
    const p = path.join(dossier, f.name);
    if (f.isDirectory()) { if (!['node_modules', 'build', 'img'].includes(f.name)) l.push(...fichiers(p, ext)); }
    else if (ext.test(f.name) && f.name !== 'icones.css') l.push(p);
  }
  return l;
}
(async () => {
  const noms = new Set(EN_PLUS);
  for (const d of ['public', 'src', 'data']) for (const f of fichiers(path.join(RACINE, d), /\.(html|js|css|json)$/)) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bph-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) noms.add(m[1]);
  }
  ['duotone', 'fill', 'bold', 'light', 'thin'].forEach((n) => noms.delete(n));
  const [reg, duo] = await Promise.all(['regular', 'duotone'].map((p) => fetch(`${BASE}/${p}/style.css`).then((r) => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.text(); })));
  const code = (css, sel) => { const m = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{\\s*content:\\s*"([^"]+)"')); return m ? m[1] : null; };
  const regles = [], absents = [];
  for (const n of [...noms].sort()) {
    const r = code(reg, `.ph.ph-${n}:before`);
    const a = code(duo, `.ph-duotone.ph-${n}:before`), b = code(duo, `.ph-duotone.ph-${n}:after`);
    if (!r && !a) { absents.push(n); continue; }
    if (r) regles.push(`.ph.ph-${n}:before{content:"${r}"}`);
    if (a && b) regles.push(`.ph-duotone.ph-${n}:before{content:"${a}";opacity:.2}.ph-duotone.ph-${n}:after{content:"${b}";margin-inline-start:-1em}`);
  }
  const css = `/* Terra Nova — icônes Phosphor ${VERSION} (licence MIT) réduites aux ${noms.size - absents.length} icônes utilisées. Fichier produit par tools/icones.js : ne pas modifier à la main. */
@font-face{font-family:"Phosphor";src:url("${BASE}/regular/Phosphor.woff2") format("woff2"),url("${BASE}/regular/Phosphor.woff") format("woff");font-weight:normal;font-style:normal;font-display:block}
@font-face{font-family:"Phosphor-Duotone";src:url("${BASE}/duotone/Phosphor-Duotone.woff2") format("woff2"),url("${BASE}/duotone/Phosphor-Duotone.woff") format("woff");font-weight:normal;font-style:normal;font-display:block}
.ph,.ph-duotone{display:inline-block;width:1em;text-align:center;speak:never;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;letter-spacing:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.ph{font-family:"Phosphor"!important}
.ph-duotone{font-family:"Phosphor-Duotone"!important}
html.leger .ph-duotone,html.essentiel-dabord .ph-duotone{font-family:"Phosphor"!important}
html.leger .ph-duotone:before,html.essentiel-dabord .ph-duotone:before{opacity:1!important}
html.leger .ph-duotone:after,html.essentiel-dabord .ph-duotone:after{content:none!important}
${regles.join('\n')}
`;
  fs.writeFileSync(SORTIE, css);
  console.log(`icones.css : ${noms.size - absents.length} icônes, ${(Buffer.byteLength(css) / 1024).toFixed(1)} Ko${absents.length ? ` · inconnues de Phosphor (ignorées) : ${absents.join(', ')}` : ''}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
