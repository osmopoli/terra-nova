import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Link } from '../lib/router.jsx';

const REFRESH_MS = 30_000;
// Événement émis après une prise en charge : le compteur se met à jour sans attendre.
export const WORKLOAD_EVENT = 'agent:workload';

/** D17 : nombre de demandes qui attendent une prise en charge, visible partout dans l'en-tête agent. */
export default function PendingCounter() {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api('/agent/demandes/summary')
        .then((s) => !cancelled && setPending(s.pending))
        .catch(() => {});
    load();
    const timer = setInterval(load, REFRESH_MS);
    window.addEventListener(WORKLOAD_EVENT, load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(WORKLOAD_EVENT, load);
    };
  }, []);

  if (pending === null) return null;
  return (
    <Link
      to="/agent/demandes"
      className={`inline-flex min-h-9 items-center gap-2 rounded-control px-3 text-sm font-bold ${
        pending > 0 ? 'bg-accent text-ink' : 'bg-mist text-ink-muted'
      }`}
    >
      <span className="text-base">{pending}</span>
      {pending > 1 ? 'demandes en attente' : 'demande en attente'}
    </Link>
  );
}
