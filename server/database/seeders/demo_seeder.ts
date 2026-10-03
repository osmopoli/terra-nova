import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'
import type { Role } from '#constants/domain'

/**
 * Comptes de démo pour le jury (à reporter dans la fiche du dashboard Webcup).
 * Un compte par rôle ; le mot de passe vient de DEMO_PASSWORD (jamais dans le code).
 * Rejouable : les comptes sont mis à jour par e-mail.
 */
export const DEMO_USERS: { fullName: string; email: string; role: Role }[] = [
  { fullName: 'Camille Citoyenne', email: 'citoyen@novaterra.test', role: 'citoyen' },
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
  }
}
