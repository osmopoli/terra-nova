import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service from '#models/service'
import type { Quartier } from '#constants/domain'

/**
 * Localisation de démo des services (WEBC-72) : quartier et coordonnées.
 * À lancer après services_seeder. Rejouable : met à jour chaque service par son slug.
 */
export const DEMO_LOCATIONS: Record<
  string,
  { quartier: Quartier; latitude: number; longitude: number }
> = {
  'etat-civil': { quartier: 'centre_ville', latitude: -21.1151, longitude: 55.5364 },
  'urbanisme': { quartier: 'centre_ville', latitude: -21.1151, longitude: 55.5364 },
  'enfance-education': { quartier: 'horizon', latitude: -21.1098, longitude: 55.5472 },
  'ccas': { quartier: 'fougeres', latitude: -21.1203, longitude: 55.5291 },
  'proprete-dechets': { quartier: 'brisants', latitude: -21.1342, longitude: 55.5185 },
  'mediatheque': { quartier: 'horizon', latitude: -21.1121, longitude: 55.5439 },
  'sports': { quartier: 'littoral', latitude: -21.1287, longitude: 55.5563 },
  'police-municipale': { quartier: 'port', latitude: -21.1176, longitude: 55.5498 },
}

export default class extends BaseSeeder {
  async run() {
    for (const [slug, location] of Object.entries(DEMO_LOCATIONS)) {
      const service = await Service.findBy('slug', slug)
      if (service) await service.merge(location).save()
    }
  }
}
