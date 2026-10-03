import { BaseSchema } from '@adonisjs/lucid/schema'

/** Chronologie des statuts d'une demande (une ligne par changement). */
export default class extends BaseSchema {
  protected tableName = 'demande_steps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('demande_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('demandes')
        .onDelete('CASCADE')
      table.string('status', 20).notNullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
