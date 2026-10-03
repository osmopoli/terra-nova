import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Jeton intermédiaire à usage unique (étape « code », défi de clé d'accès). */
export default class AuthChallenge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare purpose: string

  @column()
  declare tokenHash: string

  @column()
  declare userId: number | null

  @column()
  declare attempts: number

  @column({ consume: (value) => Number(value) })
  declare expiresAt: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
