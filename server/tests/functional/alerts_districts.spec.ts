import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Alert from '#models/alert'
import User from '#models/user'
import type { District, Role } from '#constants/domain'

async function tokenFor(role: Role, district: District | null = null) {
  const user = await User.create({
    fullName: `Compte ${role} ${district ?? 'sans quartier'}`,
    email: `${role}-${district ?? 'aucun'}-quartiers@test.local`,
    password: 'motdepasse123',
    role,
    district,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const inHours = (hours: number) => DateTime.now().plus({ hours })

async function seedAlerts() {
  const period = { startsAt: inHours(-1), endsAt: inHours(3) }
  await Alert.createMany([
    { ...period, title: 'Travaux', message: 'Toute la ville.', level: 'urgent' },
    {
      ...period,
      title: 'Crue sud',
      message: 'Montée des eaux.',
      level: 'important',
      districts: ['sud'],
      instructions: 'Éloignez-vous des berges.',
    },
  ])
}

test.group('Alertes ciblées par quartier (F29)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un admin publie une alerte ciblée avec consignes', async ({ client, assert }) => {
    const response = await client
      .post('/api/alerts')
      .bearerToken(await tokenFor('admin'))
      .json({
        title: 'Montée des eaux',
        message: 'Le niveau monte dans le quartier sud.',
        level: 'urgent',
        districts: ['sud'],
        instructions: 'Éloignez-vous des berges.',
        endsAt: inHours(4).toISO(),
      })
    response.assertStatus(201)
    assert.deepEqual(response.body().districts, ['sud'])
    assert.equal(response.body().instructions, 'Éloignez-vous des berges.')
  })

  test('quartier inconnu refusé (422)', async ({ client, assert }) => {
    const response = await client
      .post('/api/alerts')
      .bearerToken(await tokenFor('admin'))
      .json({
        title: 'Test',
        message: 'Message test',
        level: 'info',
        districts: ['lune'],
        endsAt: inHours(1).toISO(),
      })
    response.assertStatus(422)
    assert.match(response.body().errors[0].field, /^districts/)
  })

  test('sans connexion : toutes les alertes, sans marque « vous concerne »', async ({
    client,
    assert,
  }) => {
    await seedAlerts()
    const response = await client.get('/api/alerts/active')
    response.assertStatus(200)
    assert.deepEqual(
      response
        .body()
        .map((a: { title: string; concernsYou: boolean | null }) => [a.title, a.concernsYou]),
      [
        ['Travaux', null],
        ['Crue sud', null],
      ]
    )
  })

  test('habitant du quartier sud : son alerte passe en tête et le concerne', async ({
    client,
    assert,
  }) => {
    await seedAlerts()
    const response = await client
      .get('/api/alerts/active')
      .bearerToken(await tokenFor('citoyen', 'sud'))
    assert.deepEqual(
      response.body().map((a: { title: string; concernsYou: boolean }) => [a.title, a.concernsYou]),
      [
        ['Crue sud', true],
        ['Travaux', true],
      ]
    )
  })

  test('habitant du quartier nord : l’alerte sud ne le concerne pas', async ({
    client,
    assert,
  }) => {
    await seedAlerts()
    const response = await client
      .get('/api/alerts/active')
      .bearerToken(await tokenFor('citoyen', 'nord'))
    assert.deepEqual(
      response.body().map((a: { title: string; concernsYou: boolean }) => [a.title, a.concernsYou]),
      [
        ['Travaux', true],
        ['Crue sud', false],
      ]
    )
  })

  test('l’habitant déclare son quartier dans son profil', async ({ client, assert }) => {
    const token = await tokenFor('citoyen')
    const saved = await client.patch('/api/me').bearerToken(token).json({ district: 'sud' })
    saved.assertStatus(200)
    assert.equal(saved.body().district, 'sud')

    const invalid = await client.patch('/api/me').bearerToken(token).json({ district: 'lune' })
    invalid.assertStatus(422)

    const cleared = await client.patch('/api/me').bearerToken(token).json({ district: null })
    assert.isNull(cleared.body().district)
  })

  test('les quartiers sont exposés par /api/meta', async ({ client, assert }) => {
    const response = await client.get('/api/meta')
    assert.deepInclude(response.body().districts, { value: 'sud', label: 'Quartier sud' })
  })
})
