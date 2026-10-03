import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import { listServicesValidator, serviceLanguageValidator } from '#validators/service'

/** Annuaire public des services municipaux (lecture seule), contenus traduits si demandé (F27). */
export default class ServicesController {
  /** Liste filtrable par quartier et thématique (`?quartier=`, `?category=`), traduite si `?lang=`. */
  async index({ request }: HttpContext) {
    const { lang, quartier, category } = await request.validateUsing(listServicesValidator, {
      data: request.qs(),
    })
    const services = await Service.query()
      .select(
        'id',
        'slug',
        'name',
        'category',
        'summary',
        'phone',
        'hours',
        'address',
        'quartier',
        'latitude',
        'longitude',
        'translations'
      )
      .if(quartier, (query) => query.where('quartier', quartier!))
      .if(category, (query) => query.where('category', category!))
      .orderBy('name', 'asc')
    return services.map((service) => {
      const item = service.localized(lang)
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category,
        summary: item.summary,
        phone: item.phone,
        hours: item.hours,
        address: item.address,
        quartier: item.quartier,
        latitude: item.latitude,
        longitude: item.longitude,
        lang: item.lang,
      }
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    return service.localized(lang)
  }
}
