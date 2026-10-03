import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { Link } from '../lib/router.jsx';

// Vérifie régulièrement les annonces importantes : l'habitant est prévenu sans recharger la page.
const REFRESH_MS = 60_000;
const canNotify = () => typeof Notification !== 'undefined';

/** F30 : prévenir l'habitant connecté des annonces importantes (cloche + notification navigateur). */
export default function NotificationBell({ user }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(canNotify() ? Notification.permission : 'denied');
  const known = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api('/news/important/unread');
        if (cancelled) return;
        // Notification navigateur uniquement pour les annonces arrivées pendant la visite.
        if (known.current && canNotify() && Notification.permission === 'granted') {
          for (const post of data.filter((p) => !known.current.has(p.id))) {
            new Notification(`Annonce importante : ${post.title}`, { body: post.summary, tag: `news-${post.id}` });
          }
        }
        known.current = new Set(data.map((p) => p.id));
        setItems(data);
      } catch {
        // Hors ligne ou session expirée : la cloche reste en l'état.
      }
    }
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user.id]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    // Fermer le panneau vaut lecture : le compteur repart de zéro.
    if (!next && items.length > 0) {
      setItems([]);
      api('/news/important/seen', { method: 'POST' }).catch(() => {});
    }
  }

  async function enableBrowser() {
    setPermission(await Notification.requestPermission());
  }

  const count = items.length;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="annonces-importantes"
        className="relative inline-flex min-h-9 items-center gap-2 rounded-control border border-ink-muted/40 px-3 text-sm font-bold text-ink hover:bg-mist"
      >
        Annonces
        <span
          className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs ${count ? 'bg-danger text-white' : 'bg-mist text-ink-muted'}`}
        >
          {count}
        </span>
        <span className="sr-only">{count ? ` annonce(s) importante(s) non lue(s)` : ' : rien de nouveau'}</span>
      </button>

      {open && (
        <div
          id="annonces-importantes"
          className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card bg-surface p-4 text-left shadow-card ring-1 ring-ink-muted/20"
        >
          <p className="font-display font-bold">Annonces importantes</p>
          {count === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Aucune nouvelle annonce importante.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {items.map((post) => (
                <li key={post.id} className="border-l-4 border-danger pl-3">
                  <Link
                    to={`/actualites/${post.id}`}
                    onClick={toggle}
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-ink-muted">{post.summary}</p>
                </li>
              ))}
            </ul>
          )}
          {canNotify() && permission === 'default' && (
            <button
              type="button"
              onClick={enableBrowser}
              className="mt-4 text-sm font-semibold text-primary underline"
            >
              Être aussi prévenu par une notification du navigateur
            </button>
          )}
          <Link to="/actualites" onClick={toggle} className="mt-4 block text-sm font-semibold text-primary">
            Toutes les actualités
          </Link>
        </div>
      )}
    </div>
  );
}
