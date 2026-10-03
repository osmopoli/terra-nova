// Nom affiché de l'application : à changer à H+0 (aussi dans index.html et public/manifest.webmanifest).
export const APP_NAME = 'Nova Terra';

// Les constantes métier NE SONT PAS recopiées ici : elles viennent de
// GET /api/meta (source de vérité : server/app/constants/domain.ts).
// Utiliser `labelOf(meta.categories, value)` pour afficher un libellé.
export function labelOf(options = [], value) {
  return options.find((o) => o.value === value)?.label ?? value ?? '';
}
