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

test.group('Historique des modifications (WEBC-75)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /api/agent/history/... : 401 sans token, 403 citoyen', async ({ client }) => {
    const anonymous = await client.get('/api/agent/history/account/1')
    anonymous.assertStatus(401)
    const { token } = await login('citoyen')
    const forbidden = await client.get('/api/agent/history/account/1').bearerToken(token)
    forbidden.assertStatus(403)
  })

  test('renvoie le dernier modificateur et les changements champ par champ', async ({
    client,
    assert,
  }) => {
    const admin = await login('admin')
    const agent = await login('agent')
    const target = await User.create({
      fullName: 'Cible',
      email: 'cible@test.local',
      password: 'motdepasse123',
      role: 'citoyen',
    })
    await client
      .patch(`/api/admin/users/${target.id}/role`)
      .bearerToken(admin.token)
      .json({ role: 'agent' })

    const response = await client
      .get(`/api/agent/history/account/${target.id}`)
      .bearerToken(agent.token)
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.lastModifiedBy.name, 'Compte admin')
    assert.lengthOf(body.history, 1)
    assert.deepEqual(body.history[0].changes, [
      { field: 'role', before: 'citoyen', after: 'agent' },
    ])

    const unknown = await client.get('/api/agent/history/inconnu/1').bearerToken(agent.token)
    unknown.assertStatus(422)
    const empty = await client.get('/api/agent/history/account/999999').bearerToken(agent.token)
    assert.isNull(empty.body().lastModifiedBy)
  })

  test('PATCH /api/agent/contact-messages/:code/status : refus citoyen, nominal audité', async ({
    client,
    assert,
  }) => {
    const citizen = await login('citoyen')
    const agent = await login('agent')
    const created = await client.post('/api/contact-messages').bearerToken(citizen.token).json({
      subject: 'Lampadaire cassé',
      service: 'voirie',
      message: 'Rue des Lilas, depuis hier.',
    })
    created.assertStatus(201)
    const code = created.body().trackingCode

    const forbidden = await client
      .patch(`/api/agent/contact-messages/${code}/status`)
      .bearerToken(citizen.token)
      .json({ status: 'traite' })
    forbidden.assertStatus(403)

    const ok = await client
      .patch(`/api/agent/contact-messages/${code}/status`)
      .bearerToken(agent.token)
      .json({ status: 'en_cours' })
    ok.assertStatus(200)

    const repeat = await client
      .patch(`/api/agent/contact-messages/${code}/status`)
      .bearerToken(agent.token)
      .json({ status: 'en_cours' })
    repeat.assertStatus(409)
    const invalid = await client
      .patch(`/api/agent/contact-messages/${code}/status`)
      .bearerToken(agent.token)
      .json({ status: 'zzz' })
    invalid.assertStatus(422)

    const history = await client
      .get(`/api/agent/history/contact_message/${code}`)
      .bearerToken(agent.token)
    assert.equal(history.body().lastModifiedBy.name, 'Compte agent')
    assert.deepEqual(history.body().history[0].changes, [
      { field: 'status', before: 'nouveau', after: 'en_cours' },
    ])
  })

  test('PATCH /api/me enregistre l’auteur et l’ancienne valeur du nom', async ({
    client,
    assert,
  }) => {
    const agent = await login('agent')
    const reader = await login('admin')
    await client.patch('/api/me').bearerToken(agent.token).json({ fullName: 'Nouveau Nom' })
    const history = await client
      .get(`/api/agent/history/account/${agent.user.id}`)
      .bearerToken(reader.token)
    assert.deepEqual(history.body().history[0].changes, [
      { field: 'fullName', before: 'Compte agent', after: 'Nouveau Nom' },
    ])
  })
})
