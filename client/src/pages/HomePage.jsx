import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

// Page d'accueil provisoire : à remplacer par l'écran principal du sujet.
export default function HomePage({ user }) {
  return (
    <section className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{APP_NAME}</h1>
      <p className="mt-4 text-ink-muted">
        La plateforme des services municipaux de Nova Terra : créez votre compte pour suivre vos démarches.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/services"
          className="inline-block rounded-control border border-primary px-5 py-3 font-semibold text-primary hover:bg-mist"
        >
          Découvrir les services municipaux
        </Link>
        {!user && (
          <Link
            to="/connexion"
            className="inline-block rounded-control bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
          >
            Créer un compte
          </Link>
        )}
      </div>
    </section>
  );
}
