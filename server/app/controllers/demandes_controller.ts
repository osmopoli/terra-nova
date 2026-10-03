import type { HttpContext } from '@adonisjs/core/http'
import Demande from '#models/demande'
import { createDemandeValidator, showDemandeValidator } from '#validators/demande'

/** « Mes demandes » : un habitant n'accède qu'à ses propres demandes. */
export default class DemandesController {
  async index({ auth }: HttpContext) {
    const demandes = await Demande.forUser(auth.getUserOrFail().id).select(
      'id',
      'reference',
      'subject',
      'service',
      'status',
      'created_at',
      'updated_at'
    )
    return { data: demandes }
  }

  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createDemandeValidator)
    const demande = await Demande.submit(auth.getUserOrFail().id, payload)
    await demande.load('steps')
    return response.created(demande)
  }

  async show({ auth, request, response }: HttpContext) {
    const { params } = await request.validateUsing(showDemandeValidator)
    const demande = await Demande.forUser(auth.getUserOrFail().id)
      .where('id', params.id)
      .preload('steps', (query) => query.orderBy('created_at', 'asc').orderBy('id', 'asc'))
      .first()
    if (!demande) {
      return response.notFound({ error: 'Demande introuvable.' })
    }
    return demande
  }
}
