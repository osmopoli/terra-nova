// Squelette de chargement sobre : lignes en `mist`, pulsation coupée si mouvement réduit.
export default function Loading({ label = 'Chargement', lines = 3, className = '' }) {
  return (
    <div role="status" className={`space-y-3 ${className}`}>
      <span className="sr-only">{label}...</span>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`h-4 animate-pulse rounded-control bg-mist motion-reduce:animate-none ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}
