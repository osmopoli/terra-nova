import type { HttpContext } from '@adonisjs/core/http'
import Demande from '#models/demande'
import Service from '#models/service'
import { ISSUE_CATEGORIES, ISSUE_SERVICE } from '#constants/domain'
import {
  createDemandeValidator,
  createIssueValidator,
  showDemandeValidator,
} from '#validators/demande'

/** « Mes demandes » : un habitant n'accède qu'à ses propres demandes. */
export default class DemandesController {
  async index({ auth }: HttpContext) {
    const demandes = await Demande.forUser(auth.getUserOrFail().id).select(
      'id',
      'reference',
      'subject',
      'service',
      'status',
      'kind',
      'category',
      'location',
      'created_at',
      'updated_at'
    )
    return { data: demandes }
  }

  async store({ auth, request, response }: HttpContext) {
    const { serviceSlug, ...payload } = await request.validateUsing(createDemandeValidator)
    if (serviceSlug) {
      const target = await Service.findBy('slug', serviceSlug)
      if (target?.availability === 'desactive') {
        const next = target.availabilityAction ? ` ${target.availabilityAction}` : ''
        return response.conflict({
          error: `Ce service est désactivé : ${target.availabilityMessage ?? 'indisponible'}.${next}`,
        })
      }
    }
    const demande = await Demande.submit(auth.getUserOrFail().id, payload)
    await demande.load('steps')
    return response.created(demande)
  }

  /** F25 : signaler un problème sur l'espace public, avec son emplacement. */
  async storeIssue({ auth, request, response }: HttpContext) {
    const { category, message, location, latitude, longitude } =
      await request.validateUsing(createIssueValidator)
    const demande = await Demande.submit(auth.getUserOrFail().id, {
      kind: 'signalement',
      subject: `Signalement : ${ISSUE_CATEGORIES[category]}`,
      service: ISSUE_SERVICE[category],
      category,
      message,
      location,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })
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
