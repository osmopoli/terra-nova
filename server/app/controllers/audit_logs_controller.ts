import type { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import AuditService from '#services/audit_service'
import { listAuditLogsValidator, objectHistoryValidator } from '#validators/audit'

const PER_PAGE = 25

/** Journal d'activité : lecture seule, agents et administrateurs. */
export default class AuditLogsController {
  async index({ request }: HttpContext) {
    const { page, from, to, actorId, action, objectType, objectId } =
      await request.validateUsing(listAuditLogsValidator)

    const logs = await AuditLog.query()
      .if(from, (q) => q.where('created_at', '>=', `${from} 00:00:00`))
      .if(to, (q) => q.where('created_at', '<=', `${to} 23:59:59`))
      .if(actorId, (q) => q.where('actor_id', actorId!))
      .if(action, (q) => q.where('action', action!))
      .if(objectType, (q) => q.where('object_type', objectType!))
      .if(objectId, (q) => q.where('object_id', objectId!))
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page ?? 1, PER_PAGE)

    return logs.toJSON()
  }

  /** Historique d'un objet administré : dernier modificateur et changements (WEBC-75). */
  async history({ request }: HttpContext) {
    const { params } = await request.validateUsing(objectHistoryValidator)
    return AuditService.history(params.objectType, params.objectId)
  }
}
