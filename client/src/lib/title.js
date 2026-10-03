import { useEffect } from 'react';
import { APP_NAME } from './constants.js';
import { useLocation } from './router.jsx';

// Titre d'onglet par page : « Contact — Terra Nova ». Le préfixe le plus long l'emporte
// (/services/piscine -> « Services »). Une page peut préciser son titre avec usePageTitle().
const TITLES = {
  '/': 'Accueil',
  '/connexion': 'Connexion',
  '/profil': 'Mon profil',
  '/contact': 'Contact',
  '/accessibilite': 'Accessibilité',
  '/sobriete': 'Sobriété numérique',
  '/services': 'Services',
  '/actualites': 'Actualités',
  '/mes-demarches': 'Mes démarches',
  '/mes-demarches/nouvelle': 'Nouvelle démarche',
  '/signaler': 'Signaler un problème',
  '/agent': 'Espace agent',
  '/agent/demandes': 'Demandes des habitants',
  '/admin/alertes': 'Alertes',
};

export const pageTitle = (title) => (title ? `${title} — ${APP_NAME}` : APP_NAME);

function titleFor(pathname) {
  const match = Object.keys(TITLES)
    .filter((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)))
    .sort((a, b) => b.length - a.length)[0];
  return match ? TITLES[match] : null;
}

export function usePageTitle(title) {
  const { pathname } = useLocation();
  // pathname en dépendance : rejoué à chaque navigation, dans l'ordre de l'arbre.
  useEffect(() => {
    document.title = pageTitle(title);
  }, [title, pathname]);
}

// Monté avant <App /> : les pages qui appellent usePageTitle() passent après et gardent la main.
export function TitleSync() {
  usePageTitle(titleFor(useLocation().pathname));
  return null;
}
