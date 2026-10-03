import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-74 : journal d'audit des opérations sensibles (écriture seule côté API). */
export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('actor_id').unsigned().nullable().index()
      table.string('actor_name', 120).nullable()
      table.string('actor_role', 16).nullable()
      table.string('action', 48).notNullable().index()
      table.string('object_type', 32).notNullable()
      table.string('object_id', 64).nullable()
      table.text('before_summary').nullable()
      table.text('after_summary').nullable()
      table.string('ip', 45).nullable()
      table.timestamp('created_at').notNullable().index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
