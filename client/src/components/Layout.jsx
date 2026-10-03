import { Link, NavLink } from '../lib/router.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import { APP_NAME } from '../lib/constants.js';
import TextSizeControl from './TextSizeControl.jsx';

export default function Layout({ user, children }) {
  // Entrée active : soulignée en couleur primaire (aria-current posé par NavLink).
  const linkClass =
    'font-bold text-ink underline-offset-4 hover:underline aria-[current=page]:text-primary aria-[current=page]:underline aria-[current=page]:decoration-2';
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
            <TextSizeControl className="text-ink" />
            <NavLink to="/" className={linkClass}>
              Accueil
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <NavLink to="/services" className={linkClass}>
              Services
            </NavLink>
            <NavLink
              to={user ? '/profil' : '/connexion'}
              className="rounded-control bg-primary px-3 py-1.5 font-bold text-white hover:bg-primary-strong aria-[current=page]:bg-primary-strong aria-[current=page]:ring-2 aria-[current=page]:ring-accent aria-[current=page]:ring-offset-2"
            >
              {user ? 'Mon profil' : 'Se connecter'}
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="contenu" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 focus:outline-none">
        <Breadcrumb />
        {children}
      </main>
      <footer className="border-t border-mist">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-ink-muted sm:px-6">
          <p>{APP_NAME}, la plateforme des services municipaux.</p>
          <Link to="/vos-donnees" className="font-semibold text-ink underline underline-offset-4 hover:text-primary">
            Vos données
          </Link>
        </div>
      </footer>
    </div>
  );
}
