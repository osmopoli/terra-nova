import { useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, inputClass, useFocusFirstError } from './Field.jsx';

export default function ProfileScreen({ user, onUpdated, onLogout }) {
  const [form, setForm] = useState({ fullName: user.fullName ?? '' });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const formRef = useFocusFirstError(error);

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

      <form ref={formRef} onSubmit={save} aria-labelledby="titre-profil" className="mt-6 space-y-4 border-t border-mist pt-6" noValidate>
        <h2 id="titre-profil" className="font-semibold text-ink">
          Mon profil
        </h2>
        <Field label="Nom" required error={error?.fields?.fullName}>
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            autoComplete="name"
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
    </div>
  );
}
