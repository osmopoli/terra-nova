import { useId } from 'react';
import { applyLightMode, useLightMode } from '../lib/lightMode.js';

// Bouton bascule « Version légère » : moins d'images et d'animations, pages plus rapides.
export default function LightModeControl({ className = '' }) {
  const enabled = useLightMode();
  const hintId = useId();
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-describedby={hintId}
      title="Moins d’images et d’animations, pages plus rapides"
      onClick={() => applyLightMode(!enabled)}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control border border-current px-2.5 text-sm font-bold aria-pressed:bg-current/15 ${className}`}
    >
      <span aria-hidden="true" className="size-4 rounded-full border-2 border-current" />
      Version légère
      <span id={hintId} className="sr-only">
        Moins d’images et d’animations, pages plus rapides.
      </span>
    </button>
  );
}
