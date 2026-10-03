import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';
import Loading from '../components/Loading.jsx';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

// Annuaire des services municipaux (D05) : liste publique, fiche par service.
export default function ServicesPage({ meta }) {
  const { status, data: services } = useAsync(() => api('/services'), []);

  return (
    <section>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Services municipaux</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Trouvez le service qui correspond à votre besoin : horaires, contact et démarches utiles.
      </p>

      {status === 'loading' && <Loading label="Chargement des services" className="mt-8 max-w-md" />}
      {status === 'error' && (
        <p role="alert" className="mt-8 text-danger">
          Impossible de charger l'annuaire pour le moment. Réessayez dans quelques instants.
        </p>
      )}
      {status === 'success' && services.length === 0 && (
        <p className="mt-8 text-ink-muted">Aucun service n'est encore référencé.</p>
      )}

      {status === 'success' && services.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                to={`/services/${service.slug}`}
                className="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition hover:border-primary"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {labelOf(meta.serviceCategories, service.category)}
                </span>
                <span className="mt-2 font-display text-lg font-bold text-ink">{service.name}</span>
                <span className="mt-2 flex-1 text-sm text-ink-muted">{service.summary}</span>
                <span className="mt-4 text-sm font-semibold text-primary">Voir la fiche</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
