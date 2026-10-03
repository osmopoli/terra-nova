import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

const CONCERN_PATH = '/contact?service=donnees_personnelles';

// Contenu de la page, en langage simple : une question par bloc, réponse courte.
const SECTIONS = [
  {
    id: 'quelles-donnees',
    title: 'Ce que nous enregistrons',
    items: [
      'Votre nom, votre adresse e-mail et votre mot de passe (chiffré : personne ne peut le lire).',
      'Votre profil : habitant, agent municipal ou administrateur.',
      'Les messages que vous envoyez aux services, avec leur numéro de suivi et leur statut.',
      'Sur votre appareil seulement : votre connexion et la taille de texte choisie.',
    ],
  },
  {
    id: 'pourquoi',
    title: 'Pourquoi',
    items: [
      'Vous connecter à votre espace.',
      'Transmettre vos messages au bon service et vous répondre.',
      'Vous montrer où en est chaque demande.',
      'Rien d’autre : pas de publicité, pas de revente, pas de pistage.',
    ],
  },
  {
    id: 'qui',
    title: 'Qui peut les voir',
    items: [
      'Vous, dans « Mon profil ».',
      'Les agents municipaux, pour traiter vos messages : ils voient votre nom, jamais votre mot de passe.',
      'Les administrateurs de la plateforme, pour gérer les comptes.',
      'Aucune entreprise ni organisme extérieur à la ville.',
    ],
  },
  {
    id: 'combien-de-temps',
    title: 'Combien de temps',
    items: [
      'Tant que votre compte existe.',
      'Votre connexion expire au bout de 30 jours : il faut alors vous reconnecter.',
      'Si votre compte est supprimé, vos messages le sont aussi, définitivement.',
    ],
  },
  {
    id: 'supprimer',
    title: 'Supprimer votre compte',
    items: [
      'Écrivez-nous dans la catégorie « Données personnelles » en demandant la suppression.',
      'Un agent vous répond dans votre espace, puis votre compte et vos messages sont effacés.',
    ],
  },
];

/** F51 : page publique « Vos données », en langage simple, avec un accès au formulaire d'inquiétude. */
export default function DataPage({ user }) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-primary">Transparence</p>
      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Vos données</h1>
      <p className="mt-3 text-lg text-ink-muted">
        {APP_NAME} garde le moins d’informations possible sur vous. Voici, en clair, ce qui est enregistré,
        pourquoi, et ce que vous pouvez faire.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            aria-labelledby={section.id}
            className="rounded-card bg-surface p-5 shadow-card sm:p-6"
          >
            <h2 id={section.id} className="font-display text-lg font-bold text-ink">
              {section.title}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section
        aria-labelledby="inquietude"
        className="mt-8 rounded-card border-2 border-primary bg-surface p-5 shadow-card sm:p-8"
      >
        <h2 id="inquietude" className="font-display text-xl font-bold text-ink">
          Une question, une inquiétude ?
        </h2>
        <p className="mt-2 leading-relaxed text-ink-muted">
          Faites-la remonter à la mairie. Vous recevez un numéro de suivi, et la réponse d’un agent apparaît
          dans votre espace « Mon profil », avec le statut de votre demande : nouveau, en cours, traité.
        </p>
        <Link
          to={CONCERN_PATH}
          className="mt-5 inline-block rounded-control bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
        >
          {user ? 'Faire remonter une inquiétude' : 'Se connecter pour écrire à la mairie'}
        </Link>
      </section>
    </article>
  );
}
