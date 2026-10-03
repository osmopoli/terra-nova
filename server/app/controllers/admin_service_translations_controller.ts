import type { HttpContext } from '@adonisjs/core/http'
import Service, { type ServiceTranslation } from '#models/service'
import { showTranslationValidator, updateTranslationValidator } from '#validators/service'

const TEXT_FIELDS = ['name', 'summary', 'description', 'hours'] as const

/** F27 : saisie des traductions des services, réservée aux administrateurs. */
export default class AdminServiceTranslationsController {
  /** Traduction brute (sans repli sur le français) pour pré-remplir le formulaire. */
  async show({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(showTranslationValidator)
    const service = await Service.findBy('slug', params.slug)
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })
    return { lang: params.lang, translation: service.translations?.[params.lang] ?? {} }
  }

  async update({ request, response }: HttpContext) {
    const { params, ...fields } = await request.validateUsing(updateTranslationValidator)
    const service = await Service.findBy('slug', params.slug)
    if (!service) return response.notFound({ error: "Ce service n'existe pas." })

    // Les démarches traduites (seeder) sont conservées ; seuls les champs texte sont saisis ici.
    const translation: ServiceTranslation = { ...service.translations?.[params.lang] }
    for (const field of TEXT_FIELDS) {
      const value = fields[field]
      if (value) translation[field] = value
      else delete translation[field]
    }

    const translations = { ...service.translations }
    if (Object.keys(translation).length > 0) translations[params.lang] = translation
    else delete translations[params.lang]
    service.translations = translations
    await service.save()

    return { lang: params.lang, translation }
  }
}
