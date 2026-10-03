// Vague 14 (F74) : associations partenaires — horaires, lieu, téléphone et ce pour quoi elles aident, sur une seule fiche.
// Lecture publique ; seuls agents / admins modifient les horaires (et l'information ponctuelle), contrôlé ici et journalisé.
const router = require('express').Router();
const { docs, audit, maintenant } = require('../donnees');
const A = require('../auth');

const erreur = (res, code, msg) => res.status(code).json({ erreur: msg });
const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const HEURE = /^([01]\d|2[0-4]):[0-5]\d$/;
const NOMS_JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const COL = 'associations';

router.get('/api/associations', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(docs.tous(COL).sort((a, b) => (a.ordre || 0) - (b.ordre || 0)));
});

// Plages horaires : [[jours 0-6 (0 = dimanche)], "HH:MM", "HH:MM"] ; une plage par jour au plus, fin après début
function lirePlages(v) {
  if (!Array.isArray(v) || v.length > 14) return null;
  const vus = new Set();
  const plages = [];
  for (const p of v) {
    if (!Array.isArray(p) || p.length !== 3 || !Array.isArray(p[0])) return null;
    const jours = [...new Set(p[0].map(Number))].filter((j) => Number.isInteger(j) && j >= 0 && j <= 6);
    const [de, a] = [String(p[1]), String(p[2])];
    if (!jours.length || !HEURE.test(de) || !HEURE.test(a) || a <= de) return null;
    if (jours.some((j) => vus.has(`${j}|${de}`))) return null;
    jours.forEach((j) => vus.add(`${j}|${de}`));
    plages.push([jours.sort(), de, a]);
  }
  return plages;
}
const resumePlages = (pl) => pl.map(([j, de, a]) => `${j.map((x) => NOMS_JOURS[x]).join(' ')} ${de}–${a}`).join(' · ') || 'fermée';

router.patch('/api/associations/:id', A.exigerRole('agent', 'admin'), (req, res) => {
  const as = docs.get(COL, req.params.id);
  if (!as) return erreur(res, 404, 'Association introuvable.');
  const b = req.body || {};
  const plages = b.plages === undefined ? as.plages : lirePlages(b.plages);
  if (!plages) return erreur(res, 400, 'Horaires invalides : pour chaque jour ouvert, indiquez une heure d’ouverture et une heure de fermeture plus tardive (HH:MM).');
  const info = b.info === undefined ? (as.info || '') : texte(b.info, 200);
  const maj = docs.patch(COL, as.id, { plages, info, majHoraires: maintenant(), majPar: `${req.user.prenom} ${req.user.nom}` });
  audit(req.user, { categorie: 'service', action: 'Horaires d’une association partenaire', objetId: as.id, objetLibelle: as.nom,
    avant: resumePlages(as.plages || []) + (as.info ? ` · ${as.info}` : ''), apres: resumePlages(plages) + (info ? ` · ${info}` : ''), motif: texte(b.motif, 200) });
  res.json(maj);
});

module.exports = router;
