import galaxie480Avif from '../assets/galaxie-480.avif';
import galaxie800Avif from '../assets/galaxie-800.avif';
import galaxie1280Avif from '../assets/galaxie-1280.avif';
import galaxie480 from '../assets/galaxie-480.webp';
import galaxie800 from '../assets/galaxie-800.webp';
import galaxie1280 from '../assets/galaxie-1280.webp';
import { useLightMode } from '../lib/lightMode.js';

// Galaxie spirale NGC 4639 (Hubble), visuel du parcours d'arrivée. Décor : alt vide, le texte porte le sens.
// AVIF d'abord (≈ −40 %), repli WebP. Le positionnement (className) porte sur <picture> : l'image le remplit.
// Version légère : rien n'est rendu, donc aucun fichier du srcset n'est téléchargé.
export default function GalaxyImage({ className = '', sizes = '100vw', priority = false }) {
  const light = useLightMode();
  if (light) return null;
  return (
    <picture className={`pointer-events-none select-none ${className}`}>
      <source
        type="image/avif"
        srcSet={`${galaxie480Avif} 480w, ${galaxie800Avif} 800w, ${galaxie1280Avif} 1280w`}
        sizes={sizes}
      />
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
        className="size-full object-cover object-center"
      />
    </picture>
  );
}
