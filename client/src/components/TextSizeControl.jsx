import { useState } from 'react';
import { TEXT_SIZES, applyTextSize, getTextSize } from '../lib/textSize.js';

// Chaque bouton montre la taille qu'il applique.
const LABEL_CLASS = ['text-sm', 'text-base', 'text-lg'];

// Contrôle A / A+ / A++ : agrandit tout le texte de l'application (choix mémorisé).
export default function TextSizeControl({ className = '' }) {
  const [current, setCurrent] = useState(getTextSize);
  return (
    <div
      role="group"
      aria-label="Taille du texte"
      className={`inline-flex shrink-0 overflow-hidden rounded-control border border-current ${className}`}
    >
      {TEXT_SIZES.map((size, i) => (
        <button
          key={size.value}
          type="button"
          title={size.name}
          aria-label={size.name}
          aria-pressed={current === size.value}
          onClick={() => setCurrent(applyTextSize(size.value))}
          className={`min-h-9 min-w-9 px-2 font-bold leading-none aria-pressed:bg-current/15 aria-pressed:underline aria-pressed:underline-offset-4 ${LABEL_CLASS[i]} ${i > 0 ? 'border-l border-current' : ''}`}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
