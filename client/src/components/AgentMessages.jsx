import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

// Teinte du badge de statut ; le libellé reste toujours affiché (pas d'info portée par la couleur seule).
const STATUS_STYLE = {
  nouveau: 'bg-accent text-on-primary',
  en_cours: 'bg-mist text-warning',
  traite: 'bg-mist text-success',
};

const FILTERS = [
  ['a_traiter', 'À traiter'],
  ['', 'Tous'],
];

/** F22 : messages des habitants (formulaire de contact), avec statut modifiable par l'agent. */
export default function AgentMessages({ onExpired }) {
  const [meta, setMeta] = useState({});
  const [filter, setFilter] = useState('a_traiter');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [reload, setReload] = useState(0);
  // Référence stable : un nouveau rendu du parent ne doit pas relancer le chargement.
  const expired = useRef(onExpired);
  expired.current = onExpired;

  useEffect(() => {
    api('/meta')
      .then(setMeta)
      .catch(() => setMeta({}));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api(`/agent/contact-messages${filter ? `?filter=${filter}` : ''}`)
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e.status === 401) return expired.current();
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, reload]);

  async function changeStatus(code, status) {
    setSaving(code);
    try {
      await api(`/agent/contact-messages/${code}`, { method: 'PATCH', body: { status } });
      setReload((n) => n + 1);
    } catch (e) {
      if (e.status === 401) return onExpired();
      setError(e.message);
    } finally {
      setSaving(null);
    }
  }

  const counts = data?.counts ?? {};
  const toHandle = (counts.nouveau ?? 0) + (counts.en_cours ?? 0);
  const statuses = meta.contactStatuses ?? [];

  return (
    <section aria-labelledby="messages-habitants" className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 id="messages-habitants" className="font-display text-xl font-bold sm:text-2xl">
            Messages des habitants
          </h2>
          <p aria-live="polite" className="mt-1 text-ink-muted">
            {data
              ? `${toHandle} à traiter · ${counts.traite ?? 0} traité${(counts.traite ?? 0) > 1 ? 's' : ''}`
              : 'Chargement des messages...'}
          </p>
        </div>
        <div role="group" aria-label="Filtrer les messages" className="flex gap-2">
          {FILTERS.map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-control px-3 py-1.5 text-sm font-bold ${
                filter === value ? 'bg-primary text-on-primary' : 'bg-surface text-ink shadow-card'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-card bg-surface p-4 font-semibold text-danger shadow-card">
          {error}
        </p>
      )}

      {data && data.messages.length === 0 && (
        <p className="rounded-card bg-surface p-4 text-ink-muted shadow-card">
          {filter ? 'Aucun message en attente : tout est traité.' : 'Aucun message reçu pour le moment.'}
        </p>
      )}

      {data && data.messages.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.messages.map((m) => (
            <li key={m.trackingCode} className="flex flex-col rounded-card bg-surface p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start gap-2">
                <h3 className="min-w-0 flex-1 font-display text-lg font-bold">{m.subject}</h3>
                <span
                  className={`shrink-0 rounded-control px-2 py-0.5 text-xs font-bold uppercase ${
                    STATUS_STYLE[m.status] ?? 'bg-mist text-ink'
                  }`}
                >
                  {labelOf(meta.contactStatuses, m.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {m.citizenName ?? 'Habitant'} · {labelOf(meta.contactServices, m.service)} ·{' '}
                <span className="font-mono">{m.trackingCode}</span> · {dateFormat.format(new Date(m.createdAt))}
              </p>
              <p className="mt-3 flex-1 whitespace-pre-line leading-relaxed">{m.message}</p>
              <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
                Statut
                <select
                  value={m.status}
                  disabled={saving === m.trackingCode}
                  onChange={(e) => changeStatus(m.trackingCode, e.target.value)}
                  className="rounded-control border border-line bg-surface px-2 py-1.5 font-normal"
                >
                  {statuses.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
