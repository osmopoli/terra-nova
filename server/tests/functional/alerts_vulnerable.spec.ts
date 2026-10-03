import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Alert from '#models/alert'
import User from '#models/user'

async function citizenToken(vulnerable: boolean) {
  const user = await User.create({
    fullName: 'Habitant',
    email: `habitant-${vulnerable ? 'vulnerable' : 'standard'}@test.local`,
    password: 'motdepasse123',
    role: 'citoyen',
    district: 'centre',
    vulnerable,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

async function seedHeatwave() {
  await Alert.create({
    title: 'Canicule',
    message: 'Fortes chaleurs.',
    instructions: 'Buvez de l’eau.',
    vulnerableAdvice: 'Restez dans un lieu frais.',
    level: 'urgent',
    districts: ['centre', 'est'],
    startsAt: DateTime.now().minus({ hours: 1 }),
    endsAt: DateTime.now().plus({ hours: 5 }),
  })
}

test.group('Alerte canicule et personnes vulnérables (F31)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un admin publie des recommandations pour les personnes vulnérables', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin-canicule@test.local',
      password: 'motdepasse123',
      role: 'admin',
    })
    const created = await User.accessTokens.create(admin)
    const token = created.value!.release()
    const response = await client
      .post('/api/alerts')
      .bearerToken(token)
      .json({
        title: 'Canicule',
        message: 'Fortes chaleurs.',
        level: 'urgent',
        districts: ['centre', 'est'],
        vulnerableAdvice: 'Restez dans un lieu frais.',
        endsAt: DateTime.now().plus({ hours: 4 }).toISO(),
      })
    response.assertStatus(201)
    assert.equal(response.body().vulnerableAdvice, 'Restez dans un lieu frais.')
  })

  test('l’habitant vulnérable voit que les recommandations lui sont destinées', async ({
    client,
    assert,
  }) => {
    await seedHeatwave()
    const response = await client.get('/api/alerts/active').bearerToken(await citizenToken(true))
    const [alert] = response.body()
    assert.isTrue(alert.forVulnerable)
    assert.isTrue(alert.concernsYou)
    assert.equal(alert.vulnerableAdvice, 'Restez dans un lieu frais.')
  })

  test('les autres voient les recommandations sans marque personnelle', async ({
    client,
    assert,
  }) => {
    await seedHeatwave()
    const standard = await client.get('/api/alerts/active').bearerToken(await citizenToken(false))
    assert.isFalse(standard.body()[0].forVulnerable)

    const anonymous = await client.get('/api/alerts/active')
    assert.isFalse(anonymous.body()[0].forVulnerable)
    assert.equal(anonymous.body()[0].vulnerableAdvice, 'Restez dans un lieu frais.')
  })

  test('l’habitant se déclare vulnérable dans son profil', async ({ client, assert }) => {
    const token = await citizenToken(false)
    const response = await client.patch('/api/me').bearerToken(token).json({ vulnerable: true })
    response.assertStatus(200)
    assert.isTrue(response.body().vulnerable)
  })
})
