import { Link } from '../lib/router.jsx';
import { APP_NAME } from '../lib/constants.js';
import { useI18n } from '../lib/i18n.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function Layout({ user, children }) {
  const { t } = useI18n();
  const linkClass = 'font-bold text-ink underline-offset-4 hover:underline';
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2"
      >
        {t('nav.skip')}
      </a>
      <header className="border-b border-mist">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold leading-none text-ink sm:text-2xl">
            {APP_NAME}
          </Link>
          <nav aria-label={t('nav.main')} className="ml-auto flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/" className={linkClass}>
              {t('nav.home')}
            </Link>
            <Link
              to={user ? '/profil' : '/connexion'}
              className="rounded-control bg-primary px-3 py-1.5 font-bold text-white hover:bg-primary-strong"
            >
              {user ? t('nav.profile') : t('nav.login')}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main id="contenu" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
