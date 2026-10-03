import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import Loading from './Loading.jsx';
import StatusBadge from './StatusBadge.jsx';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** « Mon espace » : messages envoyés aux services municipaux et leur statut. */
export default function MyMessages({ meta }) {
  const { status, data, error } = useAsync(() => api('/contact-messages'), []);

  return (
    <section
      className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8"
      aria-labelledby="mes-messages"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="mes-messages" className="font-display text-xl font-bold text-ink">
          Mes messages aux services
        </h2>
        <Link
          to="/contact"
          className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Nouveau message
        </Link>
      </div>
      {status === 'loading' && <Loading label="Chargement de vos messages" className="mt-4" />}
      {status === 'error' && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error.message}
        </p>
      )}
      {status === 'success' && data.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-ink-muted">Vous n’avez encore envoyé aucun message.</p>
          <Link
            to="/contact"
            className="mt-3 inline-block rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
          >
            Écrire aux services
          </Link>
        </div>
      )}
      {status === 'success' && data.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {data.map((m) => (
            <li key={m.trackingCode} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium text-ink">{m.subject}</p>
                <StatusBadge statuses={meta.contactStatuses} value={m.status} />
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
