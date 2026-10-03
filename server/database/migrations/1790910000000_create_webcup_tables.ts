import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-2 : demandes de l'API Webcup (dédoublonnées sur request_code) et état de la synchro. */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('webcup_requests', (table) => {
      table.string('request_code', 64).primary()
      table.text('payload', 'mediumtext').notNullable()
      table.integer('difficulty_level').nullable()
      table.integer('xp_total').nullable()
      table.integer('wave').nullable()
      table.timestamp('first_seen_at').notNullable()
      // NULL tant qu'aucun agent n'a vu la demande (indicateur « nouvelle demande »)
      table.timestamp('seen_at').nullable().index()
    })

    // Une seule ligne (id = 1) : dernière session reçue, date et erreur du dernier polling.
    this.schema.createTable('webcup_state', (table) => {
      table.tinyint('id').unsigned().primary()
      table.text('session_json').nullable()
      table.timestamp('last_poll_at').nullable()
      table.text('last_error').nullable()
    })
  }

  async down() {
    this.schema.dropTable('webcup_state')
    this.schema.dropTable('webcup_requests')
  }
}
