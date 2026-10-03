import type { HttpContext } from '@adonisjs/core/http'
import Demande from '#models/demande'
import { DateTime } from 'luxon'
import { DEMANDE_STATUSES, SERVICES } from '#constants/domain'
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

  /**
   * Récapitulatif exportable (F56) : synthèse chiffrée puis lignes, uniquement pour l'habitant connecté.
   * Délai moyen = jours entre le dépôt et le passage à « Traité », null sans demande traitée.
   */
  async recap({ auth }: HttpContext) {
    const demandes = await Demande.forUser(auth.getUserOrFail().id).preload('steps')
    const counts = { nouveau: 0, en_cours: 0, traite: 0 }
    const delays: number[] = []
    for (const d of demandes) {
      counts[d.status] += 1
      if (d.status === 'traite') {
        const done = d.steps.filter((step) => step.status === 'traite').pop()
        const end = done?.createdAt ?? d.updatedAt ?? d.createdAt
        delays.push(Math.max(0, end.diff(d.createdAt, 'days').days))
      }
    }
    const average = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : null
    return {
      generatedAt: DateTime.now().toISO(),
      summary: {
        total: demandes.length,
        ...counts,
        averageDelayDays: average === null ? null : Math.round(average * 10) / 10,
      },
      data: demandes.map((d) => ({
        reference: d.reference,
        createdAt: d.createdAt,
        service: d.service,
        serviceLabel: SERVICES[d.service],
        subject: d.subject,
        status: d.status,
        statusLabel: DEMANDE_STATUSES[d.status],
        updatedAt: d.updatedAt ?? d.createdAt,
      })),
    }
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
