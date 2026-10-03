import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-6 : messages des habitants aux services municipaux, avec numéro de suivi et statut. */
export default class extends BaseSchema {
  protected tableName = 'contact_messages'

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
      table.string('tracking_code', 16).notNullable().unique()
      table.string('subject', 120).notNullable()
      table.string('service', 32).notNullable()
      table.text('message').notNullable()
      table.string('status', 16).notNullable().defaultTo('nouveau').index()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
