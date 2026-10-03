import { useState } from 'react';
import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';
import NotFoundPage from './NotFoundPage.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import ServiceTranslationForm from '../components/ServiceTranslationForm.jsx';
import { serviceUi, useContentLanguage } from '../lib/contentLanguage.js';
import { useLightMode } from '../lib/lightMode.js';

function ContactList({ service, className }) {
  return (
    <ul className={className}>
      {service.phone && (
        <li>
          <a href={`tel:${service.phone.replace(/s/g, '')}`} className="text-primary hover:underline">
            {service.phone}
          </a>
        </li>
      )}
      {service.email && (
        <li>
          <a href={`mailto:${service.email}`} className="break-all text-primary hover:underline">
            {service.email}
          </a>
        </li>
      )}
      {service.address && <li className="text-ink-muted">{service.address}</li>}
    </ul>
  );
}

// Version légère (F62) : une seule colonne de texte, dans l'ordre où on la consulte :
// horaires, contact, démarches, puis présentation.
function ServiceEssentials({ service, t }) {
  return (
    <div className="mt-6 max-w-2xl space-y-6">
      <section>
        <h2 className="text-lg font-bold">{t.hours}</h2>
        <p className="mt-1 whitespace-pre-line">{service.hours}</p>
      </section>
      <section>
        <h2 className="text-lg font-bold">{t.contact}</h2>
        <ContactList service={service} className="mt-1 space-y-1" />
      </section>
      {service.procedures.length > 0 && (
        <section>
          <h2 className="text-lg font-bold">{t.procedures}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-6">
            {service.procedures.map((procedure) => (
              <li key={procedure.title}>
                <span className="font-semibold">{procedure.title}</span> : {procedure.detail}
              </li>
            ))}
          </ol>
        </section>
      )}
      <section>
        <h2 className="text-lg font-bold">{t.presentation}</h2>
        <p className="mt-1 leading-relaxed">{service.description}</p>
      </section>
    </div>
  );
}

// Fiche détail d'un service municipal : description, horaires, contact, démarches.
export default function ServicePage({ slug, meta, user }) {
  const [lang, setLang] = useContentLanguage();
  const t = serviceUi(lang);
  const [revision, setRevision] = useState(0);
  const light = useLightMode();
  const { status, data: service, error } = useAsync(
    () => api(`/services/${slug}?lang=${lang}`),
    [slug, lang, revision],
  );

  // Rechargement après une saisie admin : on garde la fiche affichée (et le formulaire monté).
  if (status === 'loading' && service?.slug !== slug) {
    return <p className="text-ink-muted">Chargement du service...</p>;
  }
  if (status === 'error') {
    if (error.status === 404) return <NotFoundPage message="Ce service n'existe pas." />;
    return (
      <p role="alert" className="text-danger">
        Impossible de charger ce service pour le moment. Réessayez dans quelques instants.
      </p>
    );
  }

  return (
    <article lang={service.lang}>
      <div className="flex flex-wrap items-center justify-between gap-3" lang={lang}>
        <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
          ← {t.back}
        </Link>
        <LanguageSwitcher options={meta.contentLanguages} value={lang} onChange={setLang} />
      </div>
      {service.lang !== lang && (
        <p lang={lang} role="status" className="mt-4 rounded-control bg-mist p-3 text-sm">
          {t.notTranslated}
        </p>
      )}
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">
        {labelOf(meta.serviceCategories, service.category)}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{service.name}</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-muted">{service.summary}</p>

      {light ? (
        <ServiceEssentials service={service} t={t} />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="font-display text-xl font-bold">{t.presentation}</h2>
              <p className="mt-2 leading-relaxed">{service.description}</p>
            </section>

            {service.procedures.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold">{t.procedures}</h2>
                <ol className="mt-3 space-y-3">
                  {service.procedures.map((procedure, index) => (
                    <li key={procedure.title} className="flex gap-3 rounded-card bg-mist p-4">
                      <span
                        aria-hidden="true"
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">{procedure.title}</h3>
                        <p className="mt-1 text-sm text-ink-muted">{procedure.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* Horaires et contact d'abord sur mobile : c'est l'information la plus cherchée. */}
          <aside className="order-first h-fit space-y-6 lg:order-none rounded-card border border-mist bg-surface p-5 shadow-card">
            <section>
              <h2 className="font-semibold">{t.hours}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">{service.hours}</p>
            </section>
            <section>
              <h2 className="font-semibold">{t.contact}</h2>
              <ContactList service={service} className="mt-1 space-y-1 text-sm" />
            </section>
          </aside>
        </div>
      )}

      {user?.role === 'admin' && (
        <ServiceTranslationForm
          slug={slug}
          languages={meta.contentLanguages}
          onSaved={(saved) => {
            setLang(saved);
            setRevision((r) => r + 1);
          }}
        />
      )}
    </article>
  );
}
