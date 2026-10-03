import { BaseSchema } from '@adonisjs/lucid/schema'

/** Prochaine action proposée quand un service est désactivé par un admin (WEBC-91). */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('availability_action', 300).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('availability_action')
    })
  }
}
