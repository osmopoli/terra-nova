import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Alert from '#models/alert'
import User from '#models/user'
import env from '#start/env'
import type { District, Role } from '#constants/domain'

/**
 * Comptes de démo pour le jury (à reporter dans la fiche du dashboard Webcup).
 * Un compte par rôle ; le mot de passe vient de DEMO_PASSWORD (jamais dans le code).
 * Rejouable : les comptes sont mis à jour par e-mail.
 */
export const DEMO_USERS: {
  fullName: string
  email: string
  role: Role
  district?: District
  vulnerable?: boolean
}[] = [
  {
    fullName: 'Camille Citoyenne',
    email: 'citoyen@novaterra.test',
    role: 'citoyen',
    district: 'sud',
    vulnerable: true,
  },
  { fullName: 'Mathis Agent', email: 'agent@novaterra.test', role: 'agent' },
  { fullName: 'Sarah Admin', email: 'admin@novaterra.test', role: 'admin' },
]

export default class extends BaseSeeder {
  async run() {
    const password = env.get('DEMO_PASSWORD')
    if (!password || password.length < 8) {
      throw new Error(
        'DEMO_PASSWORD manquant ou trop court (8 caractères minimum) : renseignez-le dans .env.'
      )
    }

    for (const { email, ...attrs } of DEMO_USERS) {
      await User.updateOrCreate({ email }, { ...attrs, password })
    }

    // F31 : canicule sur plusieurs secteurs, avec recommandations pour les personnes vulnérables.
    await Alert.updateOrCreate(
      { title: 'Vague de chaleur extrême' },
      {
        message:
          'L’Agence sanitaire de Nova Terra annonce des températures exceptionnellement élevées dans le centre-ville et le quartier est, de jour comme de nuit.',
        instructions:
          'Buvez de l’eau régulièrement sans attendre d’avoir soif. Restez au frais aux heures chaudes (11 h à 18 h). Fermez volets et fenêtres le jour, aérez la nuit. Prenez des nouvelles de vos proches isolés.',
        vulnerableAdvice:
          'Personnes âgées, enceintes, malades chroniques ou nourrissons : ne sortez pas aux heures chaudes, passez au moins 3 heures par jour dans un lieu frais (salles climatisées de la mairie ouvertes de 10 h à 19 h), ne modifiez pas votre traitement sans avis médical. Signes d’alerte (fièvre, confusion, maux de tête) : appelez le 15.',
        level: 'urgent',
        districts: ['centre', 'est'],
        startsAt: DateTime.now(),
        endsAt: DateTime.now().plus({ days: 3 }),
      }
    )

    // F29 : alerte de démonstration ciblée sur le quartier sud (rejouable : mise à jour par titre).
    await Alert.updateOrCreate(
      { title: 'Montée des eaux dans le quartier sud' },
      {
        message:
          'Le niveau de l’eau monte anormalement près des berges du quartier sud. La situation est surveillée en continu par le Centre de surveillance environnementale.',
        instructions:
          'Éloignez-vous des berges et des passages souterrains. Montez les objets de valeur en hauteur. N’utilisez pas votre véhicule dans les rues inondées. En cas de danger immédiat, appelez le 112.',
        level: 'urgent',
        districts: ['sud'],
        startsAt: DateTime.now(),
        endsAt: DateTime.now().plus({ days: 2 }),
      }
    )
  }
}
