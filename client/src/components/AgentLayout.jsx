import { Link } from '../lib/router.jsx';
import Brand from './Brand.jsx';
import ContrastControl from './ContrastControl.jsx';
import LightModeControl from './LightModeControl.jsx';
import { LightModeFooter, LightModeNotice } from './LightModeStatus.jsx';
import SkipLink from './SkipLink.jsx';

// Layout du back-office agents : ambiance outil (tokens [data-space="agent"]), distinct de l'espace citoyen.
export default function AgentLayout({ user, onLogout, children }) {
  return (
    <div data-space="agent" className="min-h-screen bg-canvas font-sans text-ink">
      <SkipLink />
      <header className="border-b border-line bg-surface text-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/agent" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control leading-tight text-ink">
            <Brand />
            <span className="rounded-full border border-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Espace agents
            </span>
          </Link>
          <nav aria-label="Navigation agents" className="ml-auto flex flex-wrap items-center gap-3 text-sm">
            {user && <span className="hidden text-ink-muted sm:inline">{user.fullName}</span>}
            <ContrastControl className="text-ink" />
            <LightModeControl className="text-ink" />
            <Link to="/" className="font-semibold text-ink underline underline-offset-4 hover:text-primary">
              Espace citoyen
            </Link>
            {user && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-control border border-line-strong px-3 py-1.5 font-semibold text-ink hover:border-primary hover:bg-mist"
              >
                Se déconnecter
              </button>
            )}
          </nav>
        </div>
      </header>
      <main id="contenu" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 focus:outline-none">
        <LightModeNotice className="mb-4 bg-surface text-ink" />
        {children}
        <LightModeFooter className="mt-8 text-sm text-ink-muted" />
      </main>
    </div>
  );
}
