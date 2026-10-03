import { BaseSchema } from '@adonisjs/lucid/schema'

/** F29 : quartier de l'habitant et ciblage des alertes par quartier, avec consignes. */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('district', 20).nullable()
    })
    this.schema.alterTable('alerts', (table) => {
      // Liste JSON de clés DISTRICTS ; null = alerte pour toute la ville.
      table.text('districts').nullable()
      table.text('instructions').nullable()
    })
  }

  async down() {
    this.schema.alterTable('alerts', (table) => {
      table.dropColumn('districts')
      table.dropColumn('instructions')
    })
    this.schema.alterTable('users', (table) => {
      table.dropColumn('district')
    })
  }
}
