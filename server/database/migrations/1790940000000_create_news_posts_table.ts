import { BaseSchema } from '@adonisjs/lucid/schema'
import { LIMITS } from '#constants/domain'

export default class extends BaseSchema {
  protected tableName = 'news_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', LIMITS.newsTitle).notNullable()
      table.string('summary', LIMITS.newsSummary).notNullable()
      table.text('body').notNullable()
      table.string('category', 30).notNullable().index()
      table.timestamp('published_at').notNullable().index()
      table
        .integer('author_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
