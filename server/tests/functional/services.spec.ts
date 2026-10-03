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

  test('GET /api/urgences liste seulement les services d’urgence, sans connexion', async ({
    client,
    assert,
  }) => {
    await createService('etat-civil-test', 'État civil test')
    const hospital = await createService('hopital-test', 'Hôpital test')
    hospital.category = 'urgence_sante'
    await hospital.save()

    const response = await client.get('/api/urgences')
    response.assertStatus(200)
    const slugs = response.body().map((s: { slug: string }) => s.slug)
    assert.include(slugs, 'hopital-test')
    assert.notInclude(slugs, 'etat-civil-test')
    assert.properties(response.body()[0], ['name', 'hours', 'phone', 'address'])
  })

  test('GET /api/meta expose les numéros d’urgence', async ({ client, assert }) => {
    const response = await client.get('/api/meta')
    response.assertStatus(200)
    assert.deepInclude(response.body().emergencyNumbers, {
      value: '15',
      label: 'SAMU',
    })
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
