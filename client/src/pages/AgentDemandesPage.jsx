import { useState } from 'react';
import { api } from '../api/client.js';
import { FormError, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { useAsync } from '../lib/useAsync.js';

const STATUS_CLASS = {
  nouveau: 'bg-accent text-ink',
  en_cours: 'bg-primary text-white',
  traite: 'bg-ink text-surface',
};
// Action proposée selon l'état : l'agent fait avancer la demande d'un cran.
const NEXT = { nouveau: 'en_cours', en_cours: 'traite' };
const NEXT_LABEL = { en_cours: 'Prendre en charge', traite: 'Marquer comme traitée' };

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

function Badge({ meta, status }) {
  return (
    <span className={`rounded-control px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[status] ?? 'bg-mist'}`}>
      {labelOf(meta.demandeStatuses, status)}
    </span>
  );
}

/** Détail d'une demande : message, lieu, étapes, et changement d'état avec réponse à l'habitant. */
function DemandeDetail({ id, meta, onChanged }) {
  const [version, setVersion] = useState(0);
  const detail = useAsync(() => api(`/agent/demandes/${id}`), [id, version]);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function move(status) {
    setBusy(true);
    setError(null);
    try {
      await api(`/agent/demandes/${id}`, { method: 'PATCH', body: { status, note: note.trim() || null } });
      setNote('');
      setVersion((v) => v + 1);
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (detail.status === 'loading') return <p className="p-4 text-ink-muted">Chargement...</p>;
  if (detail.status === 'error') return <p className="p-4 text-danger">{detail.error.message}</p>;
  const d = detail.data;
  const next = NEXT[d.status];

  return (
    <div className="space-y-4 border-t border-mist p-4">
      <p className="whitespace-pre-line">{d.message}</p>
      {d.location && (
        <p className="text-sm">
          <span className="font-semibold">Lieu : </span>
          {d.location}
          {d.latitude != null && (
            <>
              {' '}
              <a
                className="text-primary underline"
                href={`https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=18/${d.latitude}/${d.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                voir sur la carte
              </a>
            </>
          )}
        </p>
      )}
      <ol className="space-y-1 text-sm">
        {d.steps.map((s) => (
          <li key={s.id}>
            <span className="font-semibold">{labelOf(meta.demandeStatuses, s.status)}</span>
            <span className="text-ink-muted"> · {formatDate(s.createdAt)}</span>
            {s.note && <span className="block text-ink-muted">« {s.note} »</span>}
          </li>
        ))}
      </ol>
      {d.status !== 'traite' && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Réponse à l’habitant (facultatif)</span>
            <textarea className={inputClass} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <FormError error={error} />
          <div className="flex flex-wrap gap-2">
            {next && (
              <button
                type="button"
                disabled={busy}
                onClick={() => move(next)}
                className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
              >
                {NEXT_LABEL[next]}
              </button>
            )}
            {d.status === 'nouveau' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => move('traite')}
                className="rounded-control border border-ink-muted/40 px-4 py-2 text-sm font-semibold hover:bg-mist disabled:opacity-60"
              >
                Traiter directement
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** F22 : demandes des habitants pour les agents, celles qui attendent une action d'abord. */
export default function AgentDemandesPage({ meta }) {
  const [filter, setFilter] = useState('a_traiter');
  const [open, setOpen] = useState(null);
  const [version, setVersion] = useState(0);
  const list = useAsync(() => api(`/agent/demandes?status=${filter}`), [filter, version]);
  const counts = list.data?.counts ?? {};
  const tabs = [
    { value: 'a_traiter', label: 'À traiter', count: (counts.nouveau ?? 0) + (counts.en_cours ?? 0) },
    ...(meta.demandeStatuses ?? []).map((s) => ({ ...s, count: counts[s.value] ?? 0 })),
  ];

  return (
    <div data-space="agent" className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Demandes des habitants</h1>
        <p className="text-ink-muted">Les nouvelles demandes, qui attendent une prise en charge, sont en tête.</p>
      </div>

      <div role="tablist" aria-label="Filtrer par état" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={filter === tab.value}
            onClick={() => {
              setFilter(tab.value);
              setOpen(null);
            }}
            className="rounded-control border border-ink-muted/40 px-3 py-1.5 text-sm font-semibold aria-selected:border-primary aria-selected:bg-primary aria-selected:text-white"
          >
            {tab.label} <span className="ml-1 opacity-80">{tab.count}</span>
          </button>
        ))}
      </div>

      {list.status === 'loading' && !list.data && <p className="text-ink-muted">Chargement...</p>}
      {list.status === 'error' && <p className="text-danger">{list.error.message}</p>}
      {list.data?.data.length === 0 && (
        <p className="rounded-card bg-surface p-5 shadow-card">Aucune demande dans cette vue.</p>
      )}

      <ul className="space-y-2">
        {list.data?.data.map((d) => (
          <li
            key={d.id}
            className={`overflow-hidden rounded-card bg-surface shadow-card ${d.status === 'nouveau' ? 'border-l-4 border-accent' : ''}`}
          >
            <button
              type="button"
              aria-expanded={open === d.id}
              onClick={() => setOpen(open === d.id ? null : d.id)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-left hover:bg-mist"
            >
              <span className="font-mono text-sm text-ink-muted">{d.reference}</span>
              <span className="min-w-0 flex-1 font-semibold">{d.subject}</span>
              <span className="text-sm text-ink-muted">
                {d.citizenName} · {labelOf(meta.services, d.service)} · {formatDate(d.createdAt)}
              </span>
              <Badge meta={meta} status={d.status} />
              {d.status === 'nouveau' && <span className="sr-only">Action requise</span>}
            </button>
            {open === d.id && (
              <DemandeDetail id={d.id} meta={meta} onChanged={() => setVersion((v) => v + 1)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
