import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

// Ordre du parcours d'une demande : sert à la frise des étapes.
const FLOW = ['nouveau', 'en_cours', 'traite'];
const STATUS_CLASS = {
  nouveau: 'bg-accent text-ink',
  en_cours: 'bg-primary text-white',
  traite: 'bg-ink text-surface',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

export function StatusBadge({ meta, status }) {
  return (
    <span className={`rounded-control px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[status] ?? 'bg-mist'}`}>
      {labelOf(meta.demandeStatuses, status)}
    </span>
  );
}

/** D11 / F26 : toutes mes demandes, leur état actuel, les plus récentes d'abord. */
export default function MyRequestsPage({ meta }) {
  const list = useAsync(() => api('/demandes'), []);
  const demandes = list.data?.data ?? [];
  const pending = demandes.filter((d) => d.status !== 'traite').length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Mes démarches</h1>
          <p className="mt-1 text-ink-muted">
            Retrouvez ici chaque demande envoyée à la ville, son état et ses étapes.
          </p>
        </div>
        <Link
          to="/mes-demarches/nouvelle"
          className="rounded-control bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-strong"
        >
          Nouvelle démarche
        </Link>
      </div>

      {list.status === 'loading' && <p className="mt-6 text-ink-muted">Chargement...</p>}
      {list.status === 'error' && <p className="mt-6 text-danger">{list.error.message}</p>}
      {list.status === 'success' && demandes.length === 0 && (
        <p className="mt-6 rounded-card bg-surface p-5 shadow-card">
          Vous n’avez encore envoyé aucune demande.
        </p>
      )}
      {demandes.length > 0 && (
        <p className="mt-6 text-sm font-semibold" role="status">
          {demandes.length} demande(s), dont {pending} en attente de traitement.
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {demandes.map((d) => (
          <li key={d.id}>
            <Link
              to={`/mes-demarches/${d.id}`}
              className="block rounded-card bg-surface p-4 shadow-card hover:ring-2 hover:ring-primary/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm text-ink-muted">{d.reference}</span>
                <StatusBadge meta={meta} status={d.status} />
              </div>
              <p className="mt-1 font-bold text-ink">{d.subject}</p>
              <p className="text-sm text-ink-muted">
                {labelOf(meta.services, d.service)} · envoyée le {formatDate(d.createdAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** D11 : détail d'une demande avec les étapes déjà réalisées. */
export function MyRequestPage({ id, meta }) {
  const demande = useAsync(() => api(`/demandes/${id}`), [id]);
  if (demande.status === 'loading') return <p className="text-ink-muted">Chargement...</p>;
  if (demande.status === 'error') return <p className="text-danger">{demande.error.message}</p>;

  const d = demande.data;
  const reached = FLOW.indexOf(d.status);
  const dateOf = (status) => d.steps?.find((s) => s.status === status)?.createdAt;

  return (
    <article className="mx-auto max-w-2xl rounded-card bg-surface p-6 shadow-card">
      <Link to="/mes-demarches" className="text-sm font-semibold text-primary">
        Toutes mes démarches
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-ink-muted">{d.reference}</span>
        <StatusBadge meta={meta} status={d.status} />
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold">{d.subject}</h1>
      <p className="text-sm text-ink-muted">{labelOf(meta.services, d.service)}</p>

      <h2 className="mt-6 font-bold">Étapes</h2>
      <ol className="mt-3 space-y-4">
        {FLOW.map((status, i) => {
          const done = i <= reached;
          const date = dateOf(status);
          return (
            <li key={status} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                  done ? 'border-primary bg-primary text-white' : 'border-ink-muted/40 text-ink-muted'
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p className={done ? 'font-semibold' : 'text-ink-muted'}>
                  {labelOf(meta.demandeStatuses, status)}
                  <span className="sr-only">{done ? ' : étape réalisée' : ' : étape à venir'}</span>
                </p>
                {date && <p className="text-sm text-ink-muted">{formatDate(date)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-6 font-bold">Votre message</h2>
      <p className="mt-1 whitespace-pre-line">{d.message}</p>
    </article>
  );
}
