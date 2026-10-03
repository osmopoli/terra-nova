import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function tokenFor(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}-signalement@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const LAMP = {
  category: 'eclairage',
  message: 'Le lampadaire devant le numéro 12 ne s’allume plus depuis trois jours.',
  location: '12 rue des Filaos, quartier sud',
  latitude: -12.7806,
  longitude: 45.2279,
}

test.group('Signaler un problème (F25)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un habitant signale un lampadaire cassé avec son emplacement', async ({
    client,
    assert,
  }) => {
    const token = await tokenFor('citoyen')
    const response = await client.post('/api/demandes/signalements').bearerToken(token).json(LAMP)
    response.assertStatus(201)
    const body = response.body()
    assert.equal(body.kind, 'signalement')
    assert.equal(body.service, 'voirie')
    assert.equal(body.subject, 'Signalement : Éclairage public (lampadaire, feu)')
    assert.equal(body.location, LAMP.location)
    assert.closeTo(body.latitude, LAMP.latitude, 0.000001)
    assert.match(body.reference, /^NT-\d{6}$/)
    assert.lengthOf(body.steps, 1)

    const list = await client.get('/api/demandes').bearerToken(token)
    assert.equal(list.body().data[0].kind, 'signalement')
    assert.equal(list.body().data[0].location, LAMP.location)
  })

  test('la position GPS est facultative', async ({ client }) => {
    const response = await client
      .post('/api/demandes/signalements')
      .bearerToken(await tokenFor('citoyen'))
      .json({ ...LAMP, latitude: undefined, longitude: undefined })
    response.assertStatus(201)
    response.assertBodyContains({ latitude: null, longitude: null })
  })

  test('validation : type inconnu, lieu manquant, latitude hors bornes', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/demandes/signalements')
      .bearerToken(await tokenFor('citoyen'))
      .json({ ...LAMP, category: 'meteorite', location: '', latitude: 120 })
    response.assertStatus(422)
    const fields = response.body().errors.map((e: { field: string }) => e.field)
    assert.includeMembers(fields, ['category', 'location', 'latitude'])
  })

  test('réservé aux habitants : 401 sans token, 403 pour un agent', async ({ client }) => {
    const anonymous = await client.post('/api/demandes/signalements').json(LAMP)
    anonymous.assertStatus(401)
    const agent = await client
      .post('/api/demandes/signalements')
      .bearerToken(await tokenFor('agent'))
      .json(LAMP)
    agent.assertStatus(403)
  })
})
