import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Service from '#models/service'
import {
  featureServiceValidator,
  listServicesValidator,
  serviceLanguageValidator,
} from '#validators/service'

/** Nombre de services proposés en tête d'annuaire (sélection de la mairie, puis les plus consultés). */
const HIGHLIGHT_SIZE = 4

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
        'translations',
        'featured_rank'
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
        featured: service.featuredRank !== null,
        lang: item.lang,
      }
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    // Compteur incrémenté en base (pas de lecture-écriture concurrente).
    await Service.query().where('id', service.id).increment('views', 1)
    return { ...service.localized(lang), featured: service.featuredRank !== null }
  }

  /**
   * F28 : services à mettre en avant, dans l'ordre : sélection de la mairie,
   * complétée par les plus consultés.
   */
  async highlights({ request }: HttpContext) {
    const { lang } = await request.validateUsing(serviceLanguageValidator, { data: request.qs() })
    const featured = await Service.query()
      .whereNotNull('featured_rank')
      .orderBy('featured_rank', 'asc')
      .limit(HIGHLIGHT_SIZE)
    const popular = await Service.query()
      .whereNull('featured_rank')
      .where('views', '>', 0)
      .orderBy('views', 'desc')
      .limit(HIGHLIGHT_SIZE - featured.length)
    return [
      ...featured.map((s) => ({ service: s, reason: 'featured' })),
      ...popular.map((s) => ({ service: s, reason: 'popular' })),
    ].map(({ service, reason }) => {
      const l = service.localized(lang)
      return {
        slug: l.slug,
        name: l.name,
        category: l.category,
        summary: l.summary,
        firstProcedure: l.procedures?.[0]?.title ?? null,
        reason,
        lang: l.lang,
      }
    })
  }

  /** F28 (admin) : mettre en avant un service (en dernière position) ou le retirer. */
  async feature({ auth, params, request, response }: HttpContext) {
    if (auth.getUserOrFail().role !== 'admin') {
      return response.forbidden({
        error: "Accès refusé : votre profil n'autorise pas cette action.",
      })
    }
    const { featured } = await request.validateUsing(featureServiceValidator)
    const service = await Service.findBy('slug', String(params.slug))
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })

    if (!featured) {
      service.featuredRank = null
    } else if (service.featuredRank === null) {
      const { max } = await db.from('services').max('featured_rank as max').firstOrFail()
      service.featuredRank = Number(max ?? 0) + 1
    }
    await service.save()
    return { slug: service.slug, featured: service.featuredRank !== null }
  }
}
