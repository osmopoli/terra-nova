import { BaseSchema } from '@adonisjs/lucid/schema'
import { LIMITS } from '#constants/domain'

export default class extends BaseSchema {
  protected tableName = 'alerts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', LIMITS.alertTitle).notNullable()
      table.text('message').notNullable()
      table.string('level', 20).notNullable()
      table.timestamp('starts_at').notNullable()
      table.timestamp('ends_at').notNullable()
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['starts_at', 'ends_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
