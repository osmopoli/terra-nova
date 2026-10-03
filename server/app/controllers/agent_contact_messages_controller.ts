import type { HttpContext } from '@adonisjs/core/http'
import ContactMessage from '#models/contact_message'
import AuditService from '#services/audit_service'
import { updateContactStatusValidator } from '#validators/contact'

/** Traitement des demandes d'habitants par les agents (agents et admins). */
export default class AgentContactMessagesController {
  async updateStatus(ctx: HttpContext) {
    const { request, response } = ctx
    const { status, params } = await request.validateUsing(updateContactStatusValidator)
    const message = await ContactMessage.findBy('tracking_code', params.code.toUpperCase())
    if (!message) {
      return response.notFound({ error: 'Demande introuvable.' })
    }

    const previous = message.status
    if (previous === status) {
      return response.conflict({ error: 'La demande a déjà ce statut.' })
    }
    message.status = status
    await message.save()
    await AuditService.log(ctx, {
      action: 'request_status_changed',
      objectType: 'contact_message',
      objectId: message.trackingCode,
      before: { status: previous },
      after: { status },
    })
    return message
  }
}
