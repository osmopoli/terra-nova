import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Demande from '#models/demande'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function account(role: Role) {
  const user = await User.create({
    fullName: role === 'citoyen' ? 'Pauline Habitante' : `Compte ${role}`,
    email: `${role}-vue-agent@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return { user, token: token.value!.release() }
}

async function seed(userId: number) {
  const make = (subject: string) =>
    Demande.submit(userId, { subject, service: 'voirie', message: 'Message de la demande.' })
  const a = await make('Lampadaire')
  const b = await make('Trottoir')
  const c = await make('Ancienne')
  await b.merge({ status: 'en_cours' }).save()
  await c.merge({ status: 'traite' }).save()
  return { a, b, c }
}

test.group('Vue agent des demandes des habitants (F22)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('par défaut : demandes à traiter, nouvelles d’abord, avec le nom de l’habitant', async ({
    client,
    assert,
  }) => {
    const citizen = await account('citoyen')
    await seed(citizen.user.id)
    const { token } = await account('agent')

    const response = await client.get('/api/agent/demandes').bearerToken(token)
    response.assertStatus(200)
    assert.deepEqual(
      response.body().data.map((d: { subject: string; status: string }) => [d.subject, d.status]),
      [
        ['Lampadaire', 'nouveau'],
        ['Trottoir', 'en_cours'],
      ]
    )
    assert.equal(response.body().data[0].citizenName, 'Pauline Habitante')
    assert.notProperty(response.body().data[0], 'user')
    assert.deepEqual(response.body().counts, { nouveau: 1, en_cours: 1, traite: 1 })

    const done = await client.get('/api/agent/demandes?status=traite').bearerToken(token)
    assert.deepEqual(
      done.body().data.map((d: { subject: string }) => d.subject),
      ['Ancienne']
    )
  })

  test('l’agent prend en charge puis traite, avec une réponse visible par l’habitant', async ({
    client,
    assert,
  }) => {
    const citizen = await account('citoyen')
    const { a } = await seed(citizen.user.id)
    const { token } = await account('agent')

    const taken = await client
      .patch(`/api/agent/demandes/${a.id}`)
      .bearerToken(token)
      .json({ status: 'en_cours' })
    taken.assertStatus(200)
    const done = await client
      .patch(`/api/agent/demandes/${a.id}`)
      .bearerToken(token)
      .json({ status: 'traite', note: 'Lampadaire réparé ce matin.' })
    done.assertStatus(200)
    assert.deepEqual(
      done.body().steps.map((s: { status: string }) => s.status),
      ['nouveau', 'en_cours', 'traite']
    )

    const seen = await client.get(`/api/demandes/${a.id}`).bearerToken(citizen.token)
    assert.equal(seen.body().status, 'traite')
    assert.equal(seen.body().steps[2].note, 'Lampadaire réparé ce matin.')
  })

  test('même état sans réponse : 409 ; état inconnu : 422 ; demande absente : 404', async ({
    client,
  }) => {
    const citizen = await account('citoyen')
    const { a } = await seed(citizen.user.id)
    const { token } = await account('agent')
    const same = await client
      .patch(`/api/agent/demandes/${a.id}`)
      .bearerToken(token)
      .json({ status: 'nouveau' })
    same.assertStatus(409)
    const bad = await client
      .patch(`/api/agent/demandes/${a.id}`)
      .bearerToken(token)
      .json({ status: 'perdu' })
    bad.assertStatus(422)
    const missing = await client
      .patch('/api/agent/demandes/999999')
      .bearerToken(token)
      .json({ status: 'traite' })
    missing.assertStatus(404)
  })

  test('réservé aux agents et admins (403 pour un citoyen)', async ({ client }) => {
    const citizen = await account('citoyen')
    const response = await client.get('/api/agent/demandes').bearerToken(citizen.token)
    response.assertStatus(403)
  })
})
