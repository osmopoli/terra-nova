import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { useAsync } from '../lib/useAsync.js';

/** Gestion des comptes (admin) : liste paginée et changement de rôle avec confirmation. */
export default function AdminUsersPage({ user, meta, onExpired }) {
  const roles = meta.roles ?? [];
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  // Changement en attente de confirmation : { id, role }.
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const { status, data, error } = useAsync(() => {
    const query = new URLSearchParams({ page: String(page) });
    if (filter) query.set('role', filter);
    return api(`/admin/users?${query}`);
  }, [filter, page, reload]);

  useEffect(() => {
    if (status === 'error' && error.status === 401) onExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, error]);

  async function confirmChange(target) {
    setSaving(true);
    setNotice(null);
    try {
      const updated = await api(`/admin/users/${target.id}/role`, {
        method: 'PATCH',
        body: { role: pending.role },
      });
      setNotice({
        tone: 'ok',
        text: `${updated.fullName || updated.email} est désormais ${labelOf(roles, updated.role).toLowerCase()}.`,
      });
      setPending(null);
      setReload((n) => n + 1);
    } catch (err) {
      if (err.status === 401) return onExpired();
      setNotice({ tone: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const users = data?.data ?? [];
  const pageMeta = data?.meta;

  return (
    <section className="mx-auto w-full max-w-3xl" aria-labelledby="titre-comptes">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="titre-comptes" className="font-display text-2xl font-bold text-ink">
            Comptes et rôles
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Attribuez à chaque compte le rôle de citoyen, d’agent municipal ou d’administrateur.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
          Filtrer par rôle
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
              setPending(null);
            }}
            className="rounded-control border border-ink-muted bg-surface px-3 py-2 font-normal"
          >
            <option value="">Tous les rôles</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" aria-live="polite" className="mt-4 empty:hidden">
        {notice && (
          <span
            className={`block rounded-control px-3 py-2 text-sm font-semibold ${
              notice.tone === 'ok' ? 'bg-mist text-ink' : 'bg-mist text-danger'
            }`}
          >
            {notice.text}
          </span>
        )}
      </p>

      <div className="mt-4 rounded-card bg-surface p-4 shadow-card sm:p-6">
        {status === 'loading' && !data && <p className="text-sm text-ink-muted">Chargement...</p>}
        {status === 'error' && <p className="text-sm text-danger">{error.message}</p>}
        {data && users.length === 0 && <p className="text-sm text-ink-muted">Aucun compte pour ce rôle.</p>}
        {users.length > 0 && (
          <ul className="divide-y divide-mist">
            {users.map((u) => {
              const self = u.id === user.id;
              const draft = pending?.id === u.id ? pending.role : u.role;
              const name = u.fullName || u.email;
              return (
                <li key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {name}
                      {self && <span className="ml-2 text-sm font-normal text-ink-muted">(vous)</span>}
                    </p>
                    {u.fullName && <p className="truncate text-sm text-ink-muted">{u.email}</p>}
                  </div>

                  {self ? (
                    <span className="self-start rounded-control bg-mist px-2 py-1 text-sm font-semibold text-ink sm:self-auto">
                      {labelOf(roles, u.role)}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 sm:items-end">
                      <label className="sr-only" htmlFor={`role-${u.id}`}>
                        Rôle de {name}
                      </label>
                      <select
                        id={`role-${u.id}`}
                        value={draft}
                        disabled={saving}
                        onChange={(e) => {
                          setNotice(null);
                          setPending(e.target.value === u.role ? null : { id: u.id, role: e.target.value });
                        }}
                        className="rounded-control border border-ink-muted bg-surface px-3 py-2 text-sm"
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {pending?.id === u.id && (
                        <div className="rounded-control bg-mist p-3 text-sm text-ink sm:max-w-xs">
                          <p>
                            Passer {name} de <strong>{labelOf(roles, u.role)}</strong> à{' '}
                            <strong>{labelOf(roles, pending.role)}</strong> ?
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => confirmChange(u)}
                              className="rounded-control bg-primary px-3 py-1.5 font-bold text-white hover:bg-primary-strong disabled:opacity-60"
                            >
                              {saving ? 'Enregistrement...' : 'Confirmer'}
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => setPending(null)}
                              className="rounded-control px-3 py-1.5 font-semibold text-ink underline-offset-4 hover:underline"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {pageMeta && pageMeta.lastPage > 1 && (
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-2 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-control px-3 py-1.5 font-semibold text-primary disabled:text-ink-muted"
            >
              Précédent
            </button>
            <span className="text-ink-muted">
              Page {pageMeta.currentPage} / {pageMeta.lastPage}
            </span>
            <button
              type="button"
              disabled={page >= pageMeta.lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-control px-3 py-1.5 font-semibold text-primary disabled:text-ink-muted"
            >
              Suivant
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
