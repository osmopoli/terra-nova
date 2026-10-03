import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { LoginOutcome, LoginBlockScope } from '#constants/domain'

/** Une tentative de connexion (réussie, échouée ou bloquée). */
export default class LoginAttempt extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare email: string

  @column()
  declare ip: string

  @column()
  declare outcome: LoginOutcome

  /** Pour une tentative bloquée : verrou du compte ou de l'adresse IP. */
  @column()
  declare reason: LoginBlockScope | null

  /** Millisecondes depuis l'epoch. */
  @column({ consume: (value) => Number(value) })
  declare attemptedAt: number
}
