import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import User from '#models/user'
import type { Role } from '#constants/domain'

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

test.group('Disponibilité des services', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const URL = '/api/agent/services/etat-civil-test/availability'

  async function tokenFor(role: Role) {
    const user = await User.create({
      fullName: `Compte ${role}`,
      email: `${role}@test.local`,
      password: 'motdepasse123',
      role,
    })
    const token = await User.accessTokens.create(user)
    return token.value!.release()
  }

  async function createService() {
    return Service.create({
      slug: 'etat-civil-test',
      name: 'État civil test',
      category: 'demarches',
      summary: 'Résumé',
      description: 'Description complète',
      hours: 'Lundi au vendredi : 8 h – 16 h',
      phone: null,
      email: null,
      address: null,
      procedures: [],
    })
  }

  test('un agent passe un service en maintenance, visible dans la liste et la fiche', async ({
    client,
  }) => {
    await createService()
    const token = await tokenFor('agent')

    const response = await client.patch(URL).bearerToken(token).json({
      status: 'maintenance',
      message: 'Mise à jour du logiciel.',
      returnDate: '2030-01-15',
    })
    response.assertStatus(200)
    response.assertBodyContains({
      availability: 'maintenance',
      availabilityMessage: 'Mise à jour du logiciel.',
      availabilityUntil: '2030-01-15',
    })

    const show = await client.get('/api/services/etat-civil-test')
    show.assertBodyContains({ availability: 'maintenance', availabilityUntil: '2030-01-15' })
    const list = await client.get('/api/services')
    list.assertBodyContains([{ slug: 'etat-civil-test', availability: 'maintenance' }])
  })

  test('un nouveau service est disponible ; le repasser en disponible efface message et date', async ({
    client,
  }) => {
    const service = await createService()
    await service.refresh()
    const token = await tokenFor('admin')
    await client
      .patch(URL)
      .bearerToken(token)
      .json({ status: 'incident', message: 'Panne réseau.' })

    const response = await client.patch(URL).bearerToken(token).json({ status: 'disponible' })
    response.assertStatus(200)
    response.assertBodyContains({
      availability: 'disponible',
      availabilityMessage: null,
      availabilityUntil: null,
    })
  })

  test('le statut est validé (422) et un message est exigé pour un service indisponible', async ({
    client,
  }) => {
    await createService()
    const token = await tokenFor('agent')

    const bad = await client.patch(URL).bearerToken(token).json({ status: 'inconnu' })
    bad.assertStatus(422)
    bad.assertBodyContains({ errors: [{ field: 'status' }] })

    const noMessage = await client.patch(URL).bearerToken(token).json({ status: 'incident' })
    noMessage.assertStatus(422)
    noMessage.assertBodyContains({ errors: [{ field: 'message' }] })
  })

  test('changer le statut : 401 sans token, 403 pour un citoyen, 404 si inconnu', async ({
    client,
  }) => {
    await createService()
    const body = { status: 'incident', message: 'Panne réseau.' }

    const anonymous = await client.patch(URL).json(body)
    anonymous.assertStatus(401)
    const citizen = await client
      .patch(URL)
      .bearerToken(await tokenFor('citoyen'))
      .json(body)
    citizen.assertStatus(403)

    const missing = await client
      .patch('/api/agent/services/inconnu/availability')
      .bearerToken(await tokenFor('agent'))
      .json(body)
    missing.assertStatus(404)
  })
})
