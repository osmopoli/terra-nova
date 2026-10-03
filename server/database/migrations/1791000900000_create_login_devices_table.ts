import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-80 : appareils connus d'un compte (empreinte user-agent + IP tronquée). */
export default class extends BaseSchema {
  protected tableName = 'login_devices'

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
      table.string('fingerprint', 64).notNullable()
      table.string('browser', 40).notNullable()
      table.string('os', 40).notNullable()
      table.string('ip_hint', 64).notNullable()
      table.timestamp('first_seen_at').notNullable()
      table.timestamp('last_seen_at').notNullable()

      table.unique(['user_id', 'fingerprint'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
