import { APP_NAME } from '../lib/constants.js';
import { useI18n } from '../lib/i18n.js';
import { Link } from '../lib/router.jsx';

// Page d'accueil provisoire : à remplacer par l'écran principal du sujet.
export default function HomePage({ user }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{APP_NAME}</h1>
      <p className="mt-4 text-ink-muted">
        {t('home.intro')}
      </p>
      {!user && (
        <Link
          to="/connexion"
          className="mt-8 inline-block rounded-control bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
        >
          {t('home.cta')}
        </Link>
      )}
    </section>
  );
}
