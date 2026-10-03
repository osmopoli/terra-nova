import horizon from '../assets/planete-horizon.svg';
import AuthScreen from '../components/AuthScreen.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../lib/i18n.js';
import { Link } from '../lib/router.jsx';
import { Brand } from './ArrivalPage.jsx';

// Fin du parcours d'arrivée : visuel de la planète + vraie connexion / inscription.
export default function LoginPage({ onAuthenticated }) {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh bg-space font-sans text-star md:grid md:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <section
        aria-label={t('login.cityView')}
        className="relative isolate flex min-h-[42dvh] flex-col justify-between gap-8 overflow-hidden bg-cover bg-center px-6 py-7 md:p-[clamp(35px,5vw,76px)]"
        style={{ backgroundImage: `url(${horizon})` }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-space/95 via-space/50 to-space/20"
        />
        <div className="flex items-center justify-between gap-3">
          <Link to="/" aria-label={t('login.backToArrival')}>
            <Brand />
          </Link>
          <LanguageSwitcher dark />
        </div>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-glow">
            {t('login.kicker')}
          </p>
          <h1 className="mt-4 font-display text-[43px] font-bold leading-[0.96] tracking-tight md:text-[clamp(44px,6vw,86px)]">
            {t('login.title1')}
            <br />
            {t('login.title2')}
          </h1>
          <p className="mt-4 max-w-lg text-star-muted md:text-lg">
            {t('login.intro')}
          </p>
        </div>
      </section>
      <section className="grid place-items-center border-t border-glow/20 bg-space-panel px-4 py-10 md:border-t-0 md:border-l md:p-[clamp(24px,6vw,92px)]">
        <AuthScreen onAuthenticated={onAuthenticated} />
      </section>
    </div>
  );
}
