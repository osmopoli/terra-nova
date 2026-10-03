import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-60 : journal des tentatives de connexion (limitation par compte et par IP, vue admin). */
export default class extends BaseSchema {
  protected tableName = 'login_attempts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('email', 254).notNullable()
      table.string('ip', 64).notNullable()
      table.string('outcome', 16).notNullable()
      table.string('reason', 16).nullable()
      /** Horodatage en millisecondes (comparaisons sans souci de fuseau). */
      table.bigInteger('attempted_at').unsigned().notNullable()

      table.index(['email', 'attempted_at'])
      table.index(['ip', 'attempted_at'])
      table.index('attempted_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
