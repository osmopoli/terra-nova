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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
