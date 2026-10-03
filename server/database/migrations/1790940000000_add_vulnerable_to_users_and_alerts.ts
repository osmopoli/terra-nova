import { BaseSchema } from '@adonisjs/lucid/schema'

/** F31 : habitant déclaré vulnérable et recommandations spécifiques dans les alertes. */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.boolean('vulnerable').notNullable().defaultTo(false)
    })
    this.schema.alterTable('alerts', (table) => {
      table.text('vulnerable_advice').nullable()
    })
  }

  async down() {
    this.schema.alterTable('alerts', (table) => {
      table.dropColumn('vulnerable_advice')
    })
    this.schema.alterTable('users', (table) => {
      table.dropColumn('vulnerable')
    })
  }
}
