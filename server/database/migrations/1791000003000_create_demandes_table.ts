import { BaseSchema } from '@adonisjs/lucid/schema'
import { DEFAULT_DEMANDE_STATUS, LIMITS } from '#constants/domain'

/** Demandes envoyées par les habitants aux services municipaux. */
export default class extends BaseSchema {
  protected tableName = 'demandes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('reference', 20).nullable().unique()
      table.string('subject', LIMITS.demandeSubject).notNullable()
      table.string('service', 30).notNullable()
      table.text('message').notNullable()
      table.string('status', 20).notNullable().defaultTo(DEFAULT_DEMANDE_STATUS).index()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
