import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Jetons courts et à usage unique côté serveur : étape « code » de la connexion (F53),
 * défis des clés d'accès (D02). Seule l'empreinte sha256 du jeton est stockée.
 */
export default class extends BaseSchema {
  protected tableName = 'auth_challenges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('purpose', 32).notNullable()
      table.string('token_hash', 64).notNullable().unique()
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('attempts').unsigned().notNullable().defaultTo(0)
      /** Horodatage d'expiration en millisecondes. */
      table.bigInteger('expires_at').unsigned().notNullable()
      table.timestamp('created_at').notNullable()

      table.index('expires_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
