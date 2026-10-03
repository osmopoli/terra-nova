import { APP_NAME } from '../lib/constants.js';

// Marque Terra Nova : emblème (masque rempli d'un dégradé sarcelle, décoratif) + nom en vrai texte.
export default function Brand({ size = 'md', className = '' }) {
  const word = size === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap ${className}`}>
      <span aria-hidden="true" className="logo-embleme" />
      <span className={`font-display font-bold uppercase tracking-[0.16em] ${word}`}>{APP_NAME}</span>
    </span>
  );
}
