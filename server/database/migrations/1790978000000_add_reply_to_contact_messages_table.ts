import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-78 (F51) : réponse d'un agent à un message d'habitant. */
export default class extends BaseSchema {
  protected tableName = 'contact_messages'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('reply').nullable()
      table.timestamp('replied_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reply')
      table.dropColumn('replied_at')
    })
  }
}
