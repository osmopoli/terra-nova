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

test.group('Suppression de compte', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function signUp(email: string) {
    const user = await User.create({
      fullName: 'Citoyen Test',
      email,
      password: 'motdepasse123',
      role: 'citoyen',
    })
    const token = await User.accessTokens.create(user)
    return { user, token: token.value!.release() }
  }

  test('sans jeton : 401', async ({ client }) => {
    const response = await client.delete('/api/me').json({ password: 'motdepasse123' })
    response.assertStatus(401)
  })

  test('mot de passe faux : 422 et compte conservé', async ({ client, assert }) => {
    const { user, token } = await signUp('a@test.local')
    const response = await client
      .delete('/api/me')
      .bearerToken(token)
      .json({ password: 'faux-faux-faux' })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'password' }] })
    assert.isNotNull(await User.find(user.id))
  })

  test('mot de passe absent : 422', async ({ client }) => {
    const { token } = await signUp('a@test.local')
    const response = await client.delete('/api/me').bearerToken(token).json({})
    response.assertStatus(422)
  })

  test('suppression : jeton et connexion invalides, autres comptes intacts', async ({
    client,
    assert,
  }) => {
    const { user, token } = await signUp('a@test.local')
    const other = await signUp('b@test.local')

    const response = await client
      .delete('/api/me')
      .bearerToken(token)
      .json({ password: 'motdepasse123' })
    response.assertStatus(204)

    assert.isNull(await User.find(user.id))
    assert.isNotNull(await User.find(other.user.id))
    const after = await client.get('/api/me').bearerToken(token)
    after.assertStatus(401)
    const login = await client
      .post('/api/auth/login')
      .json({ email: 'a@test.local', password: 'motdepasse123' })
    login.assertStatus(400)
  })

  test("un identifiant dans le corps n'agit pas sur un autre compte", async ({
    client,
    assert,
  }) => {
    const { token } = await signUp('a@test.local')
    const other = await signUp('b@test.local')
    await client
      .delete('/api/me')
      .bearerToken(token)
      .json({ password: 'motdepasse123', id: other.user.id })
    assert.isNotNull(await User.find(other.user.id))
  })

  test('mots de passe faux répétés : 429, même avec le bon ensuite', async ({ client, assert }) => {
    const { user, token } = await signUp('a@test.local')
    for (let i = 0; i < 5; i++) {
      const wrong = await client
        .delete('/api/me')
        .bearerToken(token)
        .json({ password: 'faux-faux-faux' })
      wrong.assertStatus(422)
    }
    const blocked = await client
      .delete('/api/me')
      .bearerToken(token)
      .json({ password: 'motdepasse123' })
    blocked.assertStatus(429)
    assert.isNotNull(await User.find(user.id))
  })

  test('agent ou admin : 403', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@test.local',
      password: 'motdepasse123',
      role: 'admin',
    })
    const created = await User.accessTokens.create(admin)
    const token = created.value!.release()
    const response = await client
      .delete('/api/me')
      .bearerToken(token)
      .json({ password: 'motdepasse123' })
    response.assertStatus(403)
    assert.isNotNull(await User.find(admin.id))
  })
})
