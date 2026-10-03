import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import { listServicesValidator, serviceLanguageValidator } from '#validators/service'

/** Annuaire public des services municipaux (lecture seule), contenus traduits si demandé (F27). */
export default class ServicesController {
  async index({ request }: HttpContext) {
    const { lang, q, category } = await request.validateUsing(listServicesValidator, {
      data: request.qs(),
    })
    // F32 : recherche insensible aux accents et à la casse (collation MySQL utf8mb4 *_ai_ci),
    // dans le nom, le résumé, la présentation et les démarches.
    const services = await Service.query()
      .select('id', 'slug', 'name', 'category', 'summary', 'phone', 'translations')
      .if(category, (query) => query.where('category', category!))
      .if(q, (query) =>
        query.where((sub) => {
          for (const column of ['name', 'summary', 'description', 'procedures', 'translations']) {
            sub.orWhere(column, 'like', `%${q!.replace(/[\\%_]/g, '\\$&')}%`)
          }
        })
      )
      .orderBy('name', 'asc')
    return services.map((service) => {
      const l = service.localized(lang)
      return {
        id: l.id,
        slug: l.slug,
        name: l.name,
        category: l.category,
        summary: l.summary,
        phone: l.phone,
        lang: l.lang,
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
