import { useState } from 'react';
import { applyHighContrast, getHighContrast } from '../lib/contrast.js';

// Bouton bascule « Contraste élevé » : noir et blanc, bordures marquées, liens soulignés.
export default function ContrastControl({ className = '' }) {
  const [enabled, setEnabled] = useState(getHighContrast);
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => setEnabled(applyHighContrast(!enabled))}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control border border-current px-2.5 text-sm font-bold aria-pressed:bg-current/15 ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-4 rounded-full border-2 border-current bg-linear-to-r from-current from-50% to-transparent to-50%"
      />
      Contraste élevé
    </button>
  );
}
