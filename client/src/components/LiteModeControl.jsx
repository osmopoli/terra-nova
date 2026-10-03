import { useId, useState } from 'react';
import { applyLiteMode, getLiteMode } from '../lib/lite.js';

// Bouton bascule « Version allégée » : pages plus simples et plus rapides à afficher.
export default function LiteModeControl({ className = '', withHint = false }) {
  const [enabled, setEnabled] = useState(getLiteMode);
  const hintId = useId();
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <button
        type="button"
        aria-pressed={enabled}
        aria-describedby={withHint ? hintId : undefined}
        title={withHint ? undefined : 'Pour une connexion lente ou un appareil ancien'}
        onClick={() => setEnabled(applyLiteMode(!enabled))}
        className="group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control border border-current px-2.5 text-sm font-bold aria-pressed:bg-current/15"
      >
        <span aria-hidden="true" className="size-4 rounded-sm border-2 border-current group-aria-pressed:bg-current" />
        Version allégée
      </button>
      {withHint && (
        <span id={hintId} className="text-sm">
          Pour une connexion lente ou un appareil ancien : pages plus simples, sans images ni animations.
        </span>
      )}
    </span>
  );
}
