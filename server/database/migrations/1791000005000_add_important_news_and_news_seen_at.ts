import { BaseSchema } from '@adonisjs/lucid/schema'

/** F30 : annonces importantes et date à laquelle l'habitant a consulté ses notifications. */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('news_posts', (table) => {
      table.boolean('important').notNullable().defaultTo(false).index()
    })
    this.schema.alterTable('users', (table) => {
      table.timestamp('news_seen_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('news_seen_at')
    })
    this.schema.alterTable('news_posts', (table) => {
      table.dropColumn('important')
    })
  }
}
