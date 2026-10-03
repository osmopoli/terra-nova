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
}[] = [
  {
    fullName: 'Camille Citoyenne',
    email: 'citoyen@novaterra.test',
    role: 'citoyen',
    district: 'sud',
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
