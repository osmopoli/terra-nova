import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import AuditLog from '#models/audit_log'
import type { Role } from '#constants/domain'

async function login(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return { user, token: token.value!.release() }
}

test.group('Journal d’audit', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un changement de rôle crée une entrée d’audit', async ({ client, assert }) => {
    const admin = await login('admin')
    const target = await User.create({
      fullName: 'Cible',
      email: 'cible@test.local',
      password: 'motdepasse123',
      role: 'citoyen',
    })

    const response = await client
      .patch(`/api/admin/users/${target.id}/role`)
      .bearerToken(admin.token)
      .json({ role: 'agent' })
    response.assertStatus(200)

    const log = await AuditLog.query().where('action', 'role_changed').firstOrFail()
    assert.equal(log.actorId, admin.user.id)
    assert.equal(log.actorRole, 'admin')
    assert.equal(log.objectType, 'account')
    assert.equal(log.objectId, String(target.id))
    assert.include(log.beforeSummary!, 'citoyen')
    assert.include(log.afterSummary!, 'agent')
  })

  test('GET /api/agent/audit-logs : 401 sans token, 403 citoyen', async ({ client }) => {
    const anonymous = await client.get('/api/agent/audit-logs')
    anonymous.assertStatus(401)
    const { token } = await login('citoyen')
    const forbidden = await client.get('/api/agent/audit-logs').bearerToken(token)
    forbidden.assertStatus(403)
  })

  test('un agent lit le journal paginé, antichronologique et filtrable', async ({
    client,
    assert,
  }) => {
    const { token } = await login('agent')
    await AuditLog.createMany([
      { action: 'news_published', objectType: 'news', objectId: '1', actorName: 'A' },
      { action: 'role_changed', objectType: 'account', objectId: '2', actorName: 'B' },
    ])

    const all = await client.get('/api/agent/audit-logs').bearerToken(token)
    all.assertStatus(200)
    assert.lengthOf(all.body().data, 2)
    assert.equal(all.body().data[0].action, 'role_changed')

    const filtered = await client
      .get('/api/agent/audit-logs')
      .qs({ action: 'news_published' })
      .bearerToken(token)
    assert.lengthOf(filtered.body().data, 1)

    const invalid = await client
      .get('/api/agent/audit-logs')
      .qs({ action: 'inconnue' })
      .bearerToken(token)
    invalid.assertStatus(422)
  })

  test('le journal n’expose aucune route d’écriture', async ({ client }) => {
    const { token } = await login('admin')
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      const response = await client[method]('/api/agent/audit-logs').bearerToken(token)
      response.assertStatus(404)
    }
  })
})
