import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import { ALERT_LEVEL_VALUES, type AlertLevel } from '#constants/domain'

/** Message général diffusé en bannière à tous les habitants pendant sa période de validité. */
export default class Alert extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare level: AlertLevel

  @column.dateTime()
  declare startsAt: DateTime

  @column.dateTime()
  declare endsAt: DateTime

  @column({ serializeAs: null })
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /** Alertes à afficher maintenant : début passé, fin non atteinte. */
  static active = scope((query) => {
    const now = new Date()
    query.where('starts_at', '<=', now).where('ends_at', '>', now)
  })

  /** Tri d'affichage : la plus critique d'abord, puis la plus récente. */
  static sortForDisplay(alerts: Alert[]) {
    return alerts.sort(
      (a, b) =>
        ALERT_LEVEL_VALUES.indexOf(b.level) - ALERT_LEVEL_VALUES.indexOf(a.level) ||
        b.startsAt.toMillis() - a.startsAt.toMillis()
    )
  }
}
