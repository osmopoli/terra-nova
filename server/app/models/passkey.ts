import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Clé d'accès (passkey) liée à un compte (D02). */
export default class Passkey extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column({ serializeAs: null })
  declare credentialId: string

  @column({ serializeAs: null })
  declare publicKey: string

  @column({ serializeAs: null })
  declare algorithm: number

  @column({ serializeAs: null, consume: (value) => Number(value) })
  declare signCount: number

  @column()
  declare name: string

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null
}
