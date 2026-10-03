import { useState } from 'react';
import { api } from '../api/client.js';
import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

// Les trois premiers gestes d'un nouvel habitant (D12), dans l'ordre où il en a besoin.
const STEPS = [
  {
    to: '/profil',
    title: 'Compléter mon profil',
    text: 'Vérifiez votre nom : il figure sur vos démarches et vos échanges avec la mairie.',
  },
  {
    to: '/services',
    title: 'Trouver un service',
    text: 'Parcourez les services municipaux : horaires, contacts et démarches de chacun.',
  },
  {
    to: '/contact',
    title: 'Commencer une démarche',
    text: 'Envoyez une demande aux services : vous recevez un numéro de suivi.',
  },
];

/** Guide affiché à la première connexion, jusqu'à ce que l'habitant le termine ou le passe. */
export default function OnboardingGuide({ user, onDone }) {
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    try {
      onDone(await api('/me/onboarding', { method: 'POST' }));
    } catch {
      // Échec réseau : on masque quand même le guide pour cette session.
      onDone({ ...user, onboardedAt: new Date().toISOString() });
    }
  }

  return (
    <section
      aria-labelledby="guide-titre"
      className="mb-8 rounded-card border border-primary/30 bg-surface p-5 shadow-card sm:p-6"
    >
      <p className="text-sm font-semibold text-primary">Première connexion</p>
      <h2 id="guide-titre" className="mt-1 font-display text-2xl font-bold">
        Bienvenue à {APP_NAME}, {user.fullName?.split(' ')[0] ?? 'nouvel habitant'}
      </h2>
      <p className="mt-2 text-ink-muted">Trois étapes pour bien démarrer dans votre espace.</p>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.to}>
            <Link
              to={step.to}
              className="flex h-full flex-col rounded-card border border-ink-muted/30 p-4 hover:border-primary hover:bg-primary/5"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full bg-primary font-bold text-white"
              >
                {i + 1}
              </span>
              <span className="mt-3 font-bold text-ink">{step.title}</span>
              <span className="mt-1 text-sm text-ink-muted">{step.text}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={finish}
          disabled={busy}
          className="rounded-control bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
        >
          J’ai compris
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={busy}
          className="rounded-control px-3 py-2.5 font-semibold text-ink-muted underline-offset-4 hover:underline"
        >
          Passer le guide
        </button>
      </div>
    </section>
  );
}
