import { useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, OptionSelect, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

const EMPTY = { category: '', message: '', location: '' };

/** F25 : signaler un problème sur l'espace public, avec son emplacement. */
export default function ReportPage({ meta }) {
  const [form, setForm] = useState(EMPTY);
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function locate() {
    if (!navigator.geolocation) {
      setLocating('Votre navigateur ne permet pas de partager votre position.');
      return;
    }
    setLocating('Recherche de votre position...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        });
        setLocating(null);
      },
      () => setLocating('Position indisponible : décrivez le lieu dans le champ ci-dessus.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      setSent(await api('/demandes/signalements', { method: 'POST', body: { ...form, ...position } }));
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section
        role="status"
        aria-labelledby="signalement-envoye"
        className="mx-auto max-w-xl rounded-card bg-surface p-6 shadow-card"
      >
        <p className="text-sm font-semibold text-primary">Signalement enregistré</p>
        <h1 id="signalement-envoye" className="mt-1 font-display text-2xl font-bold">
          Merci, la ville est prévenue.
        </h1>
        <p className="mt-3">
          Numéro de suivi : <strong className="font-mono text-lg">{sent.reference}</strong>
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Problème</dt>
            <dd className="text-ink-muted">{labelOf(meta.issueCategories, sent.category)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Lieu</dt>
            <dd className="text-ink-muted">{sent.location}</dd>
          </div>
          <div>
            <dt className="font-semibold">Transmis à</dt>
            <dd className="text-ink-muted">{labelOf(meta.services, sent.service)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink-muted">
          Le service compétent le prend en charge ; son état apparaît dans vos demandes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setSent(null);
              setForm(EMPTY);
              setPosition(null);
            }}
            className="rounded-control bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-strong"
          >
            Signaler un autre problème
          </button>
          <Link to="/" className="rounded-control px-3 py-2.5 font-semibold text-primary hover:underline">
            Retour à l’accueil
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-card bg-surface p-5 shadow-card sm:p-8">
      <h1 className="font-display text-2xl font-bold">Signaler un problème</h1>
      <p className="mt-1 text-ink-muted">
        Lampadaire en panne, trottoir abîmé, dépôt sauvage : dites-nous ce qui se passe et où.
        Nous transmettons au bon service.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Type de problème" error={error?.fields?.category}>
          <OptionSelect
            options={meta.issueCategories}
            placeholder="Choisissez le type de problème"
            value={form.category}
            onChange={update('category')}
          />
        </Field>
        <Field
          label="Ce qui s’est passé"
          hint="Depuis quand, ce que vous avez constaté, s’il y a un danger."
          error={error?.fields?.message}
        >
          <textarea className={inputClass} rows={4} value={form.message} onChange={update('message')} />
        </Field>
        <Field
          label="Lieu"
          hint="Adresse ou repère (ex. devant le 12 rue des Filaos)."
          error={error?.fields?.location}
        >
          <input
            className={inputClass}
            value={form.location}
            onChange={update('location')}
            autoComplete="street-address"
          />
        </Field>

        <div className="rounded-control bg-mist p-3 text-sm">
          {position ? (
            <p>
              Position jointe ({position.latitude}, {position.longitude}).{' '}
              <button type="button" onClick={() => setPosition(null)} className="font-semibold underline">
                Retirer
              </button>
            </p>
          ) : (
            <button type="button" onClick={locate} className="font-semibold text-primary underline">
              Joindre ma position actuelle (facultatif)
            </button>
          )}
          {locating && (
            <p role="status" className="mt-1 text-ink-muted">
              {locating}
            </p>
          )}
        </div>

        <FormError error={error} />
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
        >
          {sending ? 'Envoi...' : 'Envoyer le signalement'}
        </button>
      </form>
    </section>
  );
}
