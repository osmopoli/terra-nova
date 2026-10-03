import { api } from '../api/client.js';
import { useAsync } from '../lib/useAsync.js';

// Le 114 se joint par SMS (personnes sourdes ou malentendantes), les autres par appel.
const SMS_ONLY = '114';
const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`;
const routeHref = (address) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

// Urgences et santé (F46) : numéros d'urgence d'abord, puis où se faire soigner.
// Page publique, pensée pour tenir sur un écran de téléphone (360 px).
export default function EmergencyPage({ meta }) {
  const { status, data: places } = useAsync(() => api('/urgences'), []);
  const numbers = meta.emergencyNumbers ?? [];

  return (
    <section className="space-y-4 sm:space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Urgences et santé</h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-base">
          Gratuit, 24 h/24, même sans crédit.
        </p>
      </header>

      <ul aria-label="Numéros d'urgence" className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {numbers.map(({ value, label }) => (
          <li key={value}>
            <a
              href={value === SMS_ONLY ? `sms:${value}` : `tel:${value}`}
              aria-label={`${value === SMS_ONLY ? 'Écrire au' : 'Appeler le'} ${value} : ${label}`}
              className="flex h-full flex-col items-center rounded-control bg-danger px-1 py-2 text-center text-white hover:opacity-90 sm:items-start sm:px-4 sm:py-3 sm:text-left"
            >
              <span className="font-display text-xl font-bold leading-none sm:text-3xl">{value}</span>
              <span className="mt-1 text-xs leading-tight sm:text-sm">{label}</span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="lieux-soins">
        <h2 id="lieux-soins" className="font-display text-lg font-bold sm:text-xl">
          Hôpitaux et urgences à Nova Terra
        </h2>

        {status === 'loading' && <p className="mt-3 text-ink-muted">Chargement...</p>}
        {status === 'error' && (
          <p role="alert" className="mt-3 text-danger">
            Liste indisponible pour le moment. En cas d'urgence, appelez le 15.
          </p>
        )}
        {status === 'success' && places.length === 0 && (
          <p className="mt-3 text-ink-muted">Aucun lieu de soins n'est encore référencé.</p>
        )}

        {status === 'success' && places.length > 0 && (
          <ul className="mt-2 grid gap-2 sm:mt-3 sm:gap-4 lg:grid-cols-3">
            {places.map((place) => (
              <li
                key={place.slug}
                className="rounded-card border border-mist bg-surface px-3 py-2.5 shadow-card sm:p-5"
              >
                <h3 className="font-display font-bold leading-tight sm:text-lg">{place.name}</h3>
                <p className="text-sm font-semibold text-success sm:mt-1">{place.hours}</p>
                <p className="hidden text-sm text-ink-muted sm:mt-2 sm:block">{place.summary}</p>
                {place.address && <p className="text-sm text-ink-muted sm:mt-1">{place.address}</p>}
                <div className="mt-2 flex flex-wrap gap-2 sm:mt-4">
                  {place.phone && (
                    <a
                      href={telHref(place.phone)}
                      className="rounded-control bg-primary px-3 py-1 text-sm font-bold text-white hover:bg-primary-strong sm:py-1.5"
                    >
                      Appeler le {place.phone}
                    </a>
                  )}
                  {place.address && (
                    <a
                      href={routeHref(place.address)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-control border border-primary px-3 py-1 text-sm font-bold text-primary hover:bg-mist sm:py-1.5"
                    >
                      Itinéraire
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
