import { useEffect, useRef, useState } from 'react';
import orbite from '../assets/planete-orbite.svg';
import { APP_NAME } from '../lib/constants.js';
import SkipLink from '../components/SkipLink.jsx';
import TextSizeControl from '../components/TextSizeControl.jsx';
import ContrastControl from '../components/ContrastControl.jsx';
import { Link, navigate } from '../lib/router.jsx';

const TRAVEL_MS = 3000;

// Anneaux du corridor : uniquement des tokens (var(--color-glow)).
const warpRings = {
  backgroundImage:
    'repeating-radial-gradient(ellipse at center, transparent 0 20px, color-mix(in srgb, var(--color-glow) 10%, transparent) 22px 23px, transparent 25px 46px)',
};

export function Brand() {
  return (
    <span className="flex items-center gap-3 font-display font-extrabold uppercase tracking-[0.12em]">
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-card border border-glow/40 shadow-glow"
      >
        <span className="size-5 rounded-full border-2 border-glow" />
      </span>
      {APP_NAME}
    </span>
  );
}

function Ship() {
  return (
    <svg viewBox="0 0 320 180" className="mx-auto w-60 max-w-[70vw]" aria-hidden="true">
      <path className="fill-glow" d="M36 83 3 90l33 8 30-8z" />
      <path
        className="fill-star-muted"
        d="M47 62 198 28c21-5 47 3 63 20l42 43-42 42c-16 17-41 25-63 20L47 120l22-29z"
      />
      <path className="fill-space-panel" d="M105 55 73 13l78 31zm0 73-32 40 78-30z" />
      <path
        className="fill-glow"
        d="M193 43c21-2 39 4 53 17l20 20-80 2c-14 0-23-17-14-28 6-6 13-10 21-11z"
      />
      <path className="fill-space" d="M67 75h52v30H67z" />
    </svg>
  );
}

// Écran d'arrivée du visiteur : « Initier l'approche » lance un voyage de
// 3 secondes, puis ouvre la vraie connexion (/connexion, API /auth/*).
export default function ArrivalPage() {
  const [travelling, setTravelling] = useState(false);
  const cancelRef = useRef(null);
  const launchRef = useRef(null);
  const cancelled = useRef(false);

  function cancel() {
    cancelled.current = true;
    setTravelling(false);
  }

  useEffect(() => {
    if (!travelling) {
      // Voyage annulé (bouton ou Échap) : le focus revient sur le bouton qui l'a lancé.
      if (cancelled.current) launchRef.current?.focus();
      cancelled.current = false;
      return undefined;
    }
    // Pendant le voyage, le focus reste sur « Annuler » (le fond est inerte).
    cancelRef.current?.focus();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => navigate('/connexion'), reduced ? 300 : TRAVEL_MS);
    const onKey = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        cancelRef.current?.focus();
      }
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [travelling]);

  return (
    <div className="min-h-dvh bg-space font-sans text-star">
      <div
        inert={travelling}
        className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cover bg-[center_42%]"
        style={{ backgroundImage: `url(${orbite})` }}
      >
        <SkipLink />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-space/90 to-space/30 md:bg-linear-to-r md:from-space/95 md:via-space/70 md:to-space/10"
        />
        <header className="flex min-h-[4.625rem] flex-wrap items-center justify-between gap-3 border-b border-glow/20 px-6 py-3 backdrop-blur-md md:min-h-[5.625rem] md:px-[clamp(24px,6vw,92px)]">
          <Brand />
          <p className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-star-muted md:block">
            <b className="block text-glow">Système localisé</b>
            Coordonnées NT-01 · Liaison stable
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/accessibilite" className="mr-2 text-sm font-bold text-star underline underline-offset-4">
              Accessibilité
            </Link>
            <TextSizeControl className="text-star" />
            <ContrastControl className="text-star" />
          </div>
        </header>

        <main id="contenu" tabIndex={-1} className="flex flex-1 focus:outline-none items-end px-6 pb-40 pt-12 md:items-center md:px-[clamp(24px,7vw,110px)] md:pb-28">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-glow">
              <span aria-hidden="true" className="h-px w-8 bg-glow" />
              Aux frontières du système Nova
            </p>
            <h1 className="mt-5 mb-5 font-display text-[clamp(48px,15vw,80px)] font-bold leading-[0.9] tracking-tight text-balance md:text-[clamp(56px,8.5vw,128px)]">
              Entrez dans
              <span className="block text-glow">un autre monde.</span>
            </h1>
            <p className="mb-8 max-w-xl text-base text-star-muted md:text-xl">
              Une civilisation s’élève sous un nouveau ciel. Approchez {APP_NAME} et rejoignez le
              cœur numérique de la première cité.
            </p>
            <button
              ref={launchRef}
              type="button"
              onClick={() => setTravelling(true)}
              disabled={travelling}
              className="min-h-14 rounded-control border border-glow/60 bg-glow/15 px-6 font-bold tracking-wide shadow-glow transition hover:-translate-y-0.5 hover:bg-glow/25 disabled:opacity-60"
            >
              Initier l’approche
            </button>
            <Link
              to="/services"
              className="mt-4 block w-fit font-semibold text-star-muted underline-offset-4 hover:text-glow hover:underline sm:ml-6 sm:mt-0 sm:inline-block"
            >
              Découvrir les services municipaux
            </Link>
          </div>
        </main>

        <footer className="absolute inset-x-5 bottom-6 rounded-card border border-glow/20 bg-space/60 px-4 py-3 text-[0.625rem] uppercase tracking-[0.08em] text-star-muted backdrop-blur-md md:inset-x-auto md:right-[clamp(24px,5vw,72px)] md:bottom-10 md:text-xs">
          <dl className="flex flex-wrap justify-between gap-x-3 gap-y-2 md:gap-6">
            <div>
              <dt>Destination</dt>
              <dd className="text-xs font-bold text-star md:text-sm">{APP_NAME}</dd>
            </div>
            <div>
              <dt>Distance</dt>
              <dd className="text-xs font-bold text-star md:text-sm">0,4 UA</dd>
            </div>
            <div>
              <dt>Arrivée estimée</dt>
              <dd className="text-xs font-bold text-star md:text-sm">3 secondes</dd>
            </div>
          </dl>
        </footer>
      </div>

      {travelling && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Approche en cours"
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-space"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-1/5 animate-warp motion-reduce:hidden"
            style={warpRings}
          />
          <div className="relative w-[min(390px,72vw)] text-center">
            <div className="animate-ship-launch motion-reduce:animate-none">
              <div className="animate-ship-float motion-reduce:animate-none">
                <Ship />
              </div>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-glow">
              Traversée du corridor orbital
            </p>
            <div aria-hidden="true" className="mx-auto mt-4 h-0.5 overflow-hidden bg-star/10">
              <div className="h-full origin-left animate-load bg-linear-to-r from-glow via-star to-flare motion-reduce:animate-none" />
            </div>
            <button
              ref={cancelRef}
              type="button"
              onClick={cancel}
              className="mt-6 min-h-11 px-4 text-sm text-star-muted hover:text-star"
            >
              Annuler <kbd className="font-sans font-bold">Échap</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
