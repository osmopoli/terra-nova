import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Notification from '#models/notification'

/** Notifications de l'habitant connecté : jamais celles d'un autre compte. */
export default class NotificationsController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const notifications = await Notification.query()
      .where('user_id', user.id)
      .orderBy('id', 'desc')
      .limit(50)
    const [{ total }] = await Notification.query()
      .where('user_id', user.id)
      .whereNull('read_at')
      .count('* as total')
      .pojo<{ total: number | string }>()

    return {
      unread: Number(total),
      notifications: notifications.map((n) => ({
        ...n.serialize(),
        statusLabel: n.statusLabel,
        action: n.action,
      })),
    }
  }

  async read({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', Number(params.id))
      .where('user_id', user.id)
      .first()
    if (!notification) {
      return response.notFound({ error: 'Notification introuvable.' })
    }

    if (!notification.readAt) {
      notification.readAt = DateTime.now()
      await notification.save()
    }
    return {
      ...notification.serialize(),
      statusLabel: notification.statusLabel,
      action: notification.action,
    }
  }
}
