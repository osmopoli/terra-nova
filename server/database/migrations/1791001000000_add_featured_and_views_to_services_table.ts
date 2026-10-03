import { BaseSchema } from '@adonisjs/lucid/schema'

/** F28 : services mis en avant par la mairie (ordre) et compteur de consultations. */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // null = non mis en avant ; sinon position dans la sélection (1 = premier).
      table.integer('featured_rank').unsigned().nullable()
      table.integer('views').unsigned().notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('featured_rank')
      table.dropColumn('views')
    })
  }
}
