import type { HttpContext } from '@adonisjs/core/http'
import ContactMessage from '#models/contact_message'
import { DEFAULT_CONTACT_STATUS } from '#constants/domain'
import { createContactMessageValidator } from '#validators/contact'

/** Messages d'un habitant aux services municipaux : il ne lit que les siens. */
export default class ContactMessagesController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return ContactMessage.query().where('user_id', user.id).orderBy('id', 'desc')
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createContactMessageValidator)
    const message = await ContactMessage.create({
      ...payload,
      userId: user.id,
      status: DEFAULT_CONTACT_STATUS,
    })

    return response.created(message)
  }

  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const message = await ContactMessage.query()
      .where('tracking_code', String(params.code).toUpperCase())
      .where('user_id', user.id)
      .first()
    if (!message) {
      return response.notFound({ error: 'Message introuvable.' })
    }

    return message
  }
}
