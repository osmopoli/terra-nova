import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { CONTACT_STATUSES, CONTACT_STATUS_ACTIONS, type ContactStatus } from '#constants/domain'

/** Notification de changement d'état d'une demande, destinée à son seul auteur. */
export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  /** `statut` : changement d'état d'une demande ; `securite` : alerte de compte (WEBC-80). */
  @column()
  declare kind: 'statut' | 'securite'

  @column()
  declare trackingCode: string | null

  @column()
  declare subject: string | null

  @column()
  declare status: ContactStatus | null

  @column()
  declare title: string | null

  @column()
  declare message: string | null

  /** Chemin du front vers l'action à mener (ex. changer son mot de passe). */
  @column()
  declare actionPath: string | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  get statusLabel() {
    return this.status ? (CONTACT_STATUSES[this.status] ?? this.status) : ''
  }

  get action() {
    return this.status ? (CONTACT_STATUS_ACTIONS[this.status] ?? '') : ''
  }
}
