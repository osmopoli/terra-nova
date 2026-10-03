import { BaseSchema } from '@adonisjs/lucid/schema'

/** F53 : secret TOTP (chiffré avec APP_KEY) et codes de secours (empreintes sha256) par compte. */
export default class extends BaseSchema {
  protected tableName = 'two_factor_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('secret').notNullable()
      /** null tant que le premier code n'a pas été confirmé. */
      table.timestamp('enabled_at').nullable()
      /** Dernier pas TOTP accepté : un code ne sert qu'une fois. */
      table.bigInteger('last_step').unsigned().notNullable().defaultTo(0)
      table.text('recovery_codes').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
