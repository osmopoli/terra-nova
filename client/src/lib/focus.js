import { useEffect, useRef } from 'react';
import { useLocation } from './router.jsx';

export const MAIN_ID = 'contenu';

// Place le focus clavier sur la zone principale (#contenu), sans faire défiler la page.
export function focusMain() {
  const main = document.getElementById(MAIN_ID);
  if (!main) return false;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  main.focus({ preventScroll: true });
  return true;
}

// Après chaque changement de page (pas au premier affichage), le focus part du contenu :
// l'utilisateur clavier ne repart pas du haut du document ni d'un élément disparu.
export function FocusSync() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    // Attend le rendu de la nouvelle page (le layout peut changer).
    requestAnimationFrame(focusMain);
  }, [pathname]);
  return null;
}
