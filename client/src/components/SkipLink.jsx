import { MAIN_ID, focusMain } from '../lib/focus.js';

// Lien d'évitement : premier élément atteint à la tabulation, mène au contenu principal.
export default function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      onClick={(e) => {
        if (focusMain()) e.preventDefault();
      }}
      className="fixed left-4 top-4 z-[60] -translate-y-[200%] rounded-control bg-surface px-4 py-2 font-bold text-ink shadow-pop focus:translate-y-0"
    >
      Aller au contenu
    </a>
  );
}
