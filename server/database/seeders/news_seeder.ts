import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import NewsPost from '#models/news_post'
import User from '#models/user'
import type { NewsCategory } from '#constants/domain'

/**
 * Actualités de démo de Nova Terra (dates relatives au jour du seed).
 * Rejouable : les actualités sont mises à jour par titre. Auteur : le premier admin s'il existe.
 */
export const DEMO_NEWS: {
  title: string
  summary: string
  body: string
  category: NewsCategory
  daysAgo: number
}[] = [
  {
    title: 'Ouverture de la nouvelle médiathèque du quartier Horizon',
    summary:
      'La médiathèque Horizon ouvre ses portes samedi : 12 000 ouvrages, un espace numérique et des ateliers pour tous les âges.',
    body: "La ville de Nova Terra inaugure samedi à 10 h la médiathèque du quartier Horizon.\n\nAu programme : visite libre, inscription gratuite pour les habitants sur présentation d'un justificatif de domicile, atelier de découverte de l'espace numérique et lecture de contes à 15 h.\n\nLa médiathèque sera ensuite ouverte du mardi au samedi, de 9 h à 18 h.",
    category: 'annonce',
    daysAgo: 0,
  },
  {
    title: "Nouveaux horaires de l'accueil de la mairie",
    summary:
      "À partir du 1er novembre, l'accueil de la mairie centrale ouvre en continu de 8 h à 17 h, et le samedi matin de 9 h à 12 h.",
    body: "Pour mieux répondre aux besoins des habitants, l'accueil de la mairie centrale adopte des horaires élargis à partir du 1er novembre.\n\nDu lundi au vendredi : 8 h - 17 h sans interruption.\nLe samedi : 9 h - 12 h (état civil et retrait de documents uniquement).\n\nLes démarches en ligne restent disponibles 24 h/24 sur la plateforme.",
    category: 'changement_service',
    daysAgo: 1,
  },
  {
    title: 'Collecte des encombrants : le calendrier par secteur',
    summary:
      'La collecte des encombrants passe à un passage mensuel par secteur. Consultez votre jour de collecte et les objets acceptés.',
    body: "La collecte des encombrants est désormais organisée une fois par mois dans chaque secteur.\n\nSecteur Nord : premier lundi du mois.\nSecteur Centre : deuxième lundi du mois.\nSecteur Sud : troisième lundi du mois.\n\nSortez vos objets la veille au soir, sans gêner le passage des piétons. Les déchets électriques, les pneus et les produits dangereux ne sont pas acceptés : déposez-les à la déchetterie de la zone d'activités.",
    category: 'info_pratique',
    daysAgo: 3,
  },
  {
    title: 'Travaux sur le boulevard des Alizés',
    summary:
      'Des travaux de réfection de la chaussée auront lieu du 14 au 25 octobre. Une déviation est mise en place par la rue des Palmiers.',
    body: "Les services techniques de la ville refont la chaussée du boulevard des Alizés entre le rond-point du Port et la place du Marché.\n\nDu 14 au 25 octobre, la circulation sera interdite de 7 h à 19 h sur ce tronçon. Une déviation est fléchée par la rue des Palmiers. Les lignes de bus 2 et 5 sont déviées et les arrêts provisoires sont signalés sur place.\n\nL'accès aux commerces reste garanti pour les piétons.",
    category: 'annonce',
    daysAgo: 5,
  },
  {
    title: 'Le service État civil passe sur rendez-vous',
    summary:
      "Les demandes de carte d'identité et de passeport se font désormais uniquement sur rendez-vous, réservable en ligne.",
    body: "Pour réduire l'attente au guichet, les demandes et retraits de carte nationale d'identité et de passeport se font uniquement sur rendez-vous.\n\nRéservez votre créneau depuis la plateforme ou par téléphone à l'accueil de la mairie. Pensez à préparer votre pré-demande en ligne et vos justificatifs avant le rendez-vous.\n\nLes autres démarches d'état civil (actes de naissance, de mariage) restent accessibles sans rendez-vous.",
    category: 'changement_service',
    daysAgo: 8,
  },
  {
    title: 'Alerte canicule : les lieux frais ouverts au public',
    summary:
      'En cas de forte chaleur, plusieurs bâtiments municipaux climatisés accueillent librement les habitants. Retrouvez la liste.',
    body: "Lors des épisodes de forte chaleur, la ville ouvre des lieux frais accessibles à tous, gratuitement :\n\n- la médiathèque Horizon ;\n- la salle polyvalente du Centre ;\n- le hall de la mairie annexe Sud.\n\nBuvez régulièrement, évitez les efforts aux heures chaudes et prenez des nouvelles de vos voisins âgés ou isolés. Les personnes vulnérables peuvent s'inscrire au registre municipal pour être contactées pendant les alertes.",
    category: 'info_pratique',
    daysAgo: 12,
  },
]

export default class extends BaseSeeder {
  async run() {
    const admin = await User.query().where('role', 'admin').orderBy('id').first()
    const now = DateTime.now().startOf('minute')

    // F30 : annonces importantes de démo (les habitants connectés en sont prévenus).
    const important = new Set([
      'Travaux sur le boulevard des Alizés',
      "Nouveaux horaires de l'accueil de la mairie",
    ])

    for (const { title, daysAgo, ...attrs } of DEMO_NEWS) {
      await NewsPost.updateOrCreate(
        { title },
        {
          ...attrs,
          important: important.has(title),
          publishedAt: now.minus({ days: daysAgo, hours: daysAgo ? 2 : 0 }),
          authorId: admin?.id ?? null,
        }
      )
    }
  }
}
