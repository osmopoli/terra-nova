import { useEffect, useRef, useState } from 'react';
import { useLocation } from '../lib/router.jsx';

// Navigation sans rechargement : le lecteur d'écran n'entend rien et le focus reste
// sur le lien cliqué. À chaque changement de page, on annonce le nouveau titre et on
// place le focus sur le titre principal (h1), à défaut sur le contenu.
export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Après le rendu de la nouvelle page et la mise à jour du titre d'onglet.
    const timer = setTimeout(() => {
      const target = document.querySelector('main h1') ?? document.querySelector('main');
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      setMessage(document.title);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  );
}
