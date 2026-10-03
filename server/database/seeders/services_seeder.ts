import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service, { type ServiceProcedure } from '#models/service'
import type { ServiceCategory } from '#constants/domain'
import { SERVICE_TRANSLATIONS } from '#constants/services_translations'

type ServiceSeed = {
  slug: string
  name: string
  category: ServiceCategory
  summary: string
  description: string
  hours: string
  phone: string | null
  email: string | null
  address: string | null
  procedures: ServiceProcedure[]
}

/**
 * Annuaire des services municipaux de Terra Nova (données de démo, D05).
 * Rejouable : chaque service est mis à jour par son slug.
 */
export const DEMO_SERVICES: ServiceSeed[] = [
  {
    slug: 'etat-civil',
    name: 'État civil et citoyenneté',
    category: 'demarches',
    summary:
      "Actes de naissance, mariage, décès, papiers d'identité et inscription sur les listes électorales.",
    description:
      "Le service État civil enregistre les naissances, mariages, PACS et décès survenus à Terra Nova et délivre les copies d'actes. Il instruit aussi les demandes de carte d'identité et de passeport, et tient les listes électorales de la ville.",
    hours: 'Lundi au vendredi : 8 h – 16 h\nSamedi : 8 h – 12 h (sur rendez-vous)',
    phone: '02 69 61 10 01',
    email: 'etat-civil@novaterra.test',
    address: 'Hôtel de ville, 1 place de la Fondation, Terra Nova',
    procedures: [
      {
        title: "Demander un acte d'état civil",
        detail:
          "Indiquez le type d'acte, la date de l'événement et les noms concernés. Envoi gratuit sous 5 jours.",
      },
      {
        title: "Carte d'identité ou passeport",
        detail:
          'Faites une pré-demande en ligne, puis prenez rendez-vous pour le dépôt du dossier et la prise d’empreintes.',
      },
      {
        title: "S'inscrire sur les listes électorales",
        detail:
          "Munissez-vous d'une pièce d'identité et d'un justificatif de domicile de moins de 3 mois.",
      },
    ],
  },
  {
    slug: 'enfance-education',
    name: 'Enfance et écoles',
    category: 'famille',
    summary: 'Inscriptions scolaires, cantine, accueil périscolaire et centres de loisirs.',
    description:
      'Le guichet Enfance accompagne les familles de la petite section au CM2 : inscription dans les écoles publiques de la ville, restauration scolaire, garderie du matin et du soir, et accueil de loisirs pendant les vacances.',
    hours: 'Lundi, mardi, jeudi : 8 h – 15 h 30\nMercredi : 8 h – 12 h\nVendredi : 8 h – 12 h',
    phone: '02 69 61 10 20',
    email: 'enfance@novaterra.test',
    address: 'Maison des familles, 12 rue des Alizés, Terra Nova',
    procedures: [
      {
        title: 'Inscrire son enfant à l’école',
        detail:
          'Livret de famille, justificatif de domicile et carnet de vaccination. Inscriptions de mars à mai.',
      },
      {
        title: 'Inscription à la cantine',
        detail: 'Le tarif dépend du quotient familial : joignez votre dernière attestation CAF.',
      },
      {
        title: 'Réserver le centre de loisirs',
        detail: 'Réservation au plus tard 10 jours avant chaque période de vacances.',
      },
    ],
  },
  {
    slug: 'ccas',
    name: "Centre communal d'action sociale (CCAS)",
    category: 'solidarite',
    summary: 'Aides sociales, accompagnement des personnes âgées et des familles en difficulté.',
    description:
      "Le CCAS informe et accompagne les habitants qui traversent une période difficile : aides financières ponctuelles, domiciliation, portage de repas, registre des personnes vulnérables activé en cas de canicule ou d'alerte météo.",
    hours: 'Lundi au vendredi : 7 h 30 – 15 h\nPermanence sans rendez-vous le mardi matin',
    phone: '02 69 61 10 30',
    email: 'ccas@novaterra.test',
    address: '4 allée des Fougères, Terra Nova',
    procedures: [
      {
        title: 'Demander une aide ponctuelle',
        detail:
          'Prenez rendez-vous avec un travailleur social ; apportez vos justificatifs de ressources.',
      },
      {
        title: "S'inscrire au registre des personnes vulnérables",
        detail:
          "Pour les personnes âgées, isolées ou handicapées : la ville vous appelle en cas d'alerte.",
      },
      {
        title: 'Demander une domiciliation',
        detail: 'Pour recevoir votre courrier si vous n’avez pas d’adresse stable.',
      },
    ],
  },
  {
    slug: 'proprete-dechets',
    name: 'Propreté et déchets',
    category: 'cadre_de_vie',
    summary: 'Collecte des ordures, encombrants, déchetterie et propreté des rues.',
    description:
      "Le service Propreté organise la collecte des ordures ménagères et du tri, l'enlèvement des encombrants sur rendez-vous et l'entretien des voies publiques. Il gère aussi la déchetterie municipale de la zone des Brisants.",
    hours: 'Accueil : lundi au vendredi, 7 h – 14 h\nDéchetterie : mardi au samedi, 7 h – 17 h',
    phone: '02 69 61 10 40',
    email: 'proprete@novaterra.test',
    address: 'Centre technique municipal, zone des Brisants, Terra Nova',
    procedures: [
      {
        title: 'Faire enlever un encombrant',
        detail: 'Enlèvement gratuit sur rendez-vous, dans la limite de 2 m³ par foyer et par mois.',
      },
      {
        title: 'Obtenir un bac de tri',
        detail: 'Retrait au centre technique sur présentation d’un justificatif de domicile.',
      },
      {
        title: 'Signaler un dépôt sauvage',
        detail: 'Précisez le lieu exact et, si possible, joignez une photo.',
      },
    ],
  },
  {
    slug: 'urbanisme',
    name: 'Urbanisme et habitat',
    category: 'urbanisme',
    summary: 'Permis de construire, déclarations de travaux et conseils pour votre logement.',
    description:
      "Le service Urbanisme instruit les autorisations de construire et de modifier un bâtiment, conformément au plan local d'urbanisme de Terra Nova. Un architecte-conseil reçoit gratuitement les habitants pour les aider à préparer leur projet.",
    hours: 'Lundi au jeudi : 8 h – 12 h, sur rendez-vous l’après-midi',
    phone: '02 69 61 10 50',
    email: 'urbanisme@novaterra.test',
    address: 'Hôtel de ville, 1 place de la Fondation, Terra Nova',
    procedures: [
      {
        title: 'Déposer une déclaration préalable de travaux',
        detail:
          'Pour une clôture, un abri de jardin ou un changement de façade. Réponse sous 1 mois.',
      },
      {
        title: 'Déposer un permis de construire',
        detail: 'Pour toute construction de plus de 20 m². Délai d’instruction : 2 à 3 mois.',
      },
      {
        title: 'Rencontrer l’architecte-conseil',
        detail: 'Rendez-vous gratuit le jeudi après-midi, avant le dépôt de votre dossier.',
      },
    ],
  },
  {
    slug: 'mediatheque',
    name: 'Médiathèque Étoile du Sud',
    category: 'culture_sport',
    summary: 'Prêt de livres et de jeux, espace numérique et ateliers pour tous les âges.',
    description:
      'La médiathèque Étoile du Sud prête livres, BD, films et jeux de société. Son espace numérique offre un accès gratuit aux ordinateurs et un accompagnement aux démarches en ligne. Ateliers lecture, contes et initiation numérique chaque semaine.',
    hours: 'Mardi, jeudi, vendredi : 9 h – 17 h\nMercredi et samedi : 9 h – 18 h\nFermée le lundi',
    phone: '02 69 61 10 60',
    email: 'mediatheque@novaterra.test',
    address: '20 boulevard des Navigateurs, Terra Nova',
    procedures: [
      {
        title: "S'inscrire à la médiathèque",
        detail: "Gratuit pour les habitants : pièce d'identité et justificatif de domicile.",
      },
      {
        title: 'Réserver un ordinateur',
        detail: 'Créneaux d’une heure, avec un médiateur numérique si besoin.',
      },
    ],
  },
  {
    slug: 'sports',
    name: 'Sports et équipements',
    category: 'culture_sport',
    summary: 'Piscine, gymnases, terrains et inscriptions aux activités sportives municipales.',
    description:
      "Le service des Sports gère la piscine municipale, les gymnases et les plateaux sportifs de quartier. Il met les équipements à disposition des associations et propose l'école municipale des sports pour les 6-12 ans.",
    hours: 'Lundi au vendredi : 8 h – 16 h\nPiscine : tous les jours, 6 h 30 – 19 h',
    phone: '02 69 61 10 70',
    email: 'sports@novaterra.test',
    address: 'Complexe sportif du Lagon, route du Littoral, Terra Nova',
    procedures: [
      {
        title: "Inscrire son enfant à l'école des sports",
        detail: 'Certificat médical de moins de 3 ans et attestation d’assurance.',
      },
      {
        title: 'Réserver un équipement (associations)',
        detail: 'Demande au moins 15 jours avant la date souhaitée.',
      },
    ],
  },
  {
    slug: 'police-municipale',
    name: 'Police municipale et tranquillité publique',
    category: 'cadre_de_vie',
    summary:
      'Sécurité de proximité, objets trouvés, stationnement et opération tranquillité vacances.',
    description:
      "La police municipale veille à la tranquillité des quartiers, au respect du stationnement et à la sécurité aux abords des écoles. Elle gère aussi les objets trouvés. En cas d'urgence, composez le 17.",
    hours: 'Accueil : lundi au samedi, 7 h – 19 h\nPatrouilles 7 jours sur 7',
    phone: '02 69 61 10 80',
    email: 'police-municipale@novaterra.test',
    address: '3 rue du Port, Terra Nova',
    procedures: [
      {
        title: 'Opération tranquillité vacances',
        detail:
          'Inscrivez votre logement au moins 48 h avant votre départ : des patrouilles passent pendant votre absence.',
      },
      {
        title: 'Récupérer un objet trouvé',
        detail:
          'Décrivez l’objet et présentez une pièce d’identité. Les objets sont conservés 1 an.',
      },
    ],
  },
]

export default class extends BaseSeeder {
  async run() {
    for (const { slug, ...attrs } of DEMO_SERVICES) {
      await Service.updateOrCreate(
        { slug },
        { ...attrs, translations: SERVICE_TRANSLATIONS[slug] ?? {} }
      )
    }
  }
}
