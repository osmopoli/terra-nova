import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import DemandeStep from '#models/demande_step'
import {
  DEFAULT_DEMANDE_STATUS,
  type DemandeKind,
  type DemandeStatus,
  type IssueCategory,
  type Service,
} from '#constants/domain'

/** Champs propres à un signalement (F25) : où et quoi. */
export type IssueFields = {
  kind: DemandeKind
  category: IssueCategory | null
  location: string | null
  latitude: number | null
  longitude: number | null
}

export default class Demande extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare userId: number

  /** Numéro de suivi lisible (ex. NT-000042), attribué à la création. */
  @column()
  declare reference: string | null

  @column()
  declare subject: string

  @column()
  declare service: Service

  @column()
  declare message: string

  @column()
  declare status: DemandeStatus

  @column()
  declare kind: DemandeKind

  /** Signalement : type de problème ; null pour une demande classique. */
  @column()
  declare category: IssueCategory | null

  /** Signalement : lieu décrit par l'habitant (adresse, repère). */
  @column()
  declare location: string | null

  /** Signalement : position GPS facultative, partagée par le navigateur avec l'accord de l'habitant. */
  @column({ consume: (value) => (value === null ? null : Number(value)) })
  declare latitude: number | null

  @column({ consume: (value) => (value === null ? null : Number(value)) })
  declare longitude: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => DemandeStep)
  declare steps: HasMany<typeof DemandeStep>

  /** Habitant auteur : chargé uniquement pour la vue agent (nom affiché, jamais l'e-mail). */
  @belongsTo(() => User, { serializeAs: null })
  declare user: BelongsTo<typeof User>

  /** Enregistre une demande, son numéro de suivi et sa première étape, en une transaction. */
  static async submit(
    userId: number,
    payload: { subject: string; service: Service; message: string } & Partial<IssueFields>
  ): Promise<Demande> {
    return db.transaction(async (trx) => {
      const demande = await Demande.create(
        { ...payload, userId, status: DEFAULT_DEMANDE_STATUS },
        { client: trx }
      )
      demande.reference = `NT-${String(demande.id).padStart(6, '0')}`
      await demande.save()
      await demande.related('steps').create({ status: demande.status })
      return demande
    })
  }

  /** Demandes d'un habitant, plus récentes en premier. */
  static forUser(userId: number) {
    return Demande.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
  }
}
