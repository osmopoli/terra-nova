import { useState } from 'react';
import { api } from '../api/client.js';
import { useAsync } from '../lib/useAsync.js';
import ListState from '../components/ListState.jsx';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function CitizenRow({ citizen, busy, onToggle }) {
  const disabled = Boolean(citizen.disabledAt);
  const name = citizen.fullName || citizen.email;
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-card bg-surface p-4 shadow-card sm:p-5">
      <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
        <p className="break-words font-display text-lg font-bold">{name}</p>
        <p className="break-all text-sm text-ink-muted">{citizen.email}</p>
        <p className="text-sm text-ink-muted">
          Inscrit le {dateFormat.format(new Date(citizen.createdAt))}
        </p>
      </div>
      <span
        className={`rounded-control px-2 py-1 text-xs font-bold uppercase ${
          disabled ? 'bg-danger text-surface' : 'bg-mist text-ink'
        }`}
      >
        {disabled ? 'Désactivé' : 'Actif'}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => onToggle(citizen)}
        aria-label={`${disabled ? 'Réactiver' : 'Désactiver'} le compte de ${name}`}
        className={`rounded-control px-3 py-1.5 text-sm font-bold disabled:opacity-60 ${
          disabled
            ? 'bg-primary text-surface hover:bg-primary-strong'
            : 'border border-danger text-danger hover:bg-danger hover:text-surface'
        }`}
      >
        {disabled ? 'Réactiver' : 'Désactiver'}
      </button>
    </li>
  );
}

export default function CitizensPage({ onExpired }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  const state = useAsync(async () => {
    const params = new URLSearchParams({ page });
    if (query) params.set('q', query);
    try {
      return await api(`/agent/citizens?${params}`);
    } catch (e) {
      if (e.status === 401) onExpired();
      if (e.status === 403) e.message = 'Cet espace est réservé aux agents municipaux.';
      throw e;
    }
  }, [query, page]);

  function search(event) {
    event.preventDefault();
    setPage(1);
    setQuery(input.trim());
  }

  async function toggle(citizen) {
    const disabled = Boolean(citizen.disabledAt);
    setBusyId(citizen.id);
    setNotice(null);
    try {
      await api(`/agent/citizens/${citizen.id}/${disabled ? 'enable' : 'disable'}`, { method: 'POST' });
      setNotice({ ok: true, text: disabled ? 'Compte réactivé.' : 'Compte désactivé.' });
      state.reload();
    } catch (e) {
      if (e.status === 401) return onExpired();
      setNotice({ ok: false, text: e.message });
    } finally {
      setBusyId(null);
    }
  }

  const citizens = state.data?.data ?? [];
  const meta = state.data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Comptes citoyens</h1>
        <p className="mt-1 text-ink-muted">
          Un compte désactivé ne peut plus se connecter ; vous pouvez le réactiver à tout moment.
        </p>
      </div>

      <form onSubmit={search} role="search" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold">
          Rechercher par nom ou e-mail
          <input
            type="search"
            value={input}
            maxLength={100}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-control border border-line bg-surface px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="rounded-control bg-primary px-4 py-2 font-bold text-surface hover:bg-primary-strong"
        >
          Rechercher
        </button>
      </form>

      <p
        role={notice?.ok === false ? 'alert' : 'status'}
        className={notice ? `font-semibold ${notice.ok ? 'text-primary' : 'text-danger'}` : 'sr-only'}
      >
        {notice?.text}
      </p>

      <ListState
        state={state}
        isEmpty={!citizens.length}
        loadingLabel="Chargement des comptes..."
        empty={{
          title: query ? 'Aucun compte ne correspond' : 'Aucun compte citoyen',
          text: query ? 'Essayez un autre nom ou une autre adresse e-mail.' : 'Les habitants inscrits apparaîtront ici.',
        }}
      >
        <ul className="space-y-3">
          {citizens.map((citizen) => (
            <CitizenRow key={citizen.id} citizen={citizen} busy={busyId === citizen.id} onToggle={toggle} />
          ))}
        </ul>
        {meta && meta.lastPage > 1 && (
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="font-bold text-primary disabled:opacity-40"
            >
              Précédent
            </button>
            <span>
              Page {meta.currentPage} sur {meta.lastPage}
            </span>
            <button
              type="button"
              disabled={page >= meta.lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="font-bold text-primary disabled:opacity-40"
            >
              Suivant
            </button>
          </nav>
        )}
      </ListState>
    </div>
  );
}
