import { useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, OptionSelect, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { useAsync } from '../lib/useAsync.js';

// Valeur d'un <input type="datetime-local"> dans `hours` heures (heure locale).
function localInput(hours) {
  const d = new Date(Date.now() + hours * 3_600_000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset(), 0, 0);
  return d.toISOString().slice(0, 16);
}

const EMPTY = {
  title: '',
  message: '',
  instructions: '',
  level: 'urgent',
  districts: [],
  endsAt: localInput(24),
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

function status(alert) {
  const now = Date.now();
  if (new Date(alert.endsAt) <= now) return 'Terminée';
  if (new Date(alert.startsAt) > now) return 'Programmée';
  return 'En cours';
}

/** Administration des alertes (D18, ciblage F29) : diffuser, suivre et retirer. */
export default function AdminAlertsPage({ meta }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(null);
  const [version, setVersion] = useState(0);
  const list = useAsync(() => api('/alerts'), [version]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggleDistrict = (value) =>
    setForm({
      ...form,
      districts: form.districts.includes(value)
        ? form.districts.filter((d) => d !== value)
        : [...form.districts, value],
    });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSent(null);
    try {
      const alert = await api('/alerts', {
        method: 'POST',
        body: {
          ...form,
          instructions: form.instructions.trim() || null,
          districts: form.districts.length ? form.districts : null,
          endsAt: new Date(form.endsAt).toISOString(),
        },
      });
      setSent(alert);
      setForm(EMPTY);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err);
    }
  }

  async function remove(alert) {
    if (!window.confirm(`Retirer l’alerte « ${alert.title} » ?`)) return;
    await api(`/alerts/${alert.id}`, { method: 'DELETE' });
    setVersion((v) => v + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
        <h1 className="font-display text-2xl font-bold">Diffuser une alerte</h1>
        <p className="mt-1 text-sm text-ink-muted">
          L’alerte s’affiche immédiatement en bannière sur toutes les pages, jusqu’à sa date de
          fin. Sans quartier coché, elle concerne toute la ville.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Field label="Titre" error={error?.fields?.title}>
            <input className={inputClass} value={form.title} onChange={update('title')} />
          </Field>
          <Field label="Message" error={error?.fields?.message}>
            <textarea
              className={inputClass}
              rows={3}
              value={form.message}
              onChange={update('message')}
            />
          </Field>
          <Field
            label="Consignes"
            hint="Ce que les personnes concernées doivent faire maintenant."
            error={error?.fields?.instructions}
          >
            <textarea
              className={inputClass}
              rows={3}
              value={form.instructions}
              onChange={update('instructions')}
            />
          </Field>
          <Field label="Niveau" error={error?.fields?.level}>
            <OptionSelect options={meta.alertLevels} value={form.level} onChange={update('level')} />
          </Field>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Quartiers concernés</legend>
            <div className="flex flex-wrap gap-2">
              {(meta.districts ?? []).map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 rounded-control border border-ink-muted/40 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.districts.includes(d.value)}
                    onChange={() => toggleDistrict(d.value)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
            {error?.fields?.districts && (
              <span className="mt-1 block text-sm text-danger">{error.fields.districts}</span>
            )}
          </fieldset>
          <Field label="Fin de diffusion" error={error?.fields?.endsAt}>
            <input
              className={inputClass}
              type="datetime-local"
              value={form.endsAt}
              onChange={update('endsAt')}
            />
          </Field>
          <FormError error={error} />
          {sent && (
            <p role="status" className="rounded-control bg-primary/10 p-3 text-sm text-ink">
              Alerte « {sent.title} » diffusée.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-control bg-primary py-3 font-semibold text-white hover:bg-primary-strong"
          >
            Diffuser l’alerte
          </button>
        </form>
      </section>

      <section aria-labelledby="alertes-diffusees">
        <h2 id="alertes-diffusees" className="font-display text-xl font-bold">
          Alertes diffusées
        </h2>
        {list.status === 'loading' && <p className="mt-4 text-ink-muted">Chargement...</p>}
        {list.status === 'error' && <p className="mt-4 text-danger">{list.error.message}</p>}
        {list.status === 'success' && list.data.length === 0 && (
          <p className="mt-4 text-ink-muted">Aucune alerte pour le moment.</p>
        )}
        <ul className="mt-4 space-y-3">
          {list.data?.map((alert) => (
            <li key={alert.id} className="rounded-card bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-ink-muted">
                    {labelOf(meta.alertLevels, alert.level)} · {status(alert)}
                  </p>
                  <h3 className="font-bold">{alert.title}</h3>
                  <p className="text-sm text-ink-muted">
                    {alert.districts?.length
                      ? alert.districts.map((d) => labelOf(meta.districts, d)).join(', ')
                      : 'Toute la ville'}{' '}
                    · jusqu’au {formatDate(alert.endsAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(alert)}
                  className="rounded-control border border-danger px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger/10"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
