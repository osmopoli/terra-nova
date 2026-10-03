/* Terra Nova — chiffrement des données sensibles au repos (F69)
   AES-256-GCM (node:crypto) : le téléphone et le dossier administratif des habitants sont chiffrés dans la base.
   Clé : variable d'environnement DATA_ENCRYPTION_KEY (recommandé en production). À défaut, une clé aléatoire est
   créée une fois dans un fichier à côté de la base (droits 600), hors du dépôt git et hors du dossier de release.
   Chaque valeur chiffrée est liée à sa collection, son document et son champ (données associées) : impossible
   de recopier le téléphone chiffré d'un habitant dans le profil d'un autre. Les anciennes valeurs en clair restent
   lisibles et sont chiffrées à la prochaine écriture (aucune migration à lancer). */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const PREFIXE = 'enc:v1:';
// Champs chiffrés par collection
const CHAMPS = { utilisateurs: ['telephone', 'dossier'] };

function fichierCle() {
  const base = process.env.DB_PATH
    || (process.env.NODE_ENV === 'production' ? path.join(os.homedir(), 'terranova-data', 'terranova.db') : path.join(__dirname, '..', 'data', 'terranova.db'));
  return path.join(path.dirname(base), 'terranova.key');
}

let CLE = null;
function cle() {
  if (CLE) return CLE;
  const env = process.env.DATA_ENCRYPTION_KEY;
  if (env) CLE = crypto.createHash('sha256').update(String(env)).digest();
  else {
    const f = fichierCle();
    let brut = '';
    try { brut = fs.readFileSync(f, 'utf8').trim(); } catch { /* première exécution */ }
    if (!/^[a-f0-9]{64}$/.test(brut)) {
      brut = crypto.randomBytes(32).toString('hex');
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, brut, { mode: 0o600 });
      if (process.env.NODE_ENV === 'production') console.warn('[sécurité] DATA_ENCRYPTION_KEY absente : clé de chiffrement créée dans', f);
    }
    CLE = Buffer.from(brut, 'hex');
  }
  return CLE;
}

function chiffrer(valeur, contexte) {
  if (valeur === undefined || valeur === null || valeur === '') return valeur;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', cle(), iv);
  c.setAAD(Buffer.from(String(contexte || '')));
  const donnees = Buffer.concat([c.update(JSON.stringify(valeur), 'utf8'), c.final()]);
  return PREFIXE + [iv, c.getAuthTag(), donnees].map((b) => b.toString('base64url')).join('.');
}
let alerte = false;
function dechiffrer(texte, contexte) {
  if (typeof texte !== 'string' || !texte.startsWith(PREFIXE)) return texte;
  try {
    const [iv, tag, donnees] = texte.slice(PREFIXE.length).split('.').map((s) => Buffer.from(s, 'base64url'));
    const d = crypto.createDecipheriv('aes-256-gcm', cle(), iv);
    d.setAAD(Buffer.from(String(contexte || '')));
    d.setAuthTag(tag);
    return JSON.parse(Buffer.concat([d.update(donnees), d.final()]).toString('utf8'));
  } catch {
    if (!alerte) { alerte = true; console.error('[sécurité] une donnée chiffrée n’a pas pu être lue (clé différente ou donnée altérée)'); }
    return null;
  }
}

// Empreinte non réversible (recherche d'un compte par numéro de téléphone sans stocker le numéro en clair)
const empreinte = (texte) => crypto.createHmac('sha256', cle()).update('tn:' + String(texte)).digest('hex');

// Avant écriture : copie dont les champs sensibles sont chiffrés
function sceller(col, obj) {
  const champs = CHAMPS[col];
  if (!champs || !obj) return obj;
  const copie = { ...obj };
  for (const f of champs) if (f in copie && copie[f] !== '' && copie[f] != null && !(typeof copie[f] === 'string' && copie[f].startsWith(PREFIXE))) copie[f] = chiffrer(copie[f], `${col}:${obj.id}:${f}`);
  return copie;
}
// Après lecture : champs sensibles déchiffrés
function ouvrir(col, obj) {
  const champs = CHAMPS[col];
  if (!champs || !obj) return obj;
  for (const f of champs) if (typeof obj[f] === 'string' && obj[f].startsWith(PREFIXE)) obj[f] = dechiffrer(obj[f], `${col}:${obj.id}:${f}`);
  return obj;
}

module.exports = { chiffrer, dechiffrer, empreinte, sceller, ouvrir, CHAMPS, PREFIXE };
