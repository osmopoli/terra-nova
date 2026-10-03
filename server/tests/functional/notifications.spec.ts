import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function login(role: Role, email = `${role}@test.local`) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const VALID = {
  subject: 'Lampadaire éteint',
  service: 'voirie',
  message: 'Le lampadaire devant le 12 rue des Palmiers est éteint depuis lundi.',
}

test.group('Notifications de changement d’état (WEBC-76)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token', async ({ client }) => {
    const list = await client.get('/api/me/notifications')
    list.assertStatus(401)
    const read = await client.post('/api/me/notifications/1/read')
    read.assertStatus(401)
  })

  test('un changement de statut notifie l’auteur seulement, puis la lecture décrémente le compteur', async ({
    client,
    assert,
  }) => {
    const alice = await login('citoyen', 'alice@test.local')
    const bob = await login('citoyen', 'bob@test.local')
    const agent = await login('agent')
    const created = await client.post('/api/contact-messages').bearerToken(alice).json(VALID)
    const code = created.body().trackingCode

    const first = await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(agent)
      .json({ status: 'en_cours' })
    first.assertStatus(200)
    // Même statut : pas de doublon.
    await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(agent)
      .json({ status: 'en_cours' })

    const list = await client.get('/api/me/notifications').bearerToken(alice)
    list.assertStatus(200)
    assert.equal(list.body().unread, 1)
    const [n] = list.body().notifications
    assert.equal(n.trackingCode, code)
    assert.equal(n.status, 'en_cours')
    assert.equal(n.subject, VALID.subject)
    assert.isString(n.action)
    assert.equal(n.statusLabel, 'En cours')
    assert.isNull(n.readAt)
    assert.notProperty(n, 'userId')

    const other = await client.get('/api/me/notifications').bearerToken(bob)
    assert.equal(other.body().unread, 0)
    assert.lengthOf(other.body().notifications, 0)

    const read = await client.post(`/api/me/notifications/${n.id}/read`).bearerToken(alice)
    read.assertStatus(200)
    assert.isNotNull(read.body().readAt)
    const after = await client.get('/api/me/notifications').bearerToken(alice)
    assert.equal(after.body().unread, 0)
  })

  test('404 sur la notification d’un autre utilisateur, qui reste non lue', async ({
    client,
    assert,
  }) => {
    const alice = await login('citoyen', 'alice@test.local')
    const bob = await login('citoyen', 'bob@test.local')
    const agent = await login('agent')
    const created = await client.post('/api/contact-messages').bearerToken(alice).json(VALID)
    const code = created.body().trackingCode
    await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(agent)
      .json({ status: 'traite' })
    const before = await client.get('/api/me/notifications').bearerToken(alice)
    const id = before.body().notifications[0].id

    const response = await client.post(`/api/me/notifications/${id}/read`).bearerToken(bob)
    response.assertStatus(404)
    const still = await client.get('/api/me/notifications').bearerToken(alice)
    assert.equal(still.body().unread, 1)
  })

  test('GET /api/meta expose les actions attendues par statut', async ({ client, assert }) => {
    const response = await client.get('/api/meta')
    assert.isArray(response.body().contactStatusActions)
    assert.lengthOf(response.body().contactStatusActions, 3)
  })
})
