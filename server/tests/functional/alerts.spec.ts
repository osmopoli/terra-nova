import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Alert from '#models/alert'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function tokenFor(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}-alertes@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const inHours = (hours: number) => DateTime.now().plus({ hours })

test.group('Alertes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un admin publie une alerte immédiate, visible sans connexion', async ({
    client,
    assert,
  }) => {
    const token = await tokenFor('admin')
    const created = await client
      .post('/api/alerts')
      .bearerToken(token)
      .json({
        title: 'Coupure d’eau',
        message: 'Quartier Nord, de 14 h à 18 h.',
        level: 'urgent',
        endsAt: inHours(4).toISO(),
      })
    created.assertStatus(201)
    assert.equal(created.body().level, 'urgent')
    assert.notProperty(created.body(), 'createdBy')

    const active = await client.get('/api/alerts/active')
    active.assertStatus(200)
    assert.deepEqual(
      active.body().map((a: Alert) => a.title),
      ['Coupure d’eau']
    )
  })

  test('seules les alertes dans leur période sont actives, les plus critiques d’abord', async ({
    client,
    assert,
  }) => {
    const base = { message: 'Détails du message.' }
    await Alert.createMany([
      { ...base, title: 'Info', level: 'info', startsAt: inHours(-2), endsAt: inHours(2) },
      { ...base, title: 'Urgent', level: 'urgent', startsAt: inHours(-1), endsAt: inHours(1) },
      { ...base, title: 'Expirée', level: 'urgent', startsAt: inHours(-5), endsAt: inHours(-1) },
      { ...base, title: 'À venir', level: 'urgent', startsAt: inHours(1), endsAt: inHours(5) },
    ])

    const response = await client.get('/api/alerts/active')
    response.assertStatus(200)
    assert.deepEqual(
      response.body().map((a: Alert) => a.title),
      ['Urgent', 'Info']
    )
  })

  test('création refusée sans token (401) et hors admin (403)', async ({ client }) => {
    const body = {
      title: 'Test',
      message: 'Message test',
      level: 'info',
      endsAt: inHours(1).toISO(),
    }

    const anonymous = await client.post('/api/alerts').json(body)
    anonymous.assertStatus(401)

    for (const role of ['citoyen', 'agent'] as const) {
      const response = await client
        .post('/api/alerts')
        .bearerToken(await tokenFor(role))
        .json(body)
      response.assertStatus(403)
      response.assertBodyContains({
        error: "Accès refusé : votre profil n'autorise pas cette action.",
      })
    }

    const list = await client.get('/api/alerts')
    list.assertStatus(401)
  })

  test('validation : niveau inconnu, fin avant début', async ({ client, assert }) => {
    const token = await tokenFor('admin')

    const badLevel = await client
      .post('/api/alerts')
      .bearerToken(token)
      .json({ title: 'Test', message: 'Message test', level: 'rouge', endsAt: inHours(1).toISO() })
    badLevel.assertStatus(422)
    assert.equal(badLevel.body().errors[0].field, 'level')

    const badPeriod = await client
      .post('/api/alerts')
      .bearerToken(token)
      .json({
        title: 'Test',
        message: 'Message test',
        level: 'info',
        startsAt: inHours(2).toISO(),
        endsAt: inHours(1).toISO(),
      })
    badPeriod.assertStatus(422)
    badPeriod.assertBodyContains({ errors: [{ field: 'endsAt' }] })
  })

  test('un admin liste, modifie et supprime une alerte', async ({ client, assert }) => {
    const token = await tokenFor('admin')
    const alert = await Alert.create({
      title: 'Fête de la ville',
      message: 'Programme en mairie.',
      level: 'info',
      startsAt: inHours(1),
      endsAt: inHours(10),
    })

    const list = await client.get('/api/alerts').bearerToken(token)
    list.assertStatus(200)
    assert.lengthOf(list.body(), 1)

    const updated = await client
      .patch(`/api/alerts/${alert.id}`)
      .bearerToken(token)
      .json({ level: 'important', startsAt: inHours(-1).toISO() })
    updated.assertStatus(200)
    assert.equal(updated.body().level, 'important')
    const active = await client.get('/api/alerts/active')
    assert.lengthOf(active.body(), 1)

    const removed = await client.delete(`/api/alerts/${alert.id}`).bearerToken(token)
    removed.assertStatus(204)
    assert.isNull(await Alert.find(alert.id))

    const missing = await client.delete(`/api/alerts/${alert.id}`).bearerToken(token)
    missing.assertStatus(404)
    missing.assertBodyContains({ error: 'Alerte introuvable.' })
  })
})
