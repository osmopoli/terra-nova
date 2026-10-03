import { BaseSchema } from '@adonisjs/lucid/schema'

/** D12 : date à laquelle l'habitant a terminé ou passé le guide de première connexion. */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('onboarded_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('onboarded_at')
    })
  }
}
