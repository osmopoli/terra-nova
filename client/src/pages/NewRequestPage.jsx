import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, OptionSelect, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

const EMPTY = { subject: '', service: '', message: '' };

/**
 * D16 : confirmation claire juste après l'envoi : numéro de suivi, ce qui a été transmis,
 * prochaine étape, et lien direct vers le suivi. Le focus y est placé pour les lecteurs d'écran.
 */
export function SentConfirmation({ demande, meta, onAnother }) {
  const heading = useRef(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <section
      aria-labelledby="demande-envoyee"
      className="mx-auto max-w-xl rounded-card border-t-4 border-primary bg-surface p-6 shadow-card"
    >
      <p role="status" className="text-sm font-semibold text-primary">
        Demande bien reçue par la mairie
      </p>
      <h1 id="demande-envoyee" ref={heading} tabIndex={-1} className="mt-1 font-display text-2xl font-bold">
        C’est envoyé : inutile de recommencer.
      </h1>
      <p className="mt-4">Votre numéro de suivi :</p>
      <p className="mt-1 font-mono text-2xl font-bold">{demande.reference}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-semibold">Objet</dt>
          <dd className="text-ink-muted">{demande.subject}</dd>
        </div>
        <div>
          <dt className="font-semibold">Service</dt>
          <dd className="text-ink-muted">{labelOf(meta.services, demande.service)}</dd>
        </div>
        <div>
          <dt className="font-semibold">Reçue le</dt>
          <dd className="text-ink-muted">
            {new Date(demande.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
          </dd>
        </div>
      </dl>
      <p className="mt-4 rounded-control bg-mist p-3 text-sm">
        Prochaine étape : un agent prend en charge votre demande. Son état change dans votre suivi, avec
        sa réponse.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/mes-demarches/${demande.id}`}
          className="rounded-control bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-strong"
        >
          Suivre cette demande
        </Link>
        {onAnother && (
          <button
            type="button"
            onClick={onAnother}
            className="rounded-control px-3 py-2.5 font-semibold text-primary hover:underline"
          >
            Faire une autre demande
          </button>
        )}
      </div>
    </section>
  );
}

/** Nouvelle démarche auprès d'un service (API #10), avec confirmation immédiate (D16). */
export default function NewRequestPage({ meta }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      setSent(await api('/demandes', { method: 'POST', body: form }));
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <SentConfirmation
        demande={sent}
        meta={meta}
        onAnother={() => {
          setSent(null);
          setForm(EMPTY);
        }}
      />
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-card bg-surface p-5 shadow-card sm:p-8">
      <Link to="/mes-demarches" className="text-sm font-semibold text-primary">
        Mes démarches
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">Nouvelle démarche</h1>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Service concerné" error={error?.fields?.service}>
          <OptionSelect
            options={meta.services}
            placeholder="Choisissez le service"
            value={form.service}
            onChange={update('service')}
          />
        </Field>
        <Field label="Objet" error={error?.fields?.subject}>
          <input className={inputClass} value={form.subject} onChange={update('subject')} />
        </Field>
        <Field label="Votre demande" error={error?.fields?.message}>
          <textarea className={inputClass} rows={5} value={form.message} onChange={update('message')} />
        </Field>
        <FormError error={error} />
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
        >
          {sending ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </button>
      </form>
    </section>
  );
}
