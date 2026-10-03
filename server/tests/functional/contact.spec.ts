import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

async function login(email: string) {
  const user = await User.create({
    fullName: 'Habitant test',
    email,
    password: 'motdepasse123',
    role: 'citoyen',
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const VALID = {
  subject: 'Lampadaire éteint',
  service: 'voirie',
  message: 'Le lampadaire devant le 12 rue des Palmiers est éteint depuis lundi.',
}

test.group('Contact des services municipaux', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token', async ({ client }) => {
    const response = await client.post('/api/contact-messages').json(VALID)
    response.assertStatus(401)
  })

  test('envoi : 201 avec numéro de suivi et statut nouveau', async ({ client, assert }) => {
    const token = await login('habitant@test.local')
    const response = await client.post('/api/contact-messages').bearerToken(token).json(VALID)
    response.assertStatus(201)
    assert.match(response.body().trackingCode, /^NT-[A-Z2-9]{6}$/)
    assert.equal(response.body().status, 'nouveau')
    assert.equal(response.body().service, 'voirie')
    assert.notProperty(response.body(), 'userId')
  })

  test('validation : 422 sur service inconnu et message trop court', async ({ client, assert }) => {
    const token = await login('habitant@test.local')
    const response = await client
      .post('/api/contact-messages')
      .bearerToken(token)
      .json({ subject: 'Bonjour', service: 'pirate', message: 'court', status: 'traite' })
    response.assertStatus(422)
    const fields = response.body().errors.map((e: { field: string }) => e.field)
    assert.includeMembers(fields, ['service', 'message'])
  })

  test('chaque habitant ne voit que ses propres messages', async ({ client, assert }) => {
    const alice = await login('alice@test.local')
    const bob = await login('bob@test.local')
    const created = await client.post('/api/contact-messages').bearerToken(alice).json(VALID)
    const code = created.body().trackingCode

    const own = await client.get('/api/contact-messages').bearerToken(alice)
    own.assertStatus(200)
    assert.lengthOf(own.body(), 1)

    const other = await client.get('/api/contact-messages').bearerToken(bob)
    assert.lengthOf(other.body(), 0)

    const detail = await client.get(`/api/contact-messages/${code}`).bearerToken(alice)
    detail.assertStatus(200)
    const stolen = await client.get(`/api/contact-messages/${code}`).bearerToken(bob)
    stolen.assertStatus(404)
  })
})
