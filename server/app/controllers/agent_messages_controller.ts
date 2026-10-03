import type { HttpContext } from '@adonisjs/core/http'
import ContactMessage from '#models/contact_message'
import { CONTACT_STATUSES_TO_HANDLE, CONTACT_STATUS_VALUES } from '#constants/domain'
import {
  listAgentMessagesValidator,
  updateMessageStatusValidator,
} from '#validators/agent_messages'

/** Lignes renvoyées aux agents : message + nom de l'habitant (jamais son e-mail). */
function withCitizen(message: ContactMessage) {
  return { ...message.serialize(), citizenName: message.$extras.citizen_name ?? null }
}

/** Messages des habitants vus par les agents municipaux (F22). */
export default class AgentMessagesController {
  async index({ request }: HttpContext) {
    const { filter } = await request.validateUsing(listAgentMessagesValidator)
    const messages = await ContactMessage.query()
      .join('users', 'users.id', 'contact_messages.user_id')
      .select('contact_messages.*', 'users.full_name as citizen_name')
      .if(filter === 'a_traiter', (q) =>
        q.whereIn('contact_messages.status', CONTACT_STATUSES_TO_HANDLE)
      )
      .if(filter && filter !== 'a_traiter', (q) => q.where('contact_messages.status', filter!))
      .orderBy('contact_messages.id', 'desc')
      .limit(200)

    const rows = await ContactMessage.query().select('status').count('* as total').groupBy('status')
    const counts = Object.fromEntries(CONTACT_STATUS_VALUES.map((s) => [s, 0]))
    for (const row of rows) counts[row.status] = Number(row.$extras.total)

    return { messages: messages.map(withCitizen), counts }
  }

  async updateStatus({ params, request, response }: HttpContext) {
    const { status } = await request.validateUsing(updateMessageStatusValidator)
    const message = await ContactMessage.findBy('tracking_code', String(params.code).toUpperCase())
    if (!message) {
      return response.notFound({ error: 'Message introuvable.' })
    }

    message.status = status
    await message.save()
    return message
  }
}
