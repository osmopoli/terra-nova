import { useState } from 'react';
import { api } from '../api/client.js';
import { inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { serviceUi, useContentLanguage } from '../lib/contentLanguage.js';

// Annuaire des services municipaux (D05) : liste publique, fiche par service.
export default function ServicesPage({ meta }) {
  const [lang, setLang] = useContentLanguage();
  const t = serviceUi(lang);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const query = new URLSearchParams({ lang });
  if (q.trim()) query.set('q', q.trim());
  if (category) query.set('category', category);
  const { status, data: services } = useAsync(
    () => api(`/services?${query}`),
    [lang, q.trim(), category],
  );
  const filtering = Boolean(q.trim() || category);

  return (
    <section lang={lang}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">{t.intro}</p>
        </div>
        <LanguageSwitcher options={meta.contentLanguages} value={lang} onChange={setLang} />
      </div>

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t.search}</span>
          <input
            type="search"
            className={inputClass}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchHint}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t.category}</span>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t.allCategories}</option>
            {(meta.serviceCategories ?? []).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </form>
      {filtering && status === 'success' && (
        <p role="status" className="mt-4 text-sm font-semibold">
          {t.results(services.length)}
        </p>
      )}

      {status === 'loading' && <p className="mt-8 text-ink-muted">Chargement des services...</p>}
      {status === 'error' && (
        <p role="alert" className="mt-8 text-danger">
          Impossible de charger l'annuaire pour le moment. Réessayez dans quelques instants.
        </p>
      )}
      {status === 'success' && services.length === 0 && !filtering && (
        <p className="mt-8 text-ink-muted">Aucun service n'est encore référencé.</p>
      )}

      {status === 'success' && services.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} lang={service.lang}>
              <Link
                to={`/services/${service.slug}`}
                className="flex h-full flex-col rounded-card border border-mist bg-surface p-5 shadow-card transition hover:border-primary"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {labelOf(meta.serviceCategories, service.category)}
                </span>
                <span className="mt-2 font-display text-lg font-bold text-ink">{service.name}</span>
                <span className="mt-2 flex-1 text-sm text-ink-muted">{service.summary}</span>
                <span lang={lang} className="mt-4 text-sm font-semibold text-primary">
                  {t.see}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
