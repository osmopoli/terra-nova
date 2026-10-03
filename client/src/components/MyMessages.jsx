import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { Link, useLocation } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** « Mon espace » : messages envoyés aux services municipaux et leur statut. */
export default function MyMessages({ meta }) {
  const { status, data, error } = useAsync(() => api('/contact-messages'), []);
  const highlighted = useLocation().searchParams.get('demande');

  return (
    <section
      className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8"
      aria-labelledby="mes-messages"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="mes-messages" className="font-semibold text-ink">
          Mes messages aux services
        </h2>
        <Link
          to="/contact"
          className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Nouveau message
        </Link>
      </div>
      {status === 'loading' && <p className="mt-4 text-sm text-ink-muted">Chargement...</p>}
      {status === 'error' && <p className="mt-4 text-sm text-danger">{error.message}</p>}
      {status === 'success' && data.length === 0 && (
        <p className="mt-4 text-sm text-ink-muted">Vous n’avez encore envoyé aucun message.</p>
      )}
      {status === 'success' && data.length > 0 && (
        <ul className="mt-4 divide-y divide-mist">
          {data.map((m) => (
            <li
              key={m.trackingCode}
              id={m.trackingCode}
              className={`py-3 ${m.trackingCode === highlighted ? 'rounded-control bg-mist px-2' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium text-ink">{m.subject}</p>
                <span className="shrink-0 rounded-control bg-mist px-2 py-0.5 text-xs font-semibold text-ink">
                  {labelOf(meta.contactStatuses, m.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {labelOf(meta.contactServices, m.service)} ·{' '}
                <span className="font-mono">{m.trackingCode}</span> · {dateFormat.format(new Date(m.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
