import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { CONTACT_STATUSES, CONTACT_STATUS_ACTIONS, type ContactStatus } from '#constants/domain'

/** Notification de changement d'état d'une demande, destinée à son seul auteur. */
export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column()
  declare trackingCode: string

  @column()
  declare subject: string

  @column()
  declare status: ContactStatus

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  get statusLabel() {
    return CONTACT_STATUSES[this.status] ?? this.status
  }

  get action() {
    return CONTACT_STATUS_ACTIONS[this.status] ?? ''
  }
}
