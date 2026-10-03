import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'

/** Annuaire public des services municipaux (lecture seule). */
export default class ServicesController {
  async index() {
    return Service.query()
      .select('id', 'slug', 'name', 'category', 'summary', 'phone')
      .orderBy('name', 'asc')
  }

  async show({ params, response }: HttpContext) {
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    return service
  }
}
