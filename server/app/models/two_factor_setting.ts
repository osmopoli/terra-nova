import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Réglage de vérification en deux étapes d'un compte (F53). Jamais sérialisé vers le front. */
export default class TwoFactorSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  /** Secret base32 chiffré (service encryption, APP_KEY). */
  @column({ serializeAs: null })
  declare secret: string

  @column.dateTime()
  declare enabledAt: DateTime | null

  @column({ consume: (value) => Number(value) })
  declare lastStep: number

  /** Empreintes sha256 (hex) des codes de secours encore utilisables. */
  @column({
    serializeAs: null,
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare recoveryCodes: string[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
