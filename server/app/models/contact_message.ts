import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { ContactService, ContactStatus } from '#constants/domain'

/** Lettres et chiffres sans ambiguïté à l'oral (pas de 0/O, 1/I). */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export default class ContactMessage extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column()
  declare trackingCode: string

  @column()
  declare subject: string

  @column()
  declare service: ContactService

  @column()
  declare message: string

  @column()
  declare status: ContactStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /** Numéro de suivi communiqué à l'habitant, ex. NT-7KQ4XM. */
  static generateTrackingCode() {
    let code = 'NT-'
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    return code
  }

  @beforeCreate()
  static assignTrackingCode(message: ContactMessage) {
    message.trackingCode ??= ContactMessage.generateTrackingCode()
  }
}
