import { BaseSchema } from '@adonisjs/lucid/schema'

/** Annuaire des services municipaux (D05). */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('slug', 80).notNullable().unique()
      table.string('name', 120).notNullable()
      table.string('category', 30).notNullable().index()
      table.string('summary', 255).notNullable()
      table.text('description').notNullable()
      table.text('hours').notNullable()
      table.string('phone', 30).nullable()
      table.string('email', 254).nullable()
      table.string('address', 255).nullable()
      // Liste ordonnée des démarches, stockée en JSON (tableau de { title, detail }).
      table.text('procedures').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
