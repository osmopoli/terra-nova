import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-76 : notifications d'un habitant quand le statut de sa demande change. */
export default class extends BaseSchema {
  protected tableName = 'notifications'

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
      table.string('tracking_code', 16).notNullable()
      table.string('subject', 120).notNullable()
      table.string('status', 16).notNullable()
      table.timestamp('read_at').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'read_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
