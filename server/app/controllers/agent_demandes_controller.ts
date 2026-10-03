import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Demande from '#models/demande'
import { DEFAULT_DEMANDE_STATUS, DEMANDE_STATUS_VALUES } from '#constants/domain'
import { listAgentDemandesValidator, updateAgentDemandeValidator } from '#validators/agent_demande'

/** F22 : demandes des habitants vues et traitées par les agents (et les admins). */
export default class AgentDemandesController {
  /** Par défaut, les demandes qui attendent une action ; les nouvelles d'abord, puis les plus anciennes. */
  async index({ request }: HttpContext) {
    const { status = 'a_traiter' } = await request.validateUsing(listAgentDemandesValidator, {
      data: request.qs(),
    })
    const demandes = await Demande.query()
      .if(status === 'a_traiter', (q) => q.whereNot('status', 'traite'))
      .if(status !== 'a_traiter', (q) => q.where('status', status))
      .preload('user')
      .orderByRaw("CASE WHEN status = 'nouveau' THEN 0 WHEN status = 'en_cours' THEN 1 ELSE 2 END")
      .orderBy('created_at', 'asc')
      .limit(200)
    return {
      data: demandes.map((d) => ({ ...d.serialize(), citizenName: d.user?.fullName ?? null })),
      counts: await AgentDemandesController.counts(),
    }
  }

  async show({ params, response }: HttpContext) {
    const demande = await Demande.query()
      .where('id', Number(params.id) || 0)
      .preload('user')
      .preload('steps', (q) => q.orderBy('created_at', 'asc').orderBy('id', 'asc'))
      .first()
    if (!demande) return response.notFound({ error: 'Demande introuvable.' })
    return { ...demande.serialize(), citizenName: demande.user?.fullName ?? null }
  }

  /** Change l'état et trace l'étape (avec la réponse de l'agent), en une transaction. */
  async update({ request, response }: HttpContext) {
    const { params, status, note } = await request.validateUsing(updateAgentDemandeValidator)
    const demande = await Demande.find(params.id)
    if (!demande) return response.notFound({ error: 'Demande introuvable.' })
    if (demande.status === status && !note) {
      return response.conflict({ error: 'La demande est déjà dans cet état.' })
    }

    await db.transaction(async (trx) => {
      demande.useTransaction(trx)
      demande.status = status
      await demande.save()
      await demande.related('steps').create({ status, note: note ?? null })
    })
    await demande.load('steps', (q) => q.orderBy('created_at', 'asc').orderBy('id', 'asc'))
    return demande
  }

  /**
   * D17 : charge de travail en un coup d'œil. `pending` = demandes reçues que personne
   * n'a encore prises en charge ; `oldestPendingAt` = la plus ancienne d'entre elles.
   */
  async summary() {
    const counts = await AgentDemandesController.counts()
    const oldest = await Demande.query()
      .where('status', DEFAULT_DEMANDE_STATUS)
      .orderBy('created_at', 'asc')
      .first()
    return {
      pending: counts.nouveau ?? 0,
      inProgress: counts.en_cours ?? 0,
      counts,
      oldestPendingAt: oldest?.createdAt ?? null,
    }
  }

  /** Nombre de demandes par état (D17 s'appuie dessus pour la charge de travail). */
  static async counts() {
    const rows = await db.from('demandes').select('status').count('* as total').groupBy('status')
    const counts = Object.fromEntries(DEMANDE_STATUS_VALUES.map((s) => [s, 0])) as Record<
      string,
      number
    >
    for (const row of rows) counts[row.status] = Number(row.total)
    return counts
  }
}
