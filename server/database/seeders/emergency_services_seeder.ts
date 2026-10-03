import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service from '#models/service'
import { EMERGENCY_CATEGORY } from '#constants/domain'

/**
 * Hôpitaux et services d'urgence de Nova Terra (données de démo, F46).
 * Rangés dans l'annuaire D05 sous la thématique `urgence_sante`.
 * Rejouable : chaque service est mis à jour par son slug.
 */
export const EMERGENCY_SERVICES = [
  {
    slug: 'centre-hospitalier',
    name: 'Centre hospitalier de Nova Terra',
    summary: 'Urgences adultes, maternité, imagerie et consultations spécialisées.',
    description:
      "L'hôpital de la ville accueille toutes les urgences adultes, 24 h/24. En cas de détresse vitale, appelez d'abord le 15 : le SAMU oriente et envoie les secours. Pour une consultation programmée, passez par le standard.",
    hours: 'Urgences : 24 h/24, 7 j/7',
    phone: '02 69 61 15 00',
    email: 'accueil@ch-novaterra.test',
    address: '2 avenue de l’Horizon, Nova Terra',
    procedures: [
      {
        title: 'Se présenter aux urgences',
        detail: "Apportez une pièce d'identité, votre carte Vitale et la liste de vos traitements.",
      },
    ],
  },
  {
    slug: 'urgences-pediatriques',
    name: 'Urgences pédiatriques',
    summary: 'Pôle mère-enfant : enfants de moins de 15 ans et femmes enceintes.',
    description:
      'Le pôle mère-enfant reçoit les enfants et les adolescents de moins de 15 ans, ainsi que les femmes enceintes, jour et nuit. Un pédiatre est présent en permanence.',
    hours: 'Urgences : 24 h/24, 7 j/7',
    phone: '02 69 61 15 20',
    email: 'mere-enfant@ch-novaterra.test',
    address: '4 avenue de l’Horizon, Nova Terra',
    procedures: [
      {
        title: 'Venir avec votre enfant',
        detail: 'Apportez son carnet de santé et la carte Vitale du parent.',
      },
    ],
  },
  {
    slug: 'maison-medicale-garde',
    name: 'Maison médicale de garde du Lagon',
    summary: 'Médecins de garde quand votre médecin traitant est fermé.',
    description:
      "Pour un problème de santé qui ne peut pas attendre mais ne met pas la vie en danger : fièvre, petite blessure, douleur. Appelez avant de vous déplacer pour réduire l'attente.",
    hours: '20 h – minuit · week-end et fériés 8 h – minuit',
    phone: '02 69 61 15 40',
    email: null,
    address: 'Place du Marché, Le Lagon, Nova Terra',
    procedures: [
      {
        title: 'Consulter un médecin de garde',
        detail: 'Sans rendez-vous, sur appel préalable au standard.',
      },
    ],
  },
]

export default class extends BaseSeeder {
  async run() {
    for (const { slug, ...attrs } of EMERGENCY_SERVICES) {
      await Service.updateOrCreate({ slug }, { ...attrs, category: EMERGENCY_CATEGORY })
    }
  }
}
