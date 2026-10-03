import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

const account = {
  fullName: 'Amina Test',
  email: 'Amina@Test.local',
  password: 'motdepasse123',
}

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('inscription, mot de passe haché en bcrypt', async ({ client, assert }) => {
    const response = await client.post('/api/auth/register').json(account)

    response.assertStatus(201)
    assert.equal(response.body().user.email, 'amina@test.local')
    assert.notProperty(response.body().user, 'password')
    assert.isString(response.body().token)

    const user = await User.findByOrFail('email', 'amina@test.local')
    assert.match(user.password, /^\$bcrypt\$/)
  })

  test('refuse un e-mail déjà pris', async ({ client }) => {
    await client.post('/api/auth/register').json(account)
    const duplicate = await client
      .post('/api/auth/register')
      .json({ ...account, email: 'amina@test.local' })
    duplicate.assertStatus(422)
    duplicate.assertBodyContains({ errors: [{ field: 'email' }] })
  })

  test('connexion, profil, déconnexion', async ({ client, assert }) => {
    await client.post('/api/auth/register').json(account)

    const wrong = await client
      .post('/api/auth/login')
      .json({ email: account.email, password: 'mauvais-mdp' })
    wrong.assertStatus(400)

    const login = await client
      .post('/api/auth/login')
      .json({ email: account.email, password: account.password })
    login.assertStatus(200)
    const token = login.body().token

    const me = await client.get('/api/me').bearerToken(token)
    me.assertStatus(200)
    assert.equal(me.body().fullName, 'Amina Test')

    const updated = await client.patch('/api/me').bearerToken(token).json({ fullName: 'Amina B' })
    updated.assertStatus(200)
    assert.equal(updated.body().fullName, 'Amina B')

    const logout = await client.post('/api/auth/logout').bearerToken(token)
    logout.assertStatus(204)

    const afterLogout = await client.get('/api/me').bearerToken(token)
    afterLogout.assertStatus(401)
  })

  test('routes privées en 401 sans token', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/me'),
      client.patch('/api/me').json({ fullName: 'X Y' }),
      client.post('/api/auth/logout'),
    ])
    responses.forEach((response) => response.assertStatus(401))
  })

  test('health et meta répondent', async ({ client }) => {
    const health = await client.get('/api/health')
    health.assertStatus(200)
    health.assertBodyContains({ status: 'ok', database: 'ok' })

    const meta = await client.get('/api/meta')
    meta.assertStatus(200)
  })
})
