import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import { serviceLanguageValidator } from '#validators/service'
import { EMERGENCY_CATEGORY } from '#constants/domain'

/** Annuaire public des services municipaux (lecture seule), contenus traduits si demandé (F27). */
export default class ServicesController {
  async index({ request }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const services = await Service.query()
      .select('id', 'slug', 'name', 'category', 'summary', 'phone', 'translations')
      .orderBy('name', 'asc')
    return services.map((service) => {
      const { id, slug, name, category, summary, phone, lang: served } = service.localized(lang)
      return { id, slug, name, category, summary, phone, lang: served }
    })
  }

  /** Hôpitaux et services d'urgence, avec de quoi appeler ou s'y rendre. */
  async emergency() {
    return Service.query()
      .where('category', EMERGENCY_CATEGORY)
      .select('id', 'slug', 'name', 'summary', 'hours', 'phone', 'address')
      .orderBy('name', 'asc')
  }

  async show({ params, request, response }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    return service.localized(lang)
  }
}
