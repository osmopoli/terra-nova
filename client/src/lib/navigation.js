// Menu unique de l'application, par espace et par rôle (rôles renvoyés par /api/me).
// Pour publier une nouvelle page : ajouter UNE ligne ici, son libellé dans
// SECTION_LABELS (breadcrumbs.js) et sa route dans App.jsx. Ne plus modifier les layouts.
// Ne lister que des pages réellement routées : pas de lien mort.
// `roles` absent = visible par tout le monde (y compris les visiteurs).
const EVERYONE = undefined;

export const CITIZEN_NAV = [
  { to: '/', label: 'Accueil', roles: EVERYONE },
  { to: '/services', label: 'Services', roles: EVERYONE },
  { to: '/contact', label: 'Contact', roles: EVERYONE },
  // À venir avec la vague 2 : /mes-demarches (WEBC-21), /signaler (WEBC-27), /actualites.
  { to: '/agent', label: 'Espace agent', roles: ['agent', 'admin'] },
];

export const AGENT_NAV = [
  { to: '/agent', label: 'Tableau de bord', roles: ['agent', 'admin'] },
  // À venir avec la vague 2 : /agent/demandes (WEBC-13, compteur WEBC-26),
  // /admin/comptes (WEBC-44) et /admin/alertes (WEBC-31), réservés à l'admin.
];

export function navFor(items, user) {
  return items.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
}

// Garde d'UX : la vraie vérification des droits reste faite par l'API (403).
export const canUseAgentSpace = (user) => Boolean(user && navFor(AGENT_NAV, user).length);
