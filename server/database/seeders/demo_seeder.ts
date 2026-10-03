import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Alert from '#models/alert'
import User from '#models/user'
import Demande from '#models/demande'
import env from '#start/env'
import type { DemandeStatus, District, Role, Service } from '#constants/domain'

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

/** Historique de démo du compte citoyen (étapes successives, jours écoulés depuis l'envoi). */
const DEMO_DEMANDES: {
  subject: string
  service: Service
  message: string
  daysAgo: number
  steps: DemandeStatus[]
}[] = [
  {
    subject: 'Lampadaire en panne rue des Lilas',
    service: 'voirie',
    message: 'Le lampadaire devant le n° 12 de la rue des Lilas ne s’allume plus le soir.',
    daysAgo: 12,
    steps: ['nouveau', 'en_cours', 'traite'],
  },
  {
    subject: 'Copie intégrale d’acte de naissance',
    service: 'etat_civil',
    message: 'Je souhaite obtenir une copie intégrale de mon acte de naissance pour un dossier.',
    daysAgo: 5,
    steps: ['nouveau', 'en_cours'],
  },
  {
    subject: 'Inscription à la cantine scolaire',
    service: 'education',
    message: 'Comment inscrire mon fils à la cantine de l’école des Tilleuls pour la rentrée ?',
    daysAgo: 1,
    steps: ['nouveau'],
  },
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

    // Rejouable : l'historique n'est créé que si le citoyen de démo n'a aucune demande.
    const citoyen = await User.findByOrFail('email', DEMO_USERS[0].email)
    if (await Demande.forUser(citoyen.id).first()) return
    for (const { daysAgo, steps, ...attrs } of DEMO_DEMANDES) {
      const sentAt = DateTime.now().minus({ days: daysAgo })
      const demande = await Demande.submit(citoyen.id, attrs)
      demande.createdAt = sentAt
      demande.status = steps[steps.length - 1]
      await demande.save()
      await demande.related('steps').query().update({ created_at: sentAt.toJSDate() })
      for (const [index, status] of steps.slice(1).entries()) {
        await demande
          .related('steps')
          .create({ status, createdAt: sentAt.plus({ days: index + 1 }) })
      }
    }
  }
}
