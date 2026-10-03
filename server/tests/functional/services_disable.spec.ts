import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import User from '#models/user'
import type { Role } from '#constants/domain'

test.group('Désactivation d’un service (admin)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const URL = '/api/admin/services/etat-civil-test'
  const BODY = {
    reason: 'Panne du logiciel de rendez-vous.',
    action: 'Contactez le guichet au 02 69 61 10 01.',
    returnDate: '2030-02-01',
  }

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
      description: 'Description',
      hours: 'Lundi',
      phone: null,
      email: null,
      address: null,
      procedures: [],
    })
  }

  test('un admin désactive puis réactive un service, visible côté habitant', async ({ client }) => {
    await createService()
    const token = await tokenFor('admin')

    const off = await client.put(`${URL}/disable`).bearerToken(token).json(BODY)
    off.assertStatus(200)
    off.assertBodyContains({
      availability: 'desactive',
      availabilityMessage: BODY.reason,
      availabilityAction: BODY.action,
      availabilityUntil: BODY.returnDate,
    })
    const show = await client.get('/api/services/etat-civil-test')
    show.assertBodyContains({ availability: 'desactive', availabilityAction: BODY.action })
    const list = await client.get('/api/services')
    list.assertBodyContains([{ slug: 'etat-civil-test', availabilityAction: BODY.action }])

    const on = await client.put(`${URL}/enable`).bearerToken(token)
    on.assertStatus(200)
    on.assertBodyContains({ availability: 'disponible', availabilityMessage: null })
  })

  test('désactiver : 401 sans token, 403 pour agent et citoyen, 404, 422', async ({ client }) => {
    await createService()

    const anonymous = await client.put(`${URL}/disable`).json(BODY)
    anonymous.assertStatus(401)
    for (const role of ['agent', 'citoyen'] as const) {
      const token = await tokenFor(role)
      const off = await client.put(`${URL}/disable`).bearerToken(token).json(BODY)
      off.assertStatus(403)
      const on = await client.put(`${URL}/enable`).bearerToken(token)
      on.assertStatus(403)
    }
    const admin = await tokenFor('admin')
    const missing = await client
      .put('/api/admin/services/inconnu/disable')
      .bearerToken(admin)
      .json(BODY)
    missing.assertStatus(404)
    const invalid = await client.put(`${URL}/disable`).bearerToken(admin).json({ reason: '' })
    invalid.assertStatus(422)
  })

  test('un agent ne peut pas poser le statut « désactivé » via la route agent', async ({
    client,
  }) => {
    await createService()
    const response = await client
      .patch('/api/agent/services/etat-civil-test/availability')
      .bearerToken(await tokenFor('agent'))
      .json({ status: 'desactive', message: 'Test' })
    response.assertStatus(422)
  })

  test('la démarche est refusée (409) sur un service désactivé, acceptée sinon', async ({
    client,
  }) => {
    const service = await createService()
    const token = await tokenFor('citoyen')
    const body = {
      subject: 'Acte de naissance',
      service: 'etat_civil',
      message: 'Je souhaite obtenir une copie de mon acte de naissance.',
      serviceSlug: 'etat-civil-test',
    }

    service.merge({
      availability: 'desactive',
      availabilityMessage: BODY.reason,
      availabilityAction: BODY.action,
    })
    await service.save()
    const blocked = await client.post('/api/demandes').bearerToken(token).json(body)
    blocked.assertStatus(409)
    blocked.assertBodyContains({
      error: `Ce service est désactivé : ${BODY.reason}. ${BODY.action}`,
    })

    service.merge({ availability: 'disponible' })
    await service.save()
    const ok = await client.post('/api/demandes').bearerToken(token).json(body)
    ok.assertStatus(201)
  })
})
