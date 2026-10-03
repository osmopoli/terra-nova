import type { HttpContext } from '@adonisjs/core/http'
import { listRequests, markSeen, pollOnce } from '#services/webcup_sync'
import { listWebcupRequestsValidator, markWebcupSeenValidator } from '#validators/webcup'

/** WEBC-2 : demandes de l'API Webcup vues par les agents (jamais d'appel direct depuis le navigateur). */
export default class WebcupController {
  async index({ request }: HttpContext) {
    const { onlyNew } = await request.validateUsing(listWebcupRequestsValidator, {
      data: request.qs(),
    })
    return listRequests({ onlyNew: onlyNew ?? false })
  }

  async markSeen({ request }: HttpContext) {
    const { codes } = await request.validateUsing(markWebcupSeenValidator)
    return { marked: await markSeen(codes) }
  }

  /** Force un polling immédiat (admin). */
  async refresh() {
    await pollOnce()
    return listRequests()
  }
}
