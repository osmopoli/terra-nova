import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Demande from '#models/demande'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function account(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}-tableau@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return { user, token: token.value!.release() }
}

test.group('Tableau de bord agent (F50)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un agent obtient des compteurs cohérents avec les données', async ({ client, assert }) => {
    const citizen = await account('citoyen')
    const make = (subject: string) =>
      Demande.submit(citizen.user.id, { subject, service: 'voirie', message: 'Message de test.' })
    await make('A')
    const b = await make('B')
    await b.merge({ status: 'en_cours' }).save()
    const { token } = await account('agent')

    const response = await client.get('/api/agent/dashboard').bearerToken(token)
    response.assertStatus(200)
    const body = response.body()
    assert.deepEqual(body.demandes.byStatus, { nouveau: 1, en_cours: 1, traite: 0 })
    assert.equal(body.demandes.total, 2)
    assert.equal(body.newDemandesLast7Days, 2)
    assert.equal(body.citizenAccounts, 1)
    assert.equal(body.messages.total, 0)
  })

  test('un citoyen reçoit 403, sans token 401', async ({ client }) => {
    const { token } = await account('citoyen')
    const forbidden = await client.get('/api/agent/dashboard').bearerToken(token)
    forbidden.assertStatus(403)
    const anonymous = await client.get('/api/agent/dashboard')
    anonymous.assertStatus(401)
  })
})
