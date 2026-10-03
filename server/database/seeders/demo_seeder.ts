import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

/**
 * Comptes de démo pour le jury (à reporter dans la fiche du dashboard Webcup).
 * Rejouable : les comptes sont mis à jour par e-mail.
 * Ajouter ici les données métier de démo une fois le sujet connu.
 */
export const DEMO_PASSWORD = 'Webcup2026!'

export const DEMO_USERS = [
  { fullName: 'Compte Démo', email: 'demo@webcup.test' },
  { fullName: 'Jury Webcup', email: 'jury@webcup.test' },
]

export default class extends BaseSeeder {
  async run() {
    for (const attrs of DEMO_USERS) {
      await User.updateOrCreate(
        { email: attrs.email },
        { fullName: attrs.fullName, password: DEMO_PASSWORD }
      )
    }
  }
}
