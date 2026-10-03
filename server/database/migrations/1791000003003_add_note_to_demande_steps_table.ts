import { BaseSchema } from '@adonisjs/lucid/schema'
import { LIMITS } from '#constants/domain'

/** F22 : un agent peut accompagner un changement d'état d'une réponse visible par l'habitant. */
export default class extends BaseSchema {
  protected tableName = 'demande_steps'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('note', LIMITS.demandeNote).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('note')
    })
  }
}
