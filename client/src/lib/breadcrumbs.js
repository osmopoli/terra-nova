// Libellés du fil d'Ariane, par chemin. Ajouter ici chaque nouvelle rubrique
// (ex. '/services': 'Services') : les niveaux absents de la liste sont ignorés,
// sauf le dernier, affiché comme « Détail » (ex. /services/etat-civil).
export const SECTION_LABELS = {
  '/services': 'Services',
  '/contact': 'Contact',
  '/urgences': 'Urgences et santé',
  '/actualites': 'Actualités',
  '/demandes': 'Mes demandes',
  '/admin/alertes': 'Alertes',
  '/agent': 'Espace agent',
  '/profil': 'Mon profil',
  '/connexion': 'Connexion',
};

// Accueil › Rubrique › Détail. Le dernier niveau est la page courante (sans lien).
export function breadcrumbTrail(pathname, labels = SECTION_LABELS) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];
  const trail = [{ to: '/', label: 'Accueil' }];
  segments.forEach((_, index) => {
    const to = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    if (labels[to]) trail.push({ to, label: labels[to] });
    else if (isLast) trail.push({ to, label: trail.length > 1 ? 'Détail' : 'Page introuvable' });
  });
  return trail;
}

// Une entrée de menu est active sur sa page et sur ses sous-pages.
export function isActivePath(pathname, to) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}
