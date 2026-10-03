import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { ServiceCategory } from '#constants/domain'

export type ServiceProcedure = { title: string; detail: string }

/** Service municipal présenté dans l'annuaire. */
export default class Service extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare category: ServiceCategory

  @column()
  declare summary: string

  @column()
  declare description: string

  @column()
  declare hours: string

  @column()
  declare phone: string | null

  @column()
  declare email: string | null

  @column()
  declare address: string | null

  @column({
    prepare: (value: ServiceProcedure[]) => JSON.stringify(value),
    consume: (value: string | null) => (value ? JSON.parse(value) : []),
  })
  declare procedures: ServiceProcedure[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
