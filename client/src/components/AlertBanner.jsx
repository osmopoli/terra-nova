import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { labelOf } from '../lib/constants.js';

// Alertes rafraîchies régulièrement : une alerte publiée apparaît sans recharger la page.
const REFRESH_MS = 60_000;

// Styles par niveau (tokens uniquement) : urgent = danger, important = accent, info = primary.
const TONES = {
  urgent: { box: 'border-danger bg-danger/10', badge: 'bg-danger text-white' },
  important: { box: 'border-accent bg-accent/15', badge: 'bg-accent text-ink' },
  info: { box: 'border-primary bg-primary/10', badge: 'bg-primary text-white' },
};

function AlertItem({ alert, meta }) {
  const tone = TONES[alert.level] ?? TONES.info;
  const zones = alert.districts?.map((d) => labelOf(meta.districts, d)).join(', ');
  // Alerte ciblée qui ne concerne pas le quartier de l'habitant : repliée par défaut.
  const [open, setOpen] = useState(alert.concernsYou !== false);

  return (
    <article
      className={`rounded-card border-l-4 p-4 text-ink ${tone.box}`}
      aria-labelledby={`alerte-${alert.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-control px-2 py-0.5 text-xs font-bold uppercase ${tone.badge}`}>
          {labelOf(meta.alertLevels, alert.level)}
        </span>
        {zones && <span className="text-sm font-semibold">{zones}</span>}
        {alert.concernsYou && alert.districts?.length > 0 && (
          <span className="rounded-control border border-ink px-2 py-0.5 text-xs font-bold">
            Votre quartier
          </span>
        )}
      </div>
      <h2 id={`alerte-${alert.id}`} className="mt-2 font-display text-lg font-bold">
        {alert.title}
      </h2>
      {open ? (
        <>
          <p className="mt-1">{alert.message}</p>
          {alert.instructions && (
            <div className="mt-3 rounded-control bg-surface p-3">
              <p className="text-sm font-bold">Que faire</p>
              <p className="mt-1 whitespace-pre-line">{alert.instructions}</p>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 text-sm font-semibold underline underline-offset-4"
        >
          Hors de votre quartier : afficher le détail
        </button>
      )}
    </article>
  );
}

/** Bannière des alertes en cours (D18), ciblées par quartier (F29). */
export default function AlertBanner({ user, meta = {} }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api('/alerts/active')
        .then((data) => !cancelled && setAlerts(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // Recharger quand l'habitant se connecte ou change de quartier.
  }, [user?.id, user?.district]);

  if (alerts.length === 0) return null;
  const urgent = alerts.some((a) => a.level === 'urgent' && a.concernsYou !== false);

  return (
    <section
      aria-label="Alertes en cours"
      role={urgent ? 'alert' : undefined}
      className="mx-auto max-w-6xl space-y-3 px-4 pt-4 sm:px-6"
    >
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} meta={meta} />
      ))}
    </section>
  );
}
