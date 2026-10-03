import { BaseSchema } from '@adonisjs/lucid/schema'

/** F34 : date de désactivation d'un compte par un agent ; null = compte actif. */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('disabled_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('disabled_at')
    })
  }
}
