import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { AuditAction, AuditObjectType, Role } from '#constants/domain'

/** Entrée du journal d'audit : créée par AuditService uniquement, jamais modifiée. */
export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare actorId: number | null

  @column()
  declare actorName: string | null

  @column()
  declare actorRole: Role | null

  @column()
  declare action: AuditAction

  @column()
  declare objectType: AuditObjectType

  @column()
  declare objectId: string | null

  @column()
  declare beforeSummary: string | null

  @column()
  declare afterSummary: string | null

  @column()
  declare ip: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
