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

test.group('Messages des habitants : vue agent (F22)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token, 403 pour un citoyen', async ({ client }) => {
    const anonymous = await client.get('/api/agent/contact-messages')
    anonymous.assertStatus(401)
    const citizen = await login('citoyen')
    const response = await client.get('/api/agent/contact-messages').bearerToken(citizen)
    response.assertStatus(403)
  })

  test('un agent voit les messages, leur statut et le nom de l’habitant', async ({
    client,
    assert,
  }) => {
    const citizen = await login('citoyen')
    await client.post('/api/contact-messages').bearerToken(citizen).json(VALID)
    const agent = await login('agent')

    const response = await client.get('/api/agent/contact-messages').bearerToken(agent)
    response.assertStatus(200)
    const [message] = response.body().messages
    assert.equal(message.status, 'nouveau')
    assert.equal(message.citizenName, 'Compte citoyen')
    assert.notProperty(message, 'email')
    assert.notProperty(message, 'userId')
    assert.equal(response.body().counts.nouveau, 1)
  })

  test('changement de statut et filtre « à traiter »', async ({ client, assert }) => {
    const citizen = await login('citoyen')
    const first = await client.post('/api/contact-messages').bearerToken(citizen).json(VALID)
    await client.post('/api/contact-messages').bearerToken(citizen).json(VALID)
    const agent = await login('agent')
    const code = first.body().trackingCode

    const updated = await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(agent)
      .json({ status: 'traite' })
    updated.assertStatus(200)
    assert.equal(updated.body().status, 'traite')

    const todo = await client
      .get('/api/agent/contact-messages')
      .qs({ filter: 'a_traiter' })
      .bearerToken(agent)
    todo.assertStatus(200)
    assert.lengthOf(todo.body().messages, 1)
    assert.notEqual(todo.body().messages[0].trackingCode, code)

    // L'habitant voit le nouveau statut de son message.
    const own = await client.get(`/api/contact-messages/${code}`).bearerToken(citizen)
    assert.equal(own.body().status, 'traite')
  })

  test('validation : 422 sur statut inconnu, 404 sur code inconnu, 403 citoyen', async ({
    client,
  }) => {
    const citizen = await login('citoyen')
    const created = await client.post('/api/contact-messages').bearerToken(citizen).json(VALID)
    const code = created.body().trackingCode
    const agent = await login('agent')

    const bad = await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(agent)
      .json({ status: 'archive' })
    bad.assertStatus(422)

    const missing = await client
      .patch('/api/agent/contact-messages/NT-ZZZZZZ')
      .bearerToken(agent)
      .json({ status: 'traite' })
    missing.assertStatus(404)

    const forbidden = await client
      .patch(`/api/agent/contact-messages/${code}`)
      .bearerToken(citizen)
      .json({ status: 'traite' })
    forbidden.assertStatus(403)
  })
})
