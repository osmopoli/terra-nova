/**
 * États d'une liste chargée depuis l'API : chargement, erreur, vide, puis contenu.
 * À brancher sur `useAsync` : <ListState state={state} isEmpty={...} empty={{ title }}>...</ListState>.
 * Garantit qu'aucune liste n'affiche une page blanche ni une erreur brute.
 */
export default function ListState({ state, isEmpty, loadingLabel = 'Chargement...', rows = 3, empty, children }) {
  const { status, error, reload } = state;

  if (status === 'loading') {
    return (
      <div role="status" className="mt-4 space-y-3">
        <span className="sr-only">{loadingLabel}</span>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} aria-hidden="true" className="animate-pulse space-y-2 rounded-control bg-mist/60 p-3">
            <div className="h-3 w-2/3 rounded-control bg-line" />
            <div className="h-3 w-1/3 rounded-control bg-line" />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="mt-4 rounded-control border border-danger/30 bg-danger/5 p-4">
        <p className="font-semibold text-danger">Affichage impossible pour le moment</p>
        <p className="mt-1 text-sm text-ink">{error?.message}</p>
        {reload && (
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-control border border-ink-muted/40 bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mt-4 flex flex-col items-center rounded-control border border-dashed border-line px-4 py-8 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-10 w-10 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 9.5c5 2 12 2 17 0" strokeLinecap="round" />
          <circle cx="17" cy="6" r="1" fill="currentColor" />
        </svg>
        <p className="mt-3 font-semibold text-ink">{empty?.title ?? 'Rien à afficher pour le moment'}</p>
        {empty?.text && <p className="mt-1 max-w-xs text-sm text-ink-muted">{empty.text}</p>}
        {empty?.action && <div className="mt-4">{empty.action}</div>}
      </div>
    );
  }

  return children;
}
