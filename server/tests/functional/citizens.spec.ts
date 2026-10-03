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

test.group('Comptes citoyens (F34)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token, 403 pour un citoyen sur les 3 routes', async ({ client }) => {
    const { user, token } = await login('citoyen')
    for (const [method, path] of [
      ['get', '/api/agent/citizens'],
      ['post', `/api/agent/citizens/${user.id}/disable`],
      ['post', `/api/agent/citizens/${user.id}/enable`],
    ] as const) {
      const anonymous = await client[method](path)
      anonymous.assertStatus(401)
      const forbidden = await client[method](path).bearerToken(token)
      forbidden.assertStatus(403)
    }
  })

  test('la liste ne contient que des citoyens, sans mot de passe, avec recherche', async ({
    client,
    assert,
  }) => {
    const { token } = await login('agent')
    await login('admin')
    await login('citoyen', 'lea.martin@test.local')
    await login('citoyen', 'paul@test.local')

    const all = await client.get('/api/agent/citizens?q=test.local').bearerToken(token)
    all.assertStatus(200)
    assert.lengthOf(all.body().data, 2)
    assert.isUndefined(all.body().data[0].password)
    assert.isNull(all.body().data[0].disabledAt)

    const found = await client.get('/api/agent/citizens?q=LEA.mar').bearerToken(token)
    assert.lengthOf(found.body().data, 1)
    assert.equal(found.body().data[0].email, 'lea.martin@test.local')

    const wildcard = await client.get('/api/agent/citizens?q=%25').bearerToken(token)
    assert.lengthOf(wildcard.body().data, 0)
  })

  test('désactiver puis réactiver : connexion refusée, session révoquée', async ({
    client,
    assert,
  }) => {
    const { token: agentToken } = await login('agent')
    const { user: citizen, token: citizenToken } = await login('citoyen')

    const off = await client
      .post(`/api/agent/citizens/${citizen.id}/disable`)
      .bearerToken(agentToken)
    off.assertStatus(200)
    assert.isNotNull(off.body().disabledAt)
    assert.isUndefined(off.body().password)

    const revoked = await client.get('/api/me').bearerToken(citizenToken)
    revoked.assertStatus(401)
    const refused = await client
      .post('/api/auth/login')
      .json({ email: citizen.email, password: 'motdepasse123' })
    refused.assertStatus(403)
    assert.match(refused.body().error, /désactivé/)

    const on = await client.post(`/api/agent/citizens/${citizen.id}/enable`).bearerToken(agentToken)
    on.assertStatus(200)
    assert.isNull(on.body().disabledAt)
    const ok = await client
      .post('/api/auth/login')
      .json({ email: citizen.email, password: 'motdepasse123' })
    ok.assertStatus(200)
  })

  test('un compte agent ou admin n’est pas gérable ici (404), id invalide (422)', async ({
    client,
  }) => {
    const { token } = await login('agent')
    const { user: admin } = await login('admin')

    const onAdmin = await client.post(`/api/agent/citizens/${admin.id}/disable`).bearerToken(token)
    onAdmin.assertStatus(404)
    const unknown = await client.post('/api/agent/citizens/999999/disable').bearerToken(token)
    unknown.assertStatus(404)
    const invalid = await client.post('/api/agent/citizens/abc/disable').bearerToken(token)
    invalid.assertStatus(422)
  })
})
