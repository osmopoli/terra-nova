import { useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, inputClass } from './Field.jsx';

export default function ProfileScreen({ user, onUpdated, onLogout, onDeleted }) {
  const [form, setForm] = useState({ fullName: user.fullName ?? '' });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount(e) {
    e.preventDefault();
    setDeleteError(null);
    setDeleting(true);
    try {
      await api('/me', { method: 'DELETE', body: { password } });
      onDeleted();
    } catch (err) {
      setDeleteError(err);
      setDeleting(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      onUpdated(await api('/me', { method: 'PATCH', body: form }));
      setSaved(true);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">Bonjour</p>
          <h1 className="text-xl font-bold break-words text-ink">{user.fullName}</h1>
          <p className="text-sm break-all text-ink-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 rounded-control border border-ink-muted/40 px-3 py-2 text-sm font-medium text-ink hover:bg-mist"
        >
          Se déconnecter
        </button>
      </div>

      <form onSubmit={save} aria-labelledby="titre-profil" className="mt-6 space-y-4 border-t border-mist pt-6" noValidate>
        <h2 id="titre-profil" className="font-semibold text-ink">
          Mon profil
        </h2>
        <Field label="Nom" error={error?.fields?.fullName}>
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </Field>
        <FormError error={error} />
        <p role="status" className="text-sm text-primary">
          {saved ? 'Profil enregistré.' : ''}
        </p>
        <button
          type="submit"
          className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong"
        >
          Enregistrer
        </button>
      </form>

      {user.role === 'citoyen' && (
      <section aria-labelledby="titre-suppression" className="mt-6 border-t border-mist pt-6">
        <h2 id="titre-suppression" className="font-semibold text-ink">
          Supprimer mon compte
        </h2>
        {confirming ? (
          <form onSubmit={deleteAccount} className="mt-3 space-y-4" noValidate>
            <p className="text-sm text-ink-muted">
              Cette action est définitive : votre compte et vos messages seront effacés. Saisissez votre mot de
              passe pour confirmer.
            </p>
            <Field label="Mot de passe" error={deleteError?.fields?.password}>
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {!deleteError?.fields?.password && <FormError error={deleteError} />}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={deleting || !password}
                className="flex-1 rounded-control bg-danger py-3 font-semibold text-white disabled:opacity-60"
              >
                {deleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setPassword('');
                  setDeleteError(null);
                }}
                className="rounded-control border border-ink-muted/40 px-4 py-3 font-medium text-ink hover:bg-mist"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 rounded-control border border-danger px-4 py-2.5 text-sm font-semibold text-danger hover:bg-mist"
          >
            Supprimer mon compte
          </button>
        )}
      </section>
      )}
    </div>
  );
}
