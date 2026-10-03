import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Appareil (navigateur + système + réseau tronqué) déjà vu pour un compte. */
export default class LoginDevice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  @column({ serializeAs: null })
  declare fingerprint: string

  @column()
  declare browser: string

  @column()
  declare os: string

  @column()
  declare ipHint: string

  @column.dateTime()
  declare firstSeenAt: DateTime

  @column.dateTime()
  declare lastSeenAt: DateTime
}
