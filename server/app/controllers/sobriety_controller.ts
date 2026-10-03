import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { META } from '#constants/domain'
import { measureSobriety } from '#services/sobriety'

/** Le build ne change qu'au déploiement : un calcul toutes les 5 minutes suffit. */
const CACHE_SECONDS = 300
let cache: { at: number; data: NonNullable<ReturnType<typeof measureSobriety>> } | null = null

/** Même forme que la réponse de GET /api/meta, pour en mesurer le poids exact. */
const metaPayload = () =>
  Object.fromEntries(
    Object.entries(META).map(([name, map]) => [
      name,
      Object.entries(map).map(([value, label]) => ({ value, label })),
    ])
  )

/** Sobriété numérique (F57) : poids, requêtes, CO2 estimé et note des pages principales. */
export default class SobrietyController {
  async show({ response }: HttpContext) {
    if (!cache || Date.now() - cache.at > CACHE_SECONDS * 1000) {
      const payloads: Record<string, unknown> = { '/meta': metaPayload() }
      const first = measureSobriety(app.publicPath(), payloads)
      if (!first) {
        return response.serviceUnavailable({
          error: 'Mesures indisponibles : le site n’est pas encore construit sur ce serveur.',
        })
      }
      // Deuxième passe : la page Sobriété compte aussi le poids de cette réponse.
      payloads['/sobriete'] = first
      cache = { at: Date.now(), data: measureSobriety(app.publicPath(), payloads)! }
    }
    response.header('Cache-Control', `public, max-age=${CACHE_SECONDS}`)
    return cache.data
  }
}
