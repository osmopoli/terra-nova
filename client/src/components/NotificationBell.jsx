import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { Link, navigate } from '../lib/router.jsx';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const REFRESH_MS = 30000;

// Icône par état : l'information ne repose jamais sur la couleur seule.
const STATUS_ICONS = {
  nouveau: 'M12 5v14M5 12h14',
  en_cours: 'M12 6v6l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  traite: 'M5 12.5l4.5 4.5L19 7.5',
};

function StatusIcon({ status }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <path d={STATUS_ICONS[status] ?? STATUS_ICONS.nouveau} />
    </svg>
  );
}

/** Cloche d'en-tête : compteur de notifications non lues et liste menant à la demande. */
export default function NotificationBell() {
  const [data, setData] = useState({ unread: 0, notifications: [] });
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const load = useCallback(() => {
    api('/me/notifications')
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, [open]);

  async function openNotification(n) {
    setOpen(false);
    navigate(`/profil?demande=${encodeURIComponent(n.trackingCode)}`);
    if (!n.readAt) {
      await api(`/me/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {});
      load();
    }
  }

  const label =
    data.unread > 0
      ? `Notifications, ${data.unread} non lue${data.unread > 1 ? 's' : ''}`
      : 'Notifications, aucune non lue';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-control text-ink hover:bg-mist"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0" />
        </svg>
        {data.unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-accent-strong px-1 text-center text-xs font-bold leading-5 text-white"
          >
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-3 shadow-pop">
          <h2 className="px-1 pb-2 text-sm font-semibold text-ink">Notifications</h2>
          {data.notifications.length === 0 ? (
            <p className="px-1 py-2 text-sm text-ink-muted">Aucune notification pour le moment.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-mist overflow-y-auto">
              {data.notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/profil?demande=${encodeURIComponent(n.trackingCode)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openNotification(n);
                    }}
                    className="flex gap-2 rounded-control px-1 py-2 text-sm text-ink hover:bg-mist"
                  >
                    <StatusIcon status={n.status} />
                    <span className="min-w-0">
                      <span className={n.readAt ? '' : 'font-bold'}>
                        Votre demande « {n.subject} » est passée à {n.statusLabel}
                        {n.readAt ? '' : ' (non lue)'}
                      </span>
                      <span className="mt-0.5 block text-ink-muted">{n.action}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {dateFormat.format(new Date(n.createdAt))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
