/* Terra Nova — vague 16 (F83) : accusé de réception d'une demande.
   Chaque demande reçoit, dès son enregistrement, un accusé : référence NT-xxxx, date et heure de réception, service destinataire,
   résumé et un code de vérification (8 caractères, calculé par HMAC avec une clé du serveur, donc impossible à deviner).
   - l'habitant le retrouve tout de suite après l'envoi, dans le suivi et dans son espace ; il l'imprime ou l'enregistre en PDF ;
   - n'importe qui peut vérifier un accusé (référence + code) sur /verifier-accuse.html : la réponse ne contient aucune donnée
     personnelle (ni nom, ni message, ni objet) ; un mauvais code répond « introuvable », comme une référence inexistante ;
   - copie dans les notifications de l'habitant connecté. */
const router = require('express').Router();
const crypto = require('node:crypto');
const { docs, notifier } = require('../donnees');
const { deriver } = require('../chiffrement');
const A = require('../auth');
const bouclier = require('../bouclier');

const SECRET = deriver('accuses-v16');
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';   // sans 0/O, 1/I : lisible à l'oral et à la main
function code(d) {
  const h = crypto.createHmac('sha256', SECRET).update(`${d.id}|${d.cree}`).digest();
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[h[i] % 32];
  return s.slice(0, 4) + '-' + s.slice(4);
}
const normaliser = (c) => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
const egal = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// Accusé d'une demande (créé à la première lecture pour les demandes plus anciennes que la vague 16)
function accuseDe(d) {
  if (d.accuse && d.accuse.code) return d.accuse;
  const a = { code: code(d), emis: d.cree };
  docs.patch('demandes', d.id, { accuse: a });
  return a;
}
const TYPES = { contact: 'Contact', signalement: 'Signalement', demarche: 'Démarche' };
const nomService = (id) => { const s = id && docs.get('services', id); return s ? s.nom : null; };

// Vue de l'accusé : complète (habitant, personnel, porteur du code) ou publique (aucune donnée personnelle)
function vue(d, niveau) {
  const a = accuseDe(d);
  const base = { reference: d.id, recuLe: d.cree, type: d.type || 'contact', typeLibelle: TYPES[d.type] || 'Demande', serviceId: d.serviceId || '',
    service: nomService(d.serviceId), statut: d.statut, canal: 'Plateforme en ligne Terra Nova', verification: '/verifier-accuse.html?ref=' + encodeURIComponent(d.id) };
  if (niveau === 'public') return Object.assign(base, { authentique: true });
  return Object.assign(base, { code: a.code, objet: d.objet || '', quartier: d.quartier || '',
    resume: niveau === 'proprietaire' ? String(d.message || '').slice(0, 280) : '', emis: a.emis });
}

// Appelé à la création d'une demande (src/modules/api.js) : accusé posé sur la demande + copie dans les notifications
function apresCreation(d) {
  const a = { code: code(d), emis: d.cree };
  d.accuse = a;
  docs.patch('demandes', d.id, { accuse: a });
  if (d.userId) {
    const s = nomService(d.serviceId);
    const quand = new Date(d.cree).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Indian/Mayotte' });
    notifier(d.userId, `Accusé de réception : demande ${d.id}`,
      `La ville a bien reçu votre demande « ${d.objet || 'sans objet'} » le ${quand}${s ? ` (service : ${s.fr})` : ''}. Code de vérification : ${a.code}. Conservez cet accusé : il prouve la date de votre demande.`,
      'accuse.html?id=' + encodeURIComponent(d.id), 'info');
  }
  return d;
}

/* ---------- Vérification publique (limitée : 30 essais par 10 min et par IP) ---------- */
const essais = new Map();
router.get('/api/accuses/verifier', (req, res) => {
  const t = Date.now();
  const l = (essais.get(req.ip) || []).filter((x) => x > t - 10 * 60e3);
  if (l.length >= 30) {
    res.setHeader('Retry-After', '600');
    return bouclier.bloquer(req, res, 429, 'debit', 'Trop de vérifications en peu de temps. Réessayez dans quelques minutes.', 'vérification d’accusés de réception');
  }
  l.push(t); essais.set(req.ip, l);
  if (essais.size > 5000) essais.clear();
  res.set('Cache-Control', 'no-store');
  const ref = String(req.query.ref || '').trim().toUpperCase().replace(/\s+/g, '');
  const c = normaliser(req.query.code);
  const d = /^NT-\d{1,8}$/.test(ref) ? docs.get('demandes', ref) : null;
  if (!d || c.length !== 8 || !egal(normaliser(accuseDe(d).code), c)) {
    return res.status(404).json({ authentique: false, erreur: 'Aucun accusé de réception ne correspond à cette référence et à ce code. Vérifiez les 8 caractères du code.' });
  }
  res.json(vue(d, 'public'));
});

// Accusé complet : l'habitant concerné, le personnel, ou toute personne qui a le code (visiteur sans compte)
router.get('/api/accuses/:id', (req, res) => {
  const d = docs.get('demandes', String(req.params.id).toUpperCase());
  res.set('Cache-Control', 'no-store');
  const proprietaire = d && req.user && (d.userId === req.user.id || A.estPersonnel(req.user));
  const parCode = d && req.query.code && egal(normaliser(accuseDe(d).code), normaliser(req.query.code));
  if (!d || !(proprietaire || parCode)) return res.status(404).json({ erreur: 'Accusé de réception introuvable (ou réservé à la personne qui a envoyé la demande).' });
  res.json(vue(d, proprietaire ? 'proprietaire' : 'code'));
});

module.exports = router;
module.exports.apresCreation = apresCreation;
module.exports.accuseDe = accuseDe;
