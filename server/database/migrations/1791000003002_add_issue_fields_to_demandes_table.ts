import { BaseSchema } from '@adonisjs/lucid/schema'
import { LIMITS } from '#constants/domain'

/** F25 : une demande peut être un signalement localisé (type de problème, lieu, position). */
export default class extends BaseSchema {
  protected tableName = 'demandes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('kind', 20).notNullable().defaultTo('demande').index()
      table.string('category', 30).nullable()
      table.string('location', LIMITS.location).nullable()
      table.decimal('latitude', 9, 6).nullable()
      table.decimal('longitude', 9, 6).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kind')
      table.dropColumn('category')
      table.dropColumn('location')
      table.dropColumn('latitude')
      table.dropColumn('longitude')
    })
  }
}
