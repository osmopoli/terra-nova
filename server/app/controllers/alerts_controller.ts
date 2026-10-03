import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import { alertParamsValidator, createAlertValidator, updateAlertValidator } from '#validators/alert'

const PERIOD_ERROR = {
  errors: [{ field: 'endsAt', message: 'La fin doit être postérieure au début.' }],
}

export default class AlertsController {
  /**
   * Public (connecté ou non) : alertes à afficher en bannière maintenant.
   * Avec un token, `concernsYou` dit si l'alerte vise le quartier de l'habitant
   * (null s'il n'a pas de quartier) et celles de son quartier passent en tête.
   * Les recommandations pour personnes vulnérables sont publiques (un proche peut les relayer) ;
   * `forVulnerable` signale à l'habitant déclaré vulnérable qu'elles s'adressent à lui.
   */
  async active({ auth }: HttpContext) {
    const user = (await auth.check()) ? auth.user! : null
    const district = user?.district ?? null
    const alerts = Alert.sortForDisplay(await Alert.query().withScopes((s) => s.active()), district)
    return alerts.map((alert) => ({
      ...alert.serialize(),
      concernsYou: district ? alert.concerns(district) : null,
      forVulnerable: Boolean(user?.vulnerable && alert.vulnerableAdvice),
    }))
  }

  /** Admin : toutes les alertes, à venir comme expirées. */
  async index() {
    return Alert.query().orderBy('starts_at', 'desc').orderBy('id', 'desc')
  }

  async store({ auth, request, response }: HttpContext) {
    const { startsAt, endsAt, ...payload } = await request.validateUsing(createAlertValidator)
    const alert = new Alert().merge({
      ...payload,
      startsAt: startsAt ? DateTime.fromJSDate(startsAt) : DateTime.now(),
      endsAt: DateTime.fromJSDate(endsAt),
      createdBy: auth.getUserOrFail().id,
    })
    if (alert.endsAt <= alert.startsAt) return response.unprocessableEntity(PERIOD_ERROR)

    await alert.save()
    return response.created(alert)
  }

  async update({ request, response }: HttpContext) {
    const { params, startsAt, endsAt, ...payload } =
      await request.validateUsing(updateAlertValidator)
    const alert = await Alert.find(params.id)
    if (!alert) return response.notFound({ error: 'Alerte introuvable.' })

    alert.merge(payload)
    if (startsAt) alert.startsAt = DateTime.fromJSDate(startsAt)
    if (endsAt) alert.endsAt = DateTime.fromJSDate(endsAt)
    if (alert.endsAt <= alert.startsAt) return response.unprocessableEntity(PERIOD_ERROR)

    await alert.save()
    return alert
  }

  async destroy({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(alertParamsValidator)
    const alert = await Alert.find(params.id)
    if (!alert) return response.notFound({ error: 'Alerte introuvable.' })

    await alert.delete()
    return response.noContent()
  }
}
