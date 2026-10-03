import { useState } from 'react';
import { api, setToken } from '../api/client.js';
import { APP_NAME } from '../lib/constants.js';
import Field, { FormError, inputClass } from './Field.jsx';

const EMPTY = { fullName: '', email: '', password: '' };

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const data = await api(`/auth/${mode}`, { method: 'POST', body });
      setToken(data.token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const tab = (value, label) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => {
        setMode(value);
        setError(null);
      }}
      className={`flex-1 rounded-control py-3 text-sm font-semibold ${
        mode === value ? 'bg-surface text-primary shadow-card' : 'text-ink-muted'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8">
      <h2 className="text-center font-display text-2xl font-bold text-primary sm:text-3xl">
        {APP_NAME}
      </h2>

      <div role="group" aria-label="Choix du formulaire" className="mt-6 flex gap-1 rounded-control bg-mist p-1">
        {tab('login', 'Connexion')}
        {tab('register', 'Inscription')}
      </div>

      <form
        onSubmit={submit}
        aria-label={isRegister ? 'Inscription' : 'Connexion'} className="mt-6 space-y-4" noValidate>
        {isRegister && (
          <Field label="Nom" error={error?.fields?.fullName}>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={update('fullName')}
              autoComplete="name"
            />
          </Field>
        )}
        <Field label="E-mail" error={error?.fields?.email}>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
          />
        </Field>
        <Field
          label="Mot de passe"
          error={error?.fields?.password}
          hint={isRegister ? '8 caractères minimum.' : null}
        >
          <input
            className={inputClass}
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </Field>

        <FormError error={error} />

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-control bg-primary py-3 font-semibold text-surface hover:bg-primary-strong disabled:opacity-60"
        >
          {loading ? 'Patientez...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
