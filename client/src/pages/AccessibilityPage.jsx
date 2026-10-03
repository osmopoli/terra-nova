import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';

// Aménagements réellement en place, regroupés par besoin. Mettre à jour à chaque évolution.
const SECTIONS = [
  {
    id: 'contraste',
    title: 'Contrastes et couleurs',
    items: [
      'Tous les textes respectent un contraste d’au moins 4,5:1 avec leur fond (niveau AA), 3:1 pour les bordures de champs et de boutons.',
      'Le bouton « Contraste élevé » en haut de chaque page assombrit les textes et marque les bordures. Il s’active seul si votre appareil demande plus de contraste, et votre choix est mémorisé.',
      'Une information n’est jamais portée par la seule couleur : les liens du contenu sont soulignés, un champ en erreur a une bordure épaissie et un message écrit.',
      'L’entrée de menu de la page en cours est soulignée en plus d’être colorée.',
    ],
  },
  {
    id: 'texte',
    title: 'Taille du texte',
    items: [
      'Les boutons A, A+ et A++ en haut de chaque page agrandissent tout le texte à 125 % ou 150 %. Votre choix est mémorisé sur cet appareil.',
      'Le zoom du navigateur fonctionne jusqu’à 200 % sans perte de contenu ni défilement horizontal, dès 360 px de large.',
    ],
  },
  {
    id: 'leger',
    title: 'Version légère',
    items: [
      'Le bouton « Version légère » en haut de chaque page affiche moins d’images et d’animations : les pages s’ouvrent plus vite sur une connexion lente ou un téléphone ancien.',
      'Toutes les informations et actions restent disponibles. L’annuaire des services, les fiches de service et l’accueil passent en listes simples : horaires, contact et démarches d’abord.',
      'Elle s’active seule si votre appareil signale une connexion très lente ou le mode économie de données, avec un message pour revenir à la version complète. Votre choix est mémorisé.',
    ],
  },
  {
    id: 'clavier',
    title: 'Navigation au clavier',
    items: [
      'Tout se fait au clavier : Tab pour avancer, Maj + Tab pour reculer, Entrée pour activer un lien ou envoyer un formulaire, Espace pour un bouton.',
      'Le lien « Aller au contenu », premier élément de la page, évite de parcourir le menu à chaque fois.',
      'L’élément actif est toujours entouré d’un contour épais et visible.',
    ],
  },
  {
    id: 'lecteur',
    title: 'Lecteur d’écran',
    items: [
      'Chaque page a un titre d’onglet propre, un titre principal et des zones nommées (en-tête, navigation, contenu, fil d’Ariane).',
      'Au changement de page, le titre de la nouvelle page est annoncé et le focus y est placé.',
      'Chaque champ a un libellé ; l’aide et les erreurs lui sont reliées et lues avec lui.',
      'L’envoi d’une demande est confirmé à voix haute, avec son numéro de suivi.',
      'Les images décoratives sont ignorées ; les visuels utiles ont une description.',
    ],
  },
  {
    id: 'mouvement',
    title: 'Animations',
    items: [
      'Si votre appareil demande de réduire les animations, la plateforme les désactive.',
    ],
  },
];

const PARCOURS = ['Inscription', 'Connexion', 'Envoi d’une demande aux services', 'Suivi de mes demandes'];

/** Déclaration d'accessibilité : aménagements disponibles, parcours vérifiés, contact. */
export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Accessibilité</h1>
      <p className="mt-3 text-lg text-ink-muted">
        {APP_NAME} est conçue pour tous les habitants. Il n’existe pas de version à part : les mêmes
        pages s’adaptent à votre façon de naviguer.
      </p>

      <nav aria-label="Sommaire de la page" className="mt-6 rounded-card bg-surface p-5 shadow-card">
        <h2 className="font-semibold text-ink">Aménagements disponibles</h2>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {SECTIONS.map((s) => (
        <section key={s.id} aria-labelledby={s.id} className="mt-8">
          <h2 id={s.id} className="font-display text-2xl font-bold text-ink">
            {s.title}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink marker:text-primary">
            {s.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="parcours" className="mt-8 rounded-card bg-mist p-5">
        <h2 id="parcours" className="font-display text-2xl font-bold text-ink">
          Parcours vérifiés
        </h2>
        <p className="mt-2 text-ink">
          Vérifiés au clavier seul et avec l’outil d’audit axe, sur mobile et ordinateur :
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink marker:text-primary">
          {PARCOURS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-muted">
          État : partiellement conforme au RGAA / WCAG 2.1 niveau AA. Mise à jour le 3 octobre 2026.
        </p>
      </section>

      <section aria-labelledby="signaler" className="mt-8">
        <h2 id="signaler" className="font-display text-2xl font-bold text-ink">
          Une difficulté ?
        </h2>
        <p className="mt-2 text-ink">
          Si un contenu ou un service vous reste inaccessible, dites-le nous : nous vous apportons
          l’information par un autre moyen et corrigeons la page.
        </p>
        <Link
          to="/contact"
          className="mt-4 inline-block rounded-control bg-primary px-5 py-3 font-semibold text-on-primary hover:bg-primary-strong"
        >
          Signaler un problème d’accessibilité
        </Link>
      </section>
    </article>
  );
}
