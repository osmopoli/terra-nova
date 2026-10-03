import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';
import ListState from '../components/ListState.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { serviceUi, useContentLanguage } from '../lib/contentLanguage.js';

// Annuaire des services municipaux (D05) : liste publique, fiche par service.
export default function ServicesPage({ meta }) {
  const [lang, setLang] = useContentLanguage();
  const t = serviceUi(lang);
  const state = useAsync(() => api(`/services?lang=${lang}`), [lang]);
  const services = Array.isArray(state.data) ? state.data : [];

  return (
    <section lang={lang}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">{t.intro}</p>
        </div>
        <LanguageSwitcher options={meta.contentLanguages} value={lang} onChange={setLang} />
      </div>

      <ListState
        state={state}
        isEmpty={!services.length}
        loadingLabel="Chargement des services..."
        empty={{
          title: 'Aucun service référencé',
          text: 'L’annuaire de Nova Terra se complète au fil des ouvertures. En attendant, la mairie répond à vos questions.',
          action: (
            <Link
              to="/contact"
              className="inline-block rounded-control bg-primary px-4 py-2 text-sm font-semibold text-surface hover:bg-primary-strong"
            >
              Contacter la mairie
            </Link>
          ),
        }}
      >
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
      </ListState>
    </section>
  );
}
