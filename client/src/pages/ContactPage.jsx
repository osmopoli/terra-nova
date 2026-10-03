import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, OptionSelect, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { loginPath } from '../lib/redirect.js';
import { Link, navigate, useLocation } from '../lib/router.jsx';

const EMPTY = { subject: '', service: '', message: '' };
const MESSAGE_MAX = 2000;

/** Formulaire de contact des services municipaux, puis confirmation avec numéro de suivi. */
export default function ContactPage({ user, meta, onExpired }) {
  const { searchParams } = useLocation();
  // Service présélectionné par un lien (ex. « Vos données » -> ?service=donnees_personnelles).
  const preset = searchParams.get('service');
  const [form, setForm] = useState({ ...EMPTY, service: preset ?? '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  useEffect(() => {
    if (!user) navigate(loginPath(preset ? `/contact?service=${encodeURIComponent(preset)}` : '/contact'), { replace: true });
  }, [user, preset]);
  if (!user) return null;

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setSent(await api('/contact-messages', { method: 'POST', body: form }));
      setForm({ ...EMPTY, service: form.service });
      window.scrollTo(0, 0);
    } catch (err) {
      if (err.status === 401) onExpired();
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <section
        className="mx-auto w-full max-w-lg rounded-card bg-surface p-5 shadow-card sm:p-8"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-primary">Message envoyé</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">Votre demande est bien transmise</h1>
        <p className="mt-3 text-ink-muted">
          Le service <strong className="text-ink">{labelOf(meta.contactServices, sent.service)}</strong> a
          reçu votre message « {sent.subject} ». Conservez ce numéro pour suivre son traitement.
        </p>
        <div className="mt-6 rounded-control bg-mist p-4 text-center">
          <p className="text-sm text-ink-muted">Numéro de suivi</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-ink">{sent.trackingCode}</p>
          <p className="mt-2 text-sm text-ink-muted">
            Statut : {labelOf(meta.contactStatuses, sent.status)}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/profil"
            className="flex-1 rounded-control bg-primary py-3 text-center font-semibold text-white hover:bg-primary-strong"
          >
            Voir mes messages
          </Link>
          <button
            type="button"
            onClick={() => setSent(null)}
            className="flex-1 rounded-control border border-ink-muted/40 py-3 font-semibold text-ink hover:bg-mist"
          >
            Écrire un autre message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-card bg-surface p-5 shadow-card sm:p-8">
      <h1 className="font-display text-2xl font-bold text-ink">Contacter les services municipaux</h1>
      <p className="mt-2 text-ink-muted">
        Une question, une difficulté ? Votre message est transmis au service choisi et vous recevez un
        numéro de suivi.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Sujet" error={error?.fields?.subject}>
          <input
            className={inputClass}
            value={form.subject}
            onChange={update('subject')}
            maxLength={120}
            required
          />
        </Field>
        <Field label="Service concerné" error={error?.fields?.service}>
          <OptionSelect
            options={meta.contactServices}
            placeholder="Choisissez un service"
            value={form.service}
            onChange={update('service')}
            required
          />
        </Field>
        <Field
          label="Message"
          error={error?.fields?.message}
          hint={`${form.message.length} / ${MESSAGE_MAX} caractères`}
        >
          <textarea
            className={`${inputClass} min-h-40`}
            value={form.message}
            onChange={update('message')}
            maxLength={MESSAGE_MAX}
            required
          />
        </Field>
        <FormError error={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
        >
          {loading ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>
    </section>
  );
}
