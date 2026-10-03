import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Guide de première connexion (D12)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un nouvel habitant n’a pas encore vu le guide, puis le termine', async ({
    client,
    assert,
  }) => {
    const register = await client.post('/api/auth/register').json({
      fullName: 'Nouvel Habitant',
      email: 'nouveau@test.local',
      password: 'motdepasse123',
    })
    register.assertStatus(201)
    assert.notExists(register.body().user.onboardedAt)
    const token = register.body().token

    const done = await client.post('/api/me/onboarding').bearerToken(token)
    done.assertStatus(200)
    assert.isString(done.body().onboardedAt)

    const me = await client.get('/api/me').bearerToken(token)
    assert.isString(me.body().onboardedAt)
  })

  test('refusé sans connexion (401)', async ({ client }) => {
    const response = await client.post('/api/me/onboarding')
    response.assertStatus(401)
  })
})
