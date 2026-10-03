import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'

const PROCEDURES = [{ title: 'Demander un acte', detail: 'Envoi gratuit sous 5 jours.' }]

test.group('Annuaire des services', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createService(slug: string, name: string) {
    return Service.create({
      slug,
      name,
      category: 'demarches',
      summary: 'Résumé',
      description: 'Description complète',
      hours: 'Lundi au vendredi : 8 h – 16 h',
      phone: '02 69 61 10 01',
      email: `${slug}@novaterra.test`,
      address: 'Hôtel de ville',
      procedures: PROCEDURES,
    })
  }

  test('GET /api/services liste les services par nom, sans connexion', async ({
    client,
    assert,
  }) => {
    await createService('urbanisme-test', 'Urbanisme test')
    await createService('etat-civil-test', 'État civil test')

    const response = await client.get('/api/services')
    response.assertStatus(200)
    const slugs = response.body().map((s: { slug: string }) => s.slug)
    assert.isBelow(slugs.indexOf('etat-civil-test'), slugs.indexOf('urbanisme-test'))
    assert.properties(response.body()[0], ['slug', 'name', 'category', 'summary'])
  })

  test('GET /api/services/:slug renvoie la fiche complète', async ({ client }) => {
    await createService('etat-civil-test', 'État civil test')

    const response = await client.get('/api/services/etat-civil-test')
    response.assertStatus(200)
    response.assertBodyContains({
      slug: 'etat-civil-test',
      hours: 'Lundi au vendredi : 8 h – 16 h',
      email: 'etat-civil-test@novaterra.test',
      procedures: PROCEDURES,
    })
  })

  test('GET /api/services/:slug renvoie 404 pour un service inconnu', async ({ client }) => {
    const response = await client.get('/api/services/inconnu')
    response.assertStatus(404)
    response.assertBodyContains({ error: "Ce service n'existe pas." })
  })

  test('GET /api/meta expose les thématiques de services', async ({ client, assert }) => {
    const response = await client.get('/api/meta')
    response.assertStatus(200)
    assert.deepInclude(response.body().serviceCategories, {
      value: 'demarches',
      label: 'Démarches administratives',
    })
  })
})

test.group('Localisation des services', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function create(
    slug: string,
    quartier: 'horizon' | 'port',
    category: 'demarches' | 'famille' = 'demarches'
  ) {
    return Service.create({
      slug,
      name: slug,
      category,
      summary: 'Résumé',
      description: 'Description',
      hours: 'Lundi : 8 h – 16 h',
      phone: '02 69 61 10 01',
      email: null,
      address: '3 rue du Port, Nova Terra',
      quartier,
      latitude: -21.1176,
      longitude: 55.5498,
      procedures: [],
    })
  }

  test('la liste expose adresse, quartier et coordonnées numériques, sans connexion', async ({
    client,
    assert,
  }) => {
    await create('loc-port', 'port')
    const response = await client.get('/api/services')
    response.assertStatus(200)
    const item = response.body().find((s: { slug: string }) => s.slug === 'loc-port')
    assert.equal(item.quartier, 'port')
    assert.equal(item.address, '3 rue du Port, Nova Terra')
    assert.equal(item.latitude, -21.1176)
    assert.equal(item.longitude, 55.5498)
    assert.property(item, 'hours')
  })

  test('la fiche expose quartier et coordonnées', async ({ client }) => {
    await create('loc-fiche', 'horizon')
    const response = await client.get('/api/services/loc-fiche')
    response.assertStatus(200)
    response.assertBodyContains({ quartier: 'horizon', latitude: -21.1176, longitude: 55.5498 })
  })

  test('?quartier= et ?category= filtrent la liste', async ({ client, assert }) => {
    await create('loc-a', 'horizon')
    await create('loc-b', 'port', 'famille')

    const byQuartier = await client.get('/api/services').qs({ quartier: 'port' })
    byQuartier.assertStatus(200)
    const slugs = byQuartier.body().map((s: { slug: string }) => s.slug)
    assert.include(slugs, 'loc-b')
    assert.notInclude(slugs, 'loc-a')

    const byCategory = await client.get('/api/services').qs({ category: 'famille' })
    const catSlugs = byCategory.body().map((s: { slug: string }) => s.slug)
    assert.include(catSlugs, 'loc-b')
    assert.notInclude(catSlugs, 'loc-a')
  })

  test('un quartier inconnu renvoie 422', async ({ client }) => {
    const response = await client.get('/api/services').qs({ quartier: 'atlantide' })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'quartier' }] })
  })

  test('GET /api/meta expose les quartiers', async ({ client, assert }) => {
    const response = await client.get('/api/meta')
    assert.deepInclude(response.body().quartiers, { value: 'port', label: 'Le Port' })
  })
})
