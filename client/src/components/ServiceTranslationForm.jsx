import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, inputClass } from './Field.jsx';

const EMPTY = { name: '', summary: '', description: '', hours: '' };

// Saisie de la traduction d'un service (F27), affichée aux administrateurs sur la fiche.
// Un champ laissé vide retombe sur le texte français.
export default function ServiceTranslationForm({ slug, languages = [], onSaved }) {
  const targets = languages.filter((o) => o.value !== 'fr');
  const [lang, setLang] = useState(targets.find((o) => o.value === 'en')?.value ?? targets[0]?.value);
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!lang) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    api(`/admin/services/${slug}/translations/${lang}`)
      .then(({ translation }) => setValues({ ...EMPTY, ...translation }))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug, lang]);

  if (!lang) return null;

  const bind = (name) => ({
    value: values[name] ?? '',
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    disabled: loading || saving,
    lang,
  });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { name, summary, description, hours } = values;
      await api(`/admin/services/${slug}/translations/${lang}`, {
        method: 'PUT',
        body: { name, summary, description, hours },
      });
      setSaved(true);
      onSaved?.(lang);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 rounded-card border border-mist bg-surface p-5 shadow-card">
      <h2 className="font-display text-xl font-bold">Traduction du service (admin)</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Un champ laissé vide affiche le texte français. Les démarches gardent leur traduction actuelle.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        {targets.length > 1 && (
          <Field label="Langue">
            <select className={inputClass} value={lang} onChange={(e) => setLang(e.target.value)}>
              {targets.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Nom" error={error?.fields?.name}>
          <input className={inputClass} maxLength={120} {...bind('name')} />
        </Field>
        <Field label="Résumé" error={error?.fields?.summary}>
          <input className={inputClass} maxLength={255} {...bind('summary')} />
        </Field>
        <Field label="Description" error={error?.fields?.description}>
          <textarea className={inputClass} rows={5} maxLength={5000} {...bind('description')} />
        </Field>
        <Field label="Horaires" error={error?.fields?.hours}>
          <textarea className={inputClass} rows={3} maxLength={1000} {...bind('hours')} />
        </Field>
        <FormError error={error} />
        {saved && (
          <p role="status" className="rounded-control bg-mist p-3 text-sm">
            Traduction enregistrée.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || saving}
          className="w-full rounded-control bg-primary px-4 py-2.5 font-semibold text-white disabled:opacity-60 sm:w-auto"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer la traduction'}
        </button>
      </form>
    </section>
  );
}
