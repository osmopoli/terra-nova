import { Link } from '../lib/router.jsx';
import { APP_NAME } from '../lib/constants.js';
import ContrastControl from './ContrastControl.jsx';

// Layout du back-office agents : bandeau sombre, distinct de l'espace citoyen.
export default function AgentLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-mist font-sans text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <header className="bg-ink text-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/agent" className="leading-tight text-surface">
            <span className="block font-display text-xl font-bold">{APP_NAME}</span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-accent">
              Espace agents
            </span>
          </Link>
          <nav aria-label="Navigation agents" className="ml-auto flex flex-wrap items-center gap-3 text-sm">
            {user && <span className="hidden text-mist sm:inline">{user.fullName}</span>}
            <ContrastControl className="text-surface" />
            <Link to="/" className="font-bold text-surface underline-offset-4 hover:underline">
              Espace citoyen
            </Link>
            {user && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-control border border-mist px-3 py-1.5 font-bold text-surface hover:bg-surface hover:text-ink"
              >
                Se déconnecter
              </button>
            )}
          </nav>
        </div>
      </header>
      <main id="contenu" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 focus:outline-none">
        {children}
      </main>
    </div>
  );
}
