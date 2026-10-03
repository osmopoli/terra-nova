import { useId, useState } from 'react';
import { api, setToken } from '../api/client.js';
import { APP_NAME } from '../lib/constants.js';
import Field, { FormError, inputClass, useFocusFirstError } from './Field.jsx';

const EMPTY = { fullName: '', email: '', password: '' };
const TABS = [
  { value: 'login', label: 'Connexion' },
  { value: 'register', label: 'Inscription' },
];

export default function AuthScreen({ onAuthenticated }) {
  const ids = useId();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useFocusFirstError(error);
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

  function select(value) {
    setMode(value);
    setError(null);
  }

  // Onglets ARIA : un seul onglet dans l'ordre de tabulation, flèches gauche/droite pour changer.
  function onTabKey(e) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const index = TABS.findIndex((t) => t.value === mode);
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    const target = step
      ? TABS[(index + step + TABS.length) % TABS.length].value
      : TABS[e.key === 'Home' ? 0 : TABS.length - 1].value;
    select(target);
    document.getElementById(`${ids}-onglet-${target}`)?.focus();
  }

  return (
    <div className="w-full max-w-md rounded-card bg-surface p-5 shadow-card sm:p-8">
      <h2 className="text-center font-display text-2xl font-bold text-primary sm:text-3xl">
        {APP_NAME}
      </h2>

      <div
        role="tablist"
        aria-label="Choix du formulaire"
        onKeyDown={onTabKey}
        className="mt-6 flex gap-1 rounded-control bg-mist p-1"
      >
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`${ids}-onglet-${value}`}
            aria-selected={mode === value}
            aria-controls={`${ids}-panneau`}
            tabIndex={mode === value ? 0 : -1}
            onClick={() => select(value)}
            className={`flex-1 rounded-control py-2 text-sm font-semibold ${
              mode === value ? 'bg-surface text-primary shadow-card' : 'text-ink-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        ref={formRef}
        onSubmit={submit}
        id={`${ids}-panneau`}
        role="tabpanel"
        aria-labelledby={`${ids}-onglet-${mode}`}
        className="mt-6 space-y-4"
        noValidate
      >
        {isRegister && (
          <Field label="Nom" required error={error?.fields?.fullName}>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={update('fullName')}
              autoComplete="name"
            />
          </Field>
        )}
        <Field label="E-mail" required error={error?.fields?.email}>
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
          required
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
          className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
        >
          {loading ? 'Patientez...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
