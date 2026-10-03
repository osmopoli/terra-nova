import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import type { NewsCategory, Role } from '#constants/domain'

export default class NewsPost extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare summary: string

  @column()
  declare body: string

  @column()
  declare category: NewsCategory

  @column.dateTime()
  declare publishedAt: DateTime

  @column({ serializeAs: null })
  declare authorId: number | null

  /** Jamais sérialisé en entier (e-mail, rôle) : seul `authorName` est public. */
  @belongsTo(() => User, { foreignKey: 'authorId', serializeAs: null })
  declare author: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @computed()
  get authorName(): string | null {
    return this.author?.fullName ?? null
  }

  /** Publications visibles du public : date de publication atteinte. */
  static visible = scope((query) => {
    query.where('published_at', '<=', DateTime.now().toSQL({ includeOffset: false })!)
  })

  /** Un admin gère toutes les actualités ; un agent uniquement les siennes. */
  canBeEditedBy(user: { id: number; role: Role }) {
    return user.role === 'admin' || this.authorId === user.id
  }
}
