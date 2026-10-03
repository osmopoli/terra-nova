import { BaseSchema } from '@adonisjs/lucid/schema'

/** Localisation des services physiques (WEBC-72) : quartier et coordonnées GPS. */
export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('quartier', 30).nullable().index()
      table.decimal('latitude', 9, 6).nullable()
      table.decimal('longitude', 9, 6).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['quartier'])
      table.dropColumn('quartier')
      table.dropColumn('latitude')
      table.dropColumn('longitude')
    })
  }
}
