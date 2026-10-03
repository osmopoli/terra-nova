import { BaseSchema } from '@adonisjs/lucid/schema'

/** WEBC-80 : les notifications portent aussi des alertes de sécurité (nouvelle connexion). */
export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('kind', 16).notNullable().defaultTo('statut')
      table.string('title', 120).nullable()
      table.string('message', 400).nullable()
      table.string('action_path', 120).nullable()
      table.string('tracking_code', 16).nullable().alter()
      table.string('subject', 120).nullable().alter()
      table.string('status', 16).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kind')
      table.dropColumn('title')
      table.dropColumn('message')
      table.dropColumn('action_path')
    })
  }
}
