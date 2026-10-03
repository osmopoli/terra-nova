import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { PASSWORD_CHANGE_PATH } from '#constants/domain'

const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0'
const PASSWORD = 'motdepasse123'

async function createCitizen(email: string) {
  return User.create({ fullName: 'Citoyenne', email, password: PASSWORD, role: 'citoyen' })
}

test.group('Nouvelle connexion depuis un appareil inconnu (WEBC-80)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token sur la liste des appareils et le changement de mot de passe', async ({
    client,
  }) => {
    const devices = await client.get('/api/me/devices')
    devices.assertStatus(401)
    const password = await client
      .put('/api/me/password')
      .json({ currentPassword: PASSWORD, password: 'autre12345' })
    password.assertStatus(401)
  })

  test('un nouveau navigateur crée une notification, un appareil connu non', async ({
    client,
    assert,
  }) => {
    await createCitizen('alice@test.local')
    const credentials = { email: 'alice@test.local', password: PASSWORD }

    const first = await client
      .post('/api/auth/login')
      .header('user-agent', CHROME_WINDOWS)
      .json(credentials)
    first.assertStatus(200)
    const token = first.body().token

    const again = await client
      .post('/api/auth/login')
      .header('user-agent', CHROME_WINDOWS)
      .json(credentials)
    again.assertStatus(200)
    const other = await client
      .post('/api/auth/login')
      .header('user-agent', FIREFOX_LINUX)
      .json(credentials)
    other.assertStatus(200)

    const list = await client.get('/api/me/notifications').bearerToken(token)
    list.assertStatus(200)
    const security = list
      .body()
      .notifications.filter((n: { kind: string }) => n.kind === 'securite')
    assert.lengthOf(security, 2)
    const latest = security[0]
    assert.include(latest.message, 'Firefox')
    assert.include(latest.message, 'Linux')
    assert.include(latest.message, 'Changez votre mot de passe')
    assert.equal(latest.actionPath, PASSWORD_CHANGE_PATH)

    const devices = await client.get('/api/me/devices').bearerToken(token)
    devices.assertStatus(200)
    assert.lengthOf(devices.body().devices, 2)
    assert.notProperty(devices.body().devices[0], 'fingerprint')
  })

  test('l’appareil d’inscription est connu : pas d’alerte à la connexion suivante', async ({
    client,
    assert,
  }) => {
    const register = await client
      .post('/api/auth/register')
      .header('user-agent', CHROME_WINDOWS)
      .json({ fullName: 'Bob Citoyen', email: 'bob@test.local', password: PASSWORD })
    register.assertStatus(201)
    const login = await client
      .post('/api/auth/login')
      .header('user-agent', CHROME_WINDOWS)
      .json({ email: 'bob@test.local', password: PASSWORD })
    const list = await client.get('/api/me/notifications').bearerToken(login.body().token)
    assert.lengthOf(list.body().notifications, 0)
  })

  test('les appareils et alertes d’un compte ne sont jamais visibles d’un autre', async ({
    client,
    assert,
  }) => {
    await createCitizen('carla@test.local')
    await createCitizen('dan@test.local')
    await client
      .post('/api/auth/login')
      .header('user-agent', CHROME_WINDOWS)
      .json({ email: 'carla@test.local', password: PASSWORD })
    const dan = await client
      .post('/api/auth/login')
      .header('user-agent', FIREFOX_LINUX)
      .json({ email: 'dan@test.local', password: PASSWORD })

    const devices = await client.get('/api/me/devices').bearerToken(dan.body().token)
    assert.lengthOf(devices.body().devices, 1)
    assert.equal(devices.body().devices[0].browser, 'Firefox')
  })

  test('le changement de mot de passe est verrouillé après trop de mots de passe actuels faux', async ({
    client,
  }) => {
    await createCitizen('fred@test.local')
    const login = await client
      .post('/api/auth/login')
      .json({ email: 'fred@test.local', password: PASSWORD })
    const token = login.body().token
    for (let i = 0; i < 5; i++) {
      const bad = await client
        .put('/api/me/password')
        .bearerToken(token)
        .json({ currentPassword: 'mauvais-mdp', password: 'nouveaumdp123' })
      bad.assertStatus(422)
    }
    const locked = await client
      .put('/api/me/password')
      .bearerToken(token)
      .json({ currentPassword: PASSWORD, password: 'nouveaumdp123' })
    locked.assertStatus(429)
  })

  test('changement de mot de passe : refuse un mauvais mot de passe actuel, accepte le bon', async ({
    client,
    assert,
  }) => {
    await createCitizen('eve@test.local')
    const login = await client
      .post('/api/auth/login')
      .json({ email: 'eve@test.local', password: PASSWORD })
    const token = login.body().token

    const bad = await client
      .put('/api/me/password')
      .bearerToken(token)
      .json({ currentPassword: 'mauvais-mdp', password: 'nouveaumdp123' })
    bad.assertStatus(422)
    assert.equal(bad.body().errors[0].field, 'currentPassword')

    const short = await client
      .put('/api/me/password')
      .bearerToken(token)
      .json({ currentPassword: PASSWORD, password: 'court' })
    short.assertStatus(422)

    const ok = await client
      .put('/api/me/password')
      .bearerToken(token)
      .json({ currentPassword: PASSWORD, password: 'nouveaumdp123' })
    ok.assertStatus(204)

    const relogin = await client
      .post('/api/auth/login')
      .json({ email: 'eve@test.local', password: 'nouveaumdp123' })
    relogin.assertStatus(200)
  })
})
