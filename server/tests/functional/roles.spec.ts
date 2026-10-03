import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { ROLE_VALUES } from '#constants/domain'

test.group('Rôles', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('une inscription est toujours citoyen, même si le corps demande admin', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/api/auth/register').json({
      fullName: 'Léa Pirate',
      email: 'lea@test.local',
      password: 'motdepasse123',
      role: 'admin',
    })

    response.assertStatus(201)
    assert.equal(response.body().user.role, 'citoyen')
    const user = await User.findByOrFail('email', 'lea@test.local')
    assert.equal(user.role, 'citoyen')
  })

  test('GET /api/me renvoie le rôle de chaque profil', async ({ client, assert }) => {
    for (const role of ROLE_VALUES) {
      const user = await User.create({
        fullName: `Compte ${role}`,
        email: `${role}@test.local`,
        password: 'motdepasse123',
        role,
      })
      const token = await User.accessTokens.create(user)

      const me = await client.get('/api/me').bearerToken(token.value!.release())
      me.assertStatus(200)
      assert.equal(me.body().role, role)
    }
  })

  test('PATCH /api/me ne permet pas de changer son rôle', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Camille Test',
      email: 'camille@test.local',
      password: 'motdepasse123',
      role: 'citoyen',
    })
    const token = await User.accessTokens.create(user)

    const response = await client
      .patch('/api/me')
      .bearerToken(token.value!.release())
      .json({ role: 'admin' })
    response.assertStatus(200)
    assert.equal(response.body().role, 'citoyen')
    await user.refresh()
    assert.equal(user.role, 'citoyen')
  })

  test('GET /api/me refuse sans token', async ({ client }) => {
    const response = await client.get('/api/me')
    response.assertStatus(401)
  })

  test('GET /api/meta expose la liste des rôles', async ({ client }) => {
    const response = await client.get('/api/meta')
    response.assertStatus(200)
    response.assertBodyContains({
      roles: [
        { value: 'citoyen', label: 'Citoyen' },
        { value: 'agent', label: 'Agent municipal' },
        { value: 'admin', label: 'Administrateur' },
      ],
    })
  })
})
