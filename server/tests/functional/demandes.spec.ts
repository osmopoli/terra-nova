import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import Demande from '#models/demande'
import type { Role } from '#constants/domain'

async function login(role: Role, email = `${role}@test.local`) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return { user, token: token.value!.release() }
}

const PAYLOAD = {
  subject: 'Lampadaire en panne',
  service: 'voirie' as const,
  message: 'Le lampadaire de la rue des Lilas ne fonctionne plus depuis lundi.',
}

test.group('Demandes : accès', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token sur la liste, la création et le détail', async ({ client }) => {
    const list = await client.get('/api/demandes')
    list.assertStatus(401)
    const create = await client.post('/api/demandes').json(PAYLOAD)
    create.assertStatus(401)
    const show = await client.get('/api/demandes/1')
    show.assertStatus(401)
  })

  test('403 pour un agent ou un admin', async ({ client, assert }) => {
    for (const role of ['agent', 'admin'] as const) {
      const { token } = await login(role)
      const response = await client.get('/api/demandes').bearerToken(token)
      response.assertStatus(403)
      assert.isString(response.body().error)
    }
  })
})

test.group('Demandes : citoyen', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /api/demandes crée la demande avec numéro de suivi et première étape', async ({
    client,
    assert,
  }) => {
    const { token } = await login('citoyen')
    const response = await client.post('/api/demandes').bearerToken(token).json(PAYLOAD)
    response.assertStatus(201)
    const body = response.body()
    assert.match(body.reference, /^NT-\d{6}$/)
    assert.equal(body.status, 'nouveau')
    assert.equal(body.subject, PAYLOAD.subject)
    assert.lengthOf(body.steps, 1)
    assert.equal(body.steps[0].status, 'nouveau')
    assert.notProperty(body, 'userId')
  })

  test('POST /api/demandes refuse une saisie invalide (422)', async ({ client, assert }) => {
    const { token } = await login('citoyen')
    const response = await client
      .post('/api/demandes')
      .bearerToken(token)
      .json({ subject: '', service: 'inconnu', message: 'court' })
    response.assertStatus(422)
    const fields = response.body().errors.map((e: { field: string }) => e.field)
    assert.includeMembers(fields, ['subject', 'service', 'message'])
  })

  test('GET /api/demandes liste mes demandes, plus récentes en premier', async ({
    client,
    assert,
  }) => {
    const { user, token } = await login('citoyen')
    const other = await login('citoyen', 'autre@test.local')
    const old = await Demande.submit(user.id, { ...PAYLOAD, subject: 'Ancienne demande' })
    old.createdAt = DateTime.now().minus({ days: 3 })
    await old.save()
    await Demande.submit(user.id, { ...PAYLOAD, subject: 'Demande récente' })
    await Demande.submit(other.user.id, { ...PAYLOAD, subject: 'Pas à moi' })

    const response = await client.get('/api/demandes').bearerToken(token)
    response.assertStatus(200)
    const data = response.body().data
    assert.deepEqual(
      data.map((d: { subject: string }) => d.subject),
      ['Demande récente', 'Ancienne demande']
    )
    assert.containsSubset(data[0], { status: 'nouveau', service: 'voirie' })
    assert.isString(data[0].createdAt)
    assert.isString(data[0].reference)
  })

  test('GET /api/demandes/:id renvoie le détail et la chronologie', async ({ client, assert }) => {
    const { user, token } = await login('citoyen')
    const demande = await Demande.submit(user.id, PAYLOAD)

    const response = await client.get(`/api/demandes/${demande.id}`).bearerToken(token)
    response.assertStatus(200)
    assert.equal(response.body().message, PAYLOAD.message)
    assert.lengthOf(response.body().steps, 1)
  })

  test('GET /api/demandes/:id : 404 pour la demande d’un autre habitant', async ({
    client,
    assert,
  }) => {
    const { token } = await login('citoyen')
    const other = await login('citoyen', 'autre@test.local')
    const demande = await Demande.submit(other.user.id, PAYLOAD)

    const response = await client.get(`/api/demandes/${demande.id}`).bearerToken(token)
    response.assertStatus(404)
    assert.isString(response.body().error)
  })
})

test.group('Demandes : récapitulatif', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('401 sans token, 403 pour un agent', async ({ client }) => {
    const anonymous = await client.get('/api/demandes/recapitulatif')
    anonymous.assertStatus(401)
    const { token } = await login('agent')
    const forbidden = await client.get('/api/demandes/recapitulatif').bearerToken(token)
    forbidden.assertStatus(403)
  })

  test('synthèse chiffrée et lignes limitées au citoyen connecté', async ({ client, assert }) => {
    const { user, token } = await login('citoyen')
    const other = await login('citoyen', 'autre@test.local')
    await Demande.submit(user.id, PAYLOAD)
    const done = await Demande.submit(user.id, { ...PAYLOAD, subject: 'Acte de naissance' })
    await done.related('steps').create({ status: 'traite' })
    done.status = 'traite'
    await done.save()
    await Demande.submit(other.user.id, PAYLOAD)

    const response = await client.get('/api/demandes/recapitulatif').bearerToken(token)
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.summary.total, 2)
    assert.equal(body.summary.nouveau, 1)
    assert.equal(body.summary.traite, 1)
    assert.isNumber(body.summary.averageDelayDays)
    assert.lengthOf(body.data, 2)
    assert.isString(body.data[0].statusLabel)
  })
})
