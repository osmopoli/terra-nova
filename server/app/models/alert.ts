import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import { ALERT_LEVEL_VALUES, type AlertLevel, type District } from '#constants/domain'

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

  /** Quartiers ciblés ; null = toute la ville. */
  @column({
    prepare: (value: District[] | null) => (value?.length ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? (JSON.parse(value) as District[]) : null),
  })
  declare districts: District[] | null

  /** Consignes : ce que les personnes concernées doivent faire. */
  @column()
  declare instructions: string | null

  /** Recommandations adaptées aux personnes vulnérables (F31). */
  @column()
  declare vulnerableAdvice: string | null

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

  /** Alerte ciblant explicitement ce quartier (une alerte sans ciblage n'en cible aucun). */
  targets(district: District | null | undefined) {
    return Boolean(district && this.districts?.includes(district))
  }

  /** L'alerte concerne-t-elle un habitant de ce quartier ? (sans ciblage : tout le monde) */
  concerns(district: District | null | undefined) {
    return !this.districts?.length || this.targets(district)
  }

  /**
   * Tri d'affichage : d'abord les alertes ciblant le quartier de l'habitant,
   * puis la plus critique, puis la plus récente.
   */
  static sortForDisplay(alerts: Alert[], district?: District | null) {
    return alerts.sort(
      (a, b) =>
        Number(b.targets(district)) - Number(a.targets(district)) ||
        ALERT_LEVEL_VALUES.indexOf(b.level) - ALERT_LEVEL_VALUES.indexOf(a.level) ||
        b.startsAt.toMillis() - a.startsAt.toMillis()
    )
  }
}
