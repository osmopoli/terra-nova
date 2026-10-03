import { api } from '../api/client.js';
import ListState from '../components/ListState.jsx';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

function Card({ label, value, hint, to }) {
  return (
    <li className="flex flex-col rounded-card bg-surface p-4 shadow-card sm:p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="font-display text-4xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      {to && (
        <Link to={to} className="mt-3 text-sm font-bold text-primary underline-offset-4 hover:underline">
          Voir la liste
        </Link>
      )}
    </li>
  );
}

/** F50 : compteurs d'activité de la plateforme, en lecture seule. */
export default function AgentDashboardPage({ meta, onExpired }) {
  const dashboard = useAsync(
    () =>
      api('/agent/dashboard').catch((e) => {
        if (e.status === 401) onExpired?.();
        throw e;
      }),
    []
  );
  const data = dashboard.data;
  const statuses = meta?.demandeStatuses ?? [];

  return (
    <div data-space="agent" className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Tableau de bord</h1>
        <p className="text-ink-muted">L’activité de la plateforme en un coup d’œil.</p>
      </div>

      <ListState
        state={{
          status: dashboard.status,
          error: dashboard.error,
          reload: dashboard.reload,
        }}
        isEmpty={data && data.demandes.total === 0 && data.messages.total === 0}
        loadingLabel="Chargement du tableau de bord..."
        rows={4}
        empty={{
          title: 'Aucune activité pour le moment',
          text: 'Les compteurs apparaîtront dès les premières demandes des habitants.',
        }}
      >
        {data && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statuses.map((s) => (
              <Card
                key={s.value}
                label={`Demandes · ${labelOf(meta.demandeStatuses, s.value)}`}
                value={data.demandes.byStatus[s.value] ?? 0}
                to="/agent/demandes"
              />
            ))}
            <Card label="Nouvelles demandes sur 7 jours" value={data.newDemandesLast7Days} />
            <Card
              label="Messages à traiter"
              value={(data.messages.byStatus.nouveau ?? 0) + (data.messages.byStatus.en_cours ?? 0)}
              hint={`${data.messages.total} message${data.messages.total > 1 ? 's' : ''} au total`}
              to="/agent"
            />
            <Card label="Comptes citoyens" value={data.citizenAccounts} />
          </ul>
        )}
      </ListState>
    </div>
  );
}
