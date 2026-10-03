import { BaseSchema } from '@adonisjs/lucid/schema'
import { DEFAULT_ROLE } from '#constants/domain'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role', 20).notNullable().defaultTo(DEFAULT_ROLE).index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['role'])
      table.dropColumn('role')
    })
  }
}
