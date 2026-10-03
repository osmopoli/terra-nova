import GalaxyImage from '../components/GalaxyImage.jsx';
import { Link } from '../lib/router.jsx';
import { usePageTitle } from '../lib/title.js';

// 404 dans l'ambiance d'arrivée (nuit spatiale) : un signal perdu, un seul chemin de retour.
export default function NotFoundPage({ message = "Cette page n'existe pas ou a été déplacée." }) {
  usePageTitle('Page introuvable');
  return (
    <section
      aria-labelledby="introuvable-titre"
      className="relative isolate mx-auto max-w-3xl overflow-hidden rounded-card bg-space px-6 py-14 text-center text-star shadow-card sm:py-20"
    >
      <GalaxyImage
        sizes="(min-width: 768px) 768px, 100vw"
        className="absolute inset-0 -z-20 size-full object-cover opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-space via-space/70 to-space/30"
      />
      <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-glow sm:text-8xl">
        404
      </p>
      <h1 id="introuvable-titre" className="mt-4 font-display text-2xl font-bold sm:text-3xl">
        Coordonnées inconnues
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-star-muted">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-control bg-glow px-6 py-3 font-bold text-on-primary hover:bg-primary-strong focus-visible:outline-offset-4"
      >
        Retour à l'accueil
      </Link>
    </section>
  );
}
