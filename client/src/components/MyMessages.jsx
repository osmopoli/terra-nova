import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';
import ListState from './ListState.jsx';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** « Mon espace » : messages envoyés aux services municipaux et leur statut. */
export default function MyMessages({ meta }) {
  const state = useAsync(() => api('/contact-messages'), []);
  const messages = Array.isArray(state.data) ? state.data : [];

  return (
    <section
      className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8"
      aria-labelledby="mes-messages"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      <ListState
        state={state}
        isEmpty={!messages.length}
        loadingLabel="Chargement de vos messages..."
        empty={{
          title: 'Aucun message envoyé',
          text: 'Une question pour la mairie de Nova Terra ? Écrivez au service concerné et suivez sa réponse ici.',
          action: (
            <Link
              to="/contact"
              className="inline-block rounded-control bg-primary px-4 py-2 text-sm font-semibold text-surface hover:bg-primary-strong"
            >
              Écrire aux services
            </Link>
          ),
        }}
      >
        <ul className="mt-4 divide-y divide-mist">
          {messages.map((m) => (
            <li key={m.trackingCode} className="py-3">
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
      </ListState>
    </section>
  );
}
