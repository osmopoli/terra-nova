import galaxie480 from '../assets/galaxie-480.webp';
import galaxie800 from '../assets/galaxie-800.webp';
import galaxie1280 from '../assets/galaxie-1280.webp';

// Galaxie spirale NGC 4639 (Hubble), visuel du parcours d'arrivée. Décor : alt vide, le texte porte le sens.
export default function GalaxyImage({ className = '', sizes = '100vw', priority = false }) {
  return (
    <img
      src={galaxie800}
      srcSet={`${galaxie480} 480w, ${galaxie800} 800w, ${galaxie1280} 1280w`}
      sizes={sizes}
      width="1280"
      height="1340"
      alt=""
      data-decor=""
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? undefined : 'lazy'}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
