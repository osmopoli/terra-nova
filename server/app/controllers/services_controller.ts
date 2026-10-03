import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import { serviceAvailabilityValidator, serviceLanguageValidator } from '#validators/service'

/** Annuaire public des services municipaux (lecture seule), contenus traduits si demandé (F27). */
export default class ServicesController {
  async index({ request }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const services = await Service.query()
      .select('id', 'slug', 'name', 'category', 'summary', 'phone', 'translations', 'availability', 'availability_message', 'availability_until')
      .orderBy('name', 'asc')
    return services.map((service) => {
      const localized = service.localized(lang)
      const { id, slug, name, category, summary, phone, availability } = localized
      const { availabilityMessage, availabilityUntil, lang: served } = localized
      return {
        id,
        slug,
        name,
        category,
        summary,
        phone,
        availability,
        availabilityMessage,
        availabilityUntil,
        lang: served,
      }
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    return service.localized(lang)
  }

  /** Agent / admin : déclare un service disponible, en maintenance ou en incident. */
  async updateAvailability({ params, request, response }: HttpContext) {
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })

    const { status, message, returnDate } = await request.validateUsing(
      serviceAvailabilityValidator
    )
    const down = status !== 'disponible'
    service.merge({
      availability: status,
      availabilityMessage: down ? (message ?? null) : null,
      availabilityUntil: down ? (returnDate ?? null) : null,
    })
    await service.save()
    return service
  }
}
