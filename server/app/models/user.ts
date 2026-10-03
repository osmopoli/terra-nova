import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { ROLE_VALUES, type Role } from '#constants/domain'

// Hasher par défaut de config/hash.ts (bcrypt).
const AuthFinder = withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: Role

  /** Guide de première connexion terminé ou passé (D12) ; null = à afficher. */
  @column.dateTime()
  declare onboardedAt: DateTime | null

  /** Compte désactivé par un agent (F34) : connexion refusée tant que non null. */
  @column.dateTime()
  declare disabledAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  /** Nombre de comptes par rôle (tous les rôles présents, 0 par défaut). */
  static async countByRole(): Promise<Record<Role, number>> {
    const rows = await User.query().select('role').count('* as total').groupBy('role')
    const counts = Object.fromEntries(ROLE_VALUES.map((role) => [role, 0])) as Record<Role, number>
    for (const row of rows) {
      if (row.role in counts) counts[row.role] = Number(row.$extras.total)
    }
    return counts
  }

  /** Désactive le compte et révoque ses jetons : les sessions ouvertes tombent immédiatement. */
  async disable() {
    this.disabledAt = this.disabledAt ?? DateTime.now()
    await this.save()
    await this.revokeTokens()
  }

  async enable() {
    this.disabledAt = null
    await this.save()
  }

  private async revokeTokens() {
    const tokens = await User.accessTokens.all(this)
    await Promise.all(tokens.map((token) => User.accessTokens.delete(this, token.identifier)))
  }

  /** Change le rôle d'un compte et révoque ses jetons pour appliquer les nouveaux droits. */
  async changeRole(role: Role) {
    this.role = role
    await this.save()
    await this.revokeTokens()
  }
}
