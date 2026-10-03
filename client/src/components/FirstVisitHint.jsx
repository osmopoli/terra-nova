import { useId, useRef, useState } from 'react';
import { isHintSeen, markHintSeen } from '../lib/hints.js';

/**
 * Indication courte affichée à la première visite d'un écran clé (WEBC-58).
 * Non modale : elle ne bloque rien, se lit dans l'ordre du contenu et se ferme au clavier.
 * Une fois fermée, elle ne réapparaît plus (mémorisée dans le navigateur).
 * Masquée tant que le guide de première connexion (D12) est affiché, pour ne pas empiler deux encarts.
 */
export default function FirstVisitHint({ id, title, user, children, className = '' }) {
  const [open, setOpen] = useState(() => !isHintSeen(id));
  const titleId = useId();
  const ref = useRef(null);

  const guideShown = user?.role === 'citoyen' && !user.onboardedAt;
  if (!open || guideShown) return null;

  function close() {
    markHintSeen(id);
    // Le focus revient au contenu principal plutôt que de se perdre en haut de page.
    ref.current?.closest('main')?.focus();
    setOpen(false);
  }

  return (
    <aside
      lang="fr"
      ref={ref}
      aria-labelledby={titleId}
      className={`relative flex gap-3 rounded-card border border-primary bg-mist p-4 text-left shadow-card ${className}`}
      onKeyDown={(e) => e.key === 'Escape' && close()}
    >
      <span aria-hidden="true" className="mt-1 h-auto w-1 shrink-0 rounded-full bg-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Premiers pas</p>
        <h2 id={titleId} className="mt-1 font-display text-base font-bold text-ink">
          {title}
        </h2>
        <div className="mt-1 text-sm text-ink-muted">{children}</div>
        <button
          type="button"
          onClick={close}
          className="mt-3 rounded-control border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:bg-canvas"
        >
          J'ai compris<span className="sr-only">, fermer cette indication</span>
        </button>
      </div>
    </aside>
  );
}
