import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import db from '@adonisjs/lucid/services/db'
import DemandeStep from '#models/demande_step'
import { DEFAULT_DEMANDE_STATUS, type DemandeStatus, type Service } from '#constants/domain'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => DemandeStep)
  declare steps: HasMany<typeof DemandeStep>

  /** Enregistre une demande, son numéro de suivi et sa première étape, en une transaction. */
  static async submit(
    userId: number,
    payload: { subject: string; service: Service; message: string }
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
