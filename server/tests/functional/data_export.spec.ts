import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ContactMessage from '#models/contact_message'
import LoginAttempt from '#models/login_attempt'

async function makeUser(email: string, fullName: string) {
  const user = await User.create({ fullName, email, password: 'motdepasse123', role: 'citoyen' })
  const token = await User.accessTokens.create(user)
  return { user, token: token.value!.release() }
}

test.group('Export de mes données (WEBC-82)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token', async ({ client }) => {
    const response = await client.get('/api/me/data-export')
    response.assertStatus(401)
  })

  test('rubriques expliquées, uniquement mes données, sans secret', async ({ client, assert }) => {
    const elena = await makeUser('elena@test.local', 'Elena Martinez')
    const autre = await makeUser('autre@test.local', 'Autre Habitant')
    await ContactMessage.create({
      userId: elena.user.id,
      subject: 'Lampadaire éteint',
      service: 'voirie',
      message: 'Rue des Palmiers.',
      status: 'nouveau',
    })
    await ContactMessage.create({
      userId: autre.user.id,
      subject: 'Message de l’autre habitant',
      service: 'social',
      message: 'Message privé.',
      status: 'nouveau',
    })
    await LoginAttempt.create({
      email: 'elena@test.local',
      ip: '10.0.0.1',
      outcome: 'succes',
      reason: null,
      attemptedAt: Date.now(),
    })
    await LoginAttempt.create({
      email: 'autre@test.local',
      ip: '10.0.0.2',
      outcome: 'echec',
      reason: null,
      attemptedAt: Date.now(),
    })

    const response = await client.get('/api/me/data-export').bearerToken(elena.token)
    response.assertStatus(200)
    const body = response.body()
    const byKey = Object.fromEntries(body.sections.map((s: any) => [s.key, s]))

    assert.equal(byKey.identite.data.email, 'elena@test.local')
    for (const section of body.sections) {
      assert.isString(section.purpose)
      assert.isString(section.retention)
    }
    assert.lengthOf(byKey.demandes.data, 1)
    assert.equal(byKey.demandes.data[0].objet, 'Lampadaire éteint')
    assert.lengthOf(byKey.connexions.data, 1)
    assert.equal(byKey.connexions.data[0].adresseIp, '10.0.0.1')

    const raw = JSON.stringify(body)
    assert.notInclude(raw, 'autre@test.local')
    assert.notInclude(raw, 'Message de l’autre habitant')
    assert.notInclude(raw, 'password')
    assert.notInclude(raw, '$2')
    assert.notInclude(raw, elena.token)
  })
})
