import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { DemandeStatus } from '#constants/domain'

export default class DemandeStep extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare demandeId: number

  @column()
  declare status: DemandeStatus

  /** Réponse de l'agent jointe au changement d'état (F22), visible par l'habitant. */
  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
