import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import type { Role } from '#constants/domain'
import { ingest, type WebcupPayload } from '#services/webcup_sync'

async function login(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const request = (code: string, difficulty: number, xp: number) => ({
  id: Math.floor(Math.random() * 1000),
  request_code: code,
  requester_name: 'Mairie de Terra Nova',
  message_public: `Besoin ${code}`,
  difficulty_level: difficulty,
  xp_total: xp,
  visible_since_wave: 0,
})

const payload = (...requests: ReturnType<typeof request>[]): WebcupPayload => ({
  session: { status: 'active', current_wave: 0, minutes_until_next_wave: 73 },
  requests,
})

test.group('WEBC-2 : demandes Webcup synchronisées', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('dédoublonne sur request_code et ne signale que les nouveautés', async ({ assert }) => {
    assert.deepEqual(await ingest(payload(request('D01', 1, 250), request('D07', 2, 500))), [
      'D01',
      'D07',
    ])
    // Même code, autre id : c'est la même demande.
    assert.deepEqual(await ingest(payload(request('D01', 1, 300), request('D19', 3, 750))), ['D19'])
  })

  test('GET /api/agent/webcup/requests : 401 sans token, 403 pour un citoyen', async ({
    client,
  }) => {
    const anonymous = await client.get('/api/agent/webcup/requests')
    anonymous.assertStatus(401)
    const token = await login('citoyen')
    const citoyen = await client.get('/api/agent/webcup/requests').bearerToken(token)
    citoyen.assertStatus(403)
  })

  test('un agent voit les demandes, triées, avec l’indicateur nouvelle', async ({
    client,
    assert,
  }) => {
    await ingest(payload(request('D01', 1, 250), request('D19', 3, 750), request('D01', 1, 300)))
    const token = await login('agent')

    const response = await client.get('/api/agent/webcup/requests').bearerToken(token)
    response.assertStatus(200)
    const body = response.body()
    assert.deepEqual(
      body.requests.map((r: { request_code: string }) => r.request_code),
      ['D19', 'D01']
    )
    assert.equal(body.newCount, 2)
    assert.isTrue(body.requests[0].isNew)
    assert.equal(body.requests[1].xp_total, 300)
    assert.equal(body.session.current_wave, 0)
    assert.isAtMost(body.session.minutes_until_next_wave, 73)
    assert.isString(body.session.next_wave_at)
  })

  test('marquer comme vues retire l’indicateur, onlyNew filtre', async ({ client, assert }) => {
    await ingest(payload(request('D01', 1, 250), request('D03', 1, 250)))
    const token = await login('admin')

    const seen = await client
      .post('/api/agent/webcup/requests/seen')
      .bearerToken(token)
      .json({ codes: ['D01'] })
    seen.assertStatus(200)
    assert.equal(seen.body().marked, 1)

    const onlyNew = await client
      .get('/api/agent/webcup/requests')
      .qs({ onlyNew: 'true' })
      .bearerToken(token)
    onlyNew.assertStatus(200)
    assert.deepEqual(
      onlyNew.body().requests.map((r: { request_code: string }) => r.request_code),
      ['D03']
    )

    const all = await client.post('/api/agent/webcup/requests/seen').bearerToken(token).json({})
    assert.equal(all.body().marked, 1)
  })

  test('paramètres invalides : 422', async ({ client }) => {
    const token = await login('agent')
    const badQuery = await client
      .get('/api/agent/webcup/requests')
      .qs({ onlyNew: 'peut-etre' })
      .bearerToken(token)
    badQuery.assertStatus(422)
    const badCodes = await client
      .post('/api/agent/webcup/requests/seen')
      .bearerToken(token)
      .json({ codes: 'D01' })
    badCodes.assertStatus(422)
  })

  test('POST /api/admin/webcup/refresh est réservé à l’admin', async ({ client }) => {
    const token = await login('agent')
    const response = await client.post('/api/admin/webcup/refresh').bearerToken(token)
    response.assertStatus(403)
  })
})
