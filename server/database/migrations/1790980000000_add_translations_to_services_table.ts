import { BaseSchema } from '@adonisjs/lucid/schema'

/** F27 : traductions des contenus essentiels d'un service (JSON par langue). */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('translations').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('translations')
    })
  }
}
