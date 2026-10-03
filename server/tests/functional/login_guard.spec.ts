import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { LOGIN_LIMITS, type Role } from '#constants/domain'

const PASSWORD = 'motdepasse123'

async function createUser(role: Role, email = `${role}@test.local`) {
  return User.create({ fullName: `Compte ${role}`, email, password: PASSWORD, role })
}

test.group('Protection des connexions (WEBC-60)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('après N échecs, la tentative suivante est refusée avec l’heure de réessai', async ({
    client,
    assert,
  }) => {
    await createUser('citoyen', 'cible@test.local')

    for (let i = 0; i < LOGIN_LIMITS.maxFailuresPerAccount; i++) {
      const wrong = await client
        .post('/api/auth/login')
        .json({ email: 'cible@test.local', password: 'mauvais-mdp' })
      wrong.assertStatus(400)
    }

    // Même avec le bon mot de passe, le compte est verrouillé.
    const locked = await client
      .post('/api/auth/login')
      .json({ email: 'cible@test.local', password: PASSWORD })
    locked.assertStatus(429)
    assert.match(locked.body().error, /Réessayez dans \d+ minute/)
    assert.isAbove(Number(locked.header('retry-after')), 0)
  })

  test('une connexion normale reste inchangée et un succès remet le compteur à zéro', async ({
    client,
  }) => {
    await createUser('citoyen', 'normal@test.local')
    const attempt = (password: string) =>
      client.post('/api/auth/login').json({ email: 'normal@test.local', password })

    for (let i = 0; i < LOGIN_LIMITS.maxFailuresPerAccount - 1; i++) {
      const r = await attempt('faux')
      r.assertStatus(400)
    }
    const ok = await attempt(PASSWORD)
    ok.assertStatus(200)
    // Le compteur est reparti de zéro : N - 1 nouveaux échecs ne verrouillent pas.
    for (let i = 0; i < LOGIN_LIMITS.maxFailuresPerAccount - 1; i++) {
      const r = await attempt('faux')
      r.assertStatus(400)
    }
    const again = await attempt(PASSWORD)
    again.assertStatus(200)
  })

  test('les tentatives bloquées sont visibles pour un admin', async ({ client, assert }) => {
    await createUser('citoyen', 'cible@test.local')
    for (let i = 0; i < LOGIN_LIMITS.maxFailuresPerAccount; i++) {
      await client.post('/api/auth/login').json({ email: 'cible@test.local', password: 'faux' })
    }
    await client.post('/api/auth/login').json({ email: 'cible@test.local', password: PASSWORD })

    const admin = await createUser('admin')
    const created = await User.accessTokens.create(admin)
    const token = created.value!.release()
    const response = await client.get('/api/admin/login-attempts').bearerToken(token)

    response.assertStatus(200)
    assert.equal(response.body().last24h.echec, LOGIN_LIMITS.maxFailuresPerAccount)
    assert.equal(response.body().last24h.bloque, 1)
    assert.equal(response.body().recent[0].outcome, 'bloque')
    assert.equal(response.body().recent[0].reason, 'compte')
  })

  test('GET /api/admin/login-attempts refuse sans token (401) et hors admin (403)', async ({
    client,
  }) => {
    const anonymous = await client.get('/api/admin/login-attempts')
    anonymous.assertStatus(401)

    for (const role of ['citoyen', 'agent'] as const) {
      const user = await createUser(role)
      const created = await User.accessTokens.create(user)
      const token = created.value!.release()
      const response = await client.get('/api/admin/login-attempts').bearerToken(token)
      response.assertStatus(403)
    }
  })
})
