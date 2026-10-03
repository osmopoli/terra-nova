import { BaseSchema } from '@adonisjs/lucid/schema'

/** Statut de disponibilité des services : disponible / maintenance / incident (WEBC-61). */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('availability', 20).notNullable().defaultTo('disponible')
      table.string('availability_message', 300).nullable()
      table.date('availability_until').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('availability')
      table.dropColumn('availability_message')
      table.dropColumn('availability_until')
    })
  }
}
