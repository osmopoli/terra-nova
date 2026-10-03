import { MAIN_ID, focusMain } from '../lib/focus.js';

// Lien d'évitement : premier élément atteint à la tabulation, mène au contenu principal.
// Replié tant qu'il n'a pas le focus ; au focus, bandeau en haut de page qui pousse l'en-tête
// (il ne recouvre jamais le logo).
export default function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      onClick={(e) => {
        if (focusMain()) e.preventDefault();
      }}
      className="block h-0 overflow-hidden bg-surface text-center text-sm font-bold text-ink focus:h-auto focus:py-3 focus-visible:outline-primary focus-visible:-outline-offset-4"
    >
      Aller au contenu
    </a>
  );
}
