import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import AgentMessages from '../components/AgentMessages.jsx';
import { APP_NAME } from '../lib/constants.js';
import ListState from '../components/ListState.jsx';

const FALLBACK_POLL_SECONDS = 20;

const timeFormat = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium' });

// Minutes avant la prochaine vague, recalculées localement entre deux synchros.
function minutesUntil(session, now) {
  if (!session) return null;
  if (session.next_wave_at) {
    return Math.max(0, Math.ceil((Date.parse(session.next_wave_at) - now) / 60_000));
  }
  return session.minutes_until_next_wave ?? null;
}

function SessionPanel({ data, now }) {
  const session = data.session;
  const minutes = minutesUntil(session, now);
  const items = [
    ['Vague en cours', session?.current_wave ?? '—'],
    [
      session?.next_wave_number != null ? `Vague ${session.next_wave_number} dans` : 'Prochaine vague',
      minutes == null ? 'Non annoncée' : `${minutes} min`,
    ],
    ['Demandes reçues', data.requests.length],
    ['Nouvelles', data.newCount],
  ];
  return (
    <section aria-label="Session en cours" className="rounded-card bg-surface p-4 shadow-card sm:p-5">
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-4">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-ink-muted">{label}</dt>
            <dd className="font-display text-xl font-bold sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-ink-muted">
        {data.syncedAt
          ? `Dernière synchronisation à ${timeFormat.format(new Date(data.syncedAt))}`
          : 'Pas encore synchronisé avec l’API Nova Terra.'}{' '}
        · Mise à jour automatique toutes les {data.pollIntervalSeconds} s.
      </p>
      {data.lastError && (
        <p role="alert" className="mt-2 text-sm font-semibold text-danger">
          Dernière synchronisation en échec : {data.lastError}
        </p>
      )}
    </section>
  );
}

function RequestCard({ request, onSeen }) {
  const wave = request.visible_since_wave ?? request.wave_number ?? 0;
  return (
    <li
      className={`flex flex-col rounded-card bg-surface p-4 shadow-card sm:p-5 ${
        request.isNew ? 'border-l-4 border-accent' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 font-display text-lg font-bold">{request.request_code}</h3>
        {request.isNew && (
          <span className="rounded-control bg-accent px-2 py-0.5 text-xs font-bold uppercase text-ink">
            Nouvelle
          </span>
        )}
        <span className="ml-auto text-sm font-bold text-primary">{request.xp_total} XP</span>
      </div>
      <p className="mt-1 text-sm font-semibold">
        {request.requester_name}
        {request.requester_type && (
          <span className="font-normal text-ink-muted"> · {request.requester_type}</span>
        )}
      </p>
      <p className="mt-3 flex-1 leading-relaxed">{request.message_public}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-control bg-mist px-2 py-1">
          Difficulté : <strong>{request.difficulty ?? request.difficulty_level}</strong>
        </span>
        <span className="rounded-control bg-mist px-2 py-1">
          Vague <strong>{wave}</strong>
        </span>
        {request.isNew && (
          <button
            type="button"
            onClick={() => onSeen([request.request_code])}
            className="ml-auto min-h-10 font-bold text-primary underline-offset-4 hover:underline"
          >
            Marquer comme vue
          </button>
        )}
      </div>
    </li>
  );
}

export default function AgentPage({ onExpired }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [onlyNew, setOnlyNew] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [reload, setReload] = useState(0);
  // Référence stable : le rendu du parent ne doit pas relancer le polling.
  const expired = useRef(onExpired);
  expired.current = onExpired;

  // Rafraîchissement automatique au rythme de la synchro serveur, sans recharger la page.
  useEffect(() => {
    let cancelled = false;
    let timer;
    async function load() {
      let delay = FALLBACK_POLL_SECONDS;
      try {
        const next = await api('/agent/webcup/requests');
        if (cancelled) return;
        setData(next);
        setError(null);
        setNow(Date.now());
        delay = next.pollIntervalSeconds || FALLBACK_POLL_SECONDS;
      } catch (e) {
        if (cancelled) return;
        if (e.status === 401) return expired.current();
        // 403 : profil non autorisé, inutile de relancer le polling.
        if (e.status === 403) return setError('Cet espace est réservé aux agents municipaux.');
        setError(e.message);
      }
      timer = setTimeout(load, delay * 1000);
    }
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reload]);

  // Le compte à rebours de la prochaine vague avance entre deux synchros.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, []);

  const newCount = data?.newCount ?? 0;
  useEffect(() => {
    document.title = `${newCount ? `(${newCount}) ` : ''}Espace agents · ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [newCount]);

  async function markSeen(codes) {
    try {
      await api('/agent/webcup/requests/seen', { method: 'POST', body: codes ? { codes } : {} });
      setReload((n) => n + 1);
    } catch (e) {
      if (e.status === 401) return onExpired();
      setError(e.message);
    }
  }

  const requests = data ? data.requests.filter((r) => !onlyNew || r.isNew) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Demandes de la ville</h1>
        <p className="mt-1 text-ink-muted">
          Les besoins transmis par l’API Nova Terra, mis à jour en continu.
        </p>
      </div>

      <AgentMessages onExpired={onExpired} />

      {/* Échec d'un rafraîchissement : la dernière liste reçue reste affichée sous l'alerte. */}
      {error && data && (
        <p role="alert" className="rounded-card bg-surface p-4 font-semibold text-danger shadow-card">
          {error}
        </p>
      )}

      {!data && (
        <ListState
          state={{
            status: error ? 'error' : 'loading',
            error: { message: error },
            reload: () => setReload((n) => n + 1),
          }}
          loadingLabel="Chargement des demandes..."
        />
      )}

      {data && (
        <>
          <SessionPanel data={data} now={now} />

          <div className="flex flex-wrap items-center gap-3">
            <p aria-live="polite" className="font-semibold">
              {newCount
                ? `${newCount} nouvelle${newCount > 1 ? 's' : ''} demande${newCount > 1 ? 's' : ''}`
                : 'Aucune nouvelle demande'}
            </p>
            <label className="flex min-h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(e) => setOnlyNew(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Nouvelles uniquement
            </label>
            {newCount > 0 && (
              <button
                type="button"
                onClick={() => markSeen()}
                className="ml-auto min-h-10 rounded-control bg-primary px-3 py-1.5 text-sm font-bold text-surface hover:bg-primary-strong"
              >
                Tout marquer comme vu
              </button>
            )}
          </div>

          <ListState
            state={{ status: 'success' }}
            isEmpty={!requests.length}
            empty={
              onlyNew
                ? { title: 'Toutes les demandes ont été vues', text: 'Les prochaines arriveront ici automatiquement.' }
                : {
                    title: 'Aucune demande reçue pour le moment',
                    text: 'La liste se met à jour seule à chaque synchronisation avec la ville.',
                  }
            }
          >
            <ul className="grid gap-4 md:grid-cols-2">
              {requests.map((request) => (
                <RequestCard key={request.request_code} request={request} onSeen={markSeen} />
              ))}
            </ul>
          </ListState>
        </>
      )}
    </div>
  );
}
