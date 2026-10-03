import { Link } from '../lib/router.jsx';
import { APP_NAME } from '../lib/constants.js';

export default function Layout({ user, children }) {
  const linkClass = 'font-bold text-ink underline-offset-4 hover:underline';
  // Agents et admins travaillent dans l'ambiance « outil » (tokens redéfinis dans index.css).
  const space = user && user.role !== 'citoyen' ? 'agent' : 'citoyen';
  return (
    <div data-space={space} className="min-h-screen bg-canvas font-sans text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold leading-none text-ink sm:text-2xl">
            {APP_NAME}
          </Link>
          <nav aria-label="Navigation principale" className="ml-auto flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/" className={linkClass}>
              Accueil
            </Link>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
            <Link to="/services" className={linkClass}>
              Services
            </Link>
            <Link
              to={user ? '/profil' : '/connexion'}
              className="rounded-control bg-primary px-3 py-1.5 font-bold text-white hover:bg-primary-strong"
            >
              {user ? 'Mon profil' : 'Se connecter'}
            </Link>
          </nav>
        </div>
      </header>
      <main id="contenu" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
