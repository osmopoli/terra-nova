import { Link, NavLink } from '../lib/router.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import { APP_NAME } from '../lib/constants.js';
import Brand from './Brand.jsx';
import TextSizeControl from './TextSizeControl.jsx';
import ContrastControl from './ContrastControl.jsx';
import LightModeControl from './LightModeControl.jsx';
import { LightModeFooter, LightModeNotice } from './LightModeStatus.jsx';
import SkipLink from './SkipLink.jsx';

export default function Layout({ user, children }) {
  // Entrée active : soulignée en couleur primaire (aria-current posé par NavLink).
  const linkClass =
    'font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline aria-[current=page]:text-primary aria-[current=page]:underline aria-[current=page]:decoration-2';
  // Agents et admins travaillent dans l'ambiance « outil » (tokens redéfinis dans index.css).
  const space = user && user.role !== 'citoyen' ? 'agent' : 'citoyen';
  return (
    <div data-space={space} className="ciel min-h-screen font-sans text-ink">
      <SkipLink />
      <header className="border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link to="/" className="rounded-control text-ink">
            <Brand />
          </Link>
          <nav aria-label="Navigation principale" className="ml-auto flex flex-wrap items-center gap-3 sm:gap-4">
            <TextSizeControl className="text-ink" />
            <ContrastControl className="text-ink" />
            <LightModeControl className="text-ink" />
            <NavLink to="/" className={linkClass}>
              Accueil
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <NavLink to="/services" className={linkClass}>
              Services
            </NavLink>
            {(!user || user.role === 'citoyen') && (
              <NavLink to="/signaler" className={linkClass}>
                Signaler un problème
              </NavLink>
            )}
            {user && user.role !== 'citoyen' && (
              <NavLink to="/agent/demandes" className={linkClass}>
                Demandes des habitants
              </NavLink>
            )}
            <NavLink
              to={user ? '/profil' : '/connexion'}
              className="rounded-control bg-primary px-3 py-1.5 font-bold text-on-primary hover:bg-primary-strong aria-[current=page]:bg-primary-strong aria-[current=page]:ring-2 aria-[current=page]:ring-primary-strong aria-[current=page]:ring-offset-2 aria-[current=page]:ring-offset-surface"
            >
              {user ? 'Mon profil' : 'Se connecter'}
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="contenu" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 focus:outline-none">
        <LightModeNotice className="mb-4 bg-surface text-ink" />
        <Breadcrumb />
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-ink-muted sm:px-6">
          <p>{APP_NAME}, la plateforme des services municipaux.</p>
          <LightModeFooter />
          <div className="flex flex-wrap gap-4">
            <Link to="/accessibilite" className="font-semibold text-ink">
              Accessibilité
            </Link>
            <Link to="/sobriete" className="font-semibold text-ink">
              Sobriété numérique
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
