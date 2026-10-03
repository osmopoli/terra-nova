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
  return { user, token: token.value!.release() }
}

test.group('Contrôle d’accès : espace agent', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /api/agent/overview refuse sans token (401)', async ({ client }) => {
    const response = await client.get('/api/agent/overview')
    response.assertStatus(401)
  })

  test('un citoyen reçoit 403 sur une route agent', async ({ client, assert }) => {
    const { token } = await login('citoyen')
    const response = await client.get('/api/agent/overview').bearerToken(token)
    response.assertStatus(403)
    assert.isString(response.body().error)
  })

  test('agent et admin accèdent à l’espace agent', async ({ client, assert }) => {
    for (const role of ['agent', 'admin'] as const) {
      const { token } = await login(role)
      const response = await client.get('/api/agent/overview').bearerToken(token)
      response.assertStatus(200)
      assert.equal(response.body().role, role)
      assert.isAtLeast(response.body().accounts[role], 1)
    }
  })
})

test.group('Contrôle d’accès : espace admin', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /api/admin/users : 401 sans token, 403 citoyen et agent', async ({ client }) => {
    const anonymous = await client.get('/api/admin/users')
    anonymous.assertStatus(401)
    for (const role of ['citoyen', 'agent'] as const) {
      const { token } = await login(role)
      const response = await client.get('/api/admin/users').bearerToken(token)
      response.assertStatus(403)
    }
  })

  test('GET /api/admin/users liste et filtre par rôle pour un admin', async ({
    client,
    assert,
  }) => {
    const { token } = await login('admin')
    await login('citoyen')
    const response = await client.get('/api/admin/users').qs({ role: 'citoyen' }).bearerToken(token)
    response.assertStatus(200)
    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].role, 'citoyen')
    assert.notProperty(response.body().data[0], 'password')
  })

  test('GET /api/admin/users rejette un rôle inconnu (422)', async ({ client }) => {
    const { token } = await login('admin')
    const response = await client.get('/api/admin/users').qs({ role: 'pirate' }).bearerToken(token)
    response.assertStatus(422)
  })

  test('un citoyen ne peut pas se promouvoir en forgeant la requête (403)', async ({
    client,
    assert,
  }) => {
    const { user, token } = await login('citoyen')
    const response = await client
      .patch(`/api/admin/users/${user.id}/role`)
      .bearerToken(token)
      .json({ role: 'admin' })
    response.assertStatus(403)
    await user.refresh()
    assert.equal(user.role, 'citoyen')
  })

  test('un admin change le rôle d’un compte, ses jetons sont révoqués', async ({
    client,
    assert,
  }) => {
    const { token } = await login('admin')
    const target = await login('citoyen')

    const response = await client
      .patch(`/api/admin/users/${target.user.id}/role`)
      .bearerToken(token)
      .json({ role: 'agent' })
    response.assertStatus(200)
    assert.equal(response.body().role, 'agent')

    const stale = await client.get('/api/me').bearerToken(target.token)
    stale.assertStatus(401)
  })

  test('PATCH rôle : 404 compte inconnu, 409 sur soi-même, 422 rôle invalide', async ({
    client,
  }) => {
    const { user, token } = await login('admin')
    const missing = await client
      .patch('/api/admin/users/999999/role')
      .bearerToken(token)
      .json({ role: 'agent' })
    missing.assertStatus(404)

    const self = await client
      .patch(`/api/admin/users/${user.id}/role`)
      .bearerToken(token)
      .json({ role: 'citoyen' })
    self.assertStatus(409)

    const invalid = await client
      .patch(`/api/admin/users/${user.id}/role`)
      .bearerToken(token)
      .json({ role: 'roi' })
    invalid.assertStatus(422)
  })
})
