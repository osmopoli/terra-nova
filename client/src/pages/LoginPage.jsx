import AuthScreen from '../components/AuthScreen.jsx';
import Brand from '../components/Brand.jsx';
import GalaxyImage from '../components/GalaxyImage.jsx';
import SkipLink from '../components/SkipLink.jsx';
import TextSizeControl from '../components/TextSizeControl.jsx';
import ContrastControl from '../components/ContrastControl.jsx';
import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

// Fin du parcours d'arrivée : visuel de la galaxie + vraie connexion / inscription.
export default function LoginPage({ onAuthenticated }) {
  return (
    <>
      <SkipLink />
      <main className="min-h-dvh bg-space font-sans text-star md:grid md:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
        <section
          aria-label="Vue de la ville"
          className="relative isolate flex min-h-[42dvh] flex-col justify-between gap-8 overflow-hidden px-6 py-7 md:p-[clamp(35px,5vw,76px)]"
        >
          <GalaxyImage
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="absolute inset-0 -z-20 size-full object-cover object-center opacity-80"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-space/95 via-space/50 to-space/20"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" aria-label={`${APP_NAME}, retour à l’arrivée`}>
              <Brand size="lg" />
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/accessibilite" className="mr-2 text-sm font-bold text-star underline underline-offset-4">
                Accessibilité
              </Link>
              <TextSizeControl className="text-star" />
              <ContrastControl className="text-star" />
            </div>
          </div>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-glow">
              Portail citoyen sécurisé
            </p>
            <h1 className="mt-4 font-display text-[43px] font-bold leading-[0.96] tracking-tight md:text-[clamp(44px,6vw,86px)]">
              Bienvenue
              <br />
              chez vous.
            </h1>
            <p className="mt-4 max-w-lg text-star-muted md:text-lg">
              Retrouvez les services, les annonces et les démarches qui rythment la vie de la première
              cité de ce nouveau monde.
            </p>
          </div>
        </section>
        <section
          id="contenu"
          tabIndex={-1}
          aria-label="Connexion ou inscription"
          className="grid place-items-center border-t border-line bg-space-panel focus:outline-none px-4 py-10 md:border-t-0 md:border-l md:p-[clamp(24px,6vw,92px)]">
          <AuthScreen onAuthenticated={onAuthenticated} />
        </section>
      </main>
    </>
  );
}
