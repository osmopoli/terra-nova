import { BaseSchema } from '@adonisjs/lucid/schema'

/** D02 : clés d'accès (WebAuthn). Clé publique SPKI fournie par le navigateur, sans CBOR. */
export default class extends BaseSchema {
  protected tableName = 'passkeys'

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
      /** Identifiant de la clé (base64url), unique tous comptes confondus. */
      table.string('credential_id', 512).notNullable().unique()
      table.text('public_key').notNullable()
      /** Algorithme COSE : -7 (ES256) ou -257 (RS256). */
      table.integer('algorithm').notNullable()
      table.bigInteger('sign_count').unsigned().notNullable().defaultTo(0)
      table.string('name', 60).notNullable()
      table.timestamp('last_used_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('user_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
