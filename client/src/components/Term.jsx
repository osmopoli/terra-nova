import { useEffect, useId, useRef, useState } from 'react';
import { glossaryEntry } from '../lib/glossary.js';

// Mot difficile expliqué au survol, au focus clavier ou au toucher (WCAG 1.4.13 :
// la bulle reste ouverte quand on la survole, se ferme avec Échap).
// Sur mobile, la bulle s'affiche en bas de l'écran pour ne jamais déborder.
export default function Term({ id, children }) {
  const entry = glossaryEntry(id);
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (!entry) return children;

  return (
    <span
      ref={ref}
      className="relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={tipId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        className="cursor-help rounded-sm text-inherit underline decoration-primary decoration-dotted decoration-2 underline-offset-4"
      >
        {children}
      </button>
      <span
        id={tipId}
        role="tooltip"
        hidden={!open}
        className="fixed inset-x-4 bottom-4 z-20 block rounded-control border border-line-strong bg-surface p-3 text-left text-sm font-normal normal-case tracking-normal text-ink shadow-pop sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:w-72"
      >
        <strong className="block font-semibold text-ink">{entry.term}</strong>
        <span className="mt-1 block text-ink-muted">{entry.definition}</span>
      </span>
    </span>
  );
}
