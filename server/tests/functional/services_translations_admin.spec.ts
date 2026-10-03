import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function seedService() {
  return Service.create({
    slug: 'etat-civil',
    name: 'État civil',
    category: 'demarches',
    summary: 'Actes et papiers d’identité.',
    description: 'Description en français.',
    hours: 'Lundi : 8 h – 16 h',
    phone: null,
    email: null,
    address: null,
    procedures: [{ title: 'Demander un acte', detail: 'Gratuit.' }],
    translations: { en: { procedures: [{ title: 'Request a certificate', detail: 'Free.' }] } },
  })
}

async function tokenFor(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const URL = '/api/admin/services/etat-civil/translations/en'

test.group('Saisie admin des traductions de services (F27)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un admin saisit la version EN, la fiche publique la sert', async ({ client, assert }) => {
    await seedService()
    const token = await tokenFor('admin')

    const response = await client
      .put(URL)
      .bearerToken(token)
      .json({ name: '  Civil registry ', summary: 'Certificates.', description: '', hours: null })
    response.assertStatus(200)
    assert.equal(response.body().translation.name, 'Civil registry')
    assert.notProperty(response.body().translation, 'description')
    // Les démarches déjà traduites sont conservées.
    assert.equal(response.body().translation.procedures[0].title, 'Request a certificate')

    const show = await client.get(URL).bearerToken(token)
    assert.equal(show.body().translation.summary, 'Certificates.')

    const page = await client.get('/api/services/etat-civil?lang=en')
    assert.equal(page.body().lang, 'en')
    assert.equal(page.body().name, 'Civil registry')
    assert.equal(page.body().description, 'Description en français.')
  })

  test('citoyen et agent refusés (403), anonyme refusé (401)', async ({ client }) => {
    await seedService()
    for (const role of ['citoyen', 'agent'] as const) {
      const response = await client
        .put(URL)
        .bearerToken(await tokenFor(role))
        .json({ name: 'Hacked' })
      response.assertStatus(403)
    }
    const anonymous = await client.put(URL).json({ name: 'Hacked' })
    anonymous.assertStatus(401)
  })

  test('français, langue inconnue ou texte trop long refusés (422) ; service inconnu (404)', async ({
    client,
  }) => {
    await seedService()
    const token = await tokenFor('admin')
    const fr = await client
      .put('/api/admin/services/etat-civil/translations/fr')
      .bearerToken(token)
      .json({ name: 'X' })
    fr.assertStatus(422)
    const xx = await client
      .put('/api/admin/services/etat-civil/translations/xx')
      .bearerToken(token)
      .json({ name: 'X' })
    xx.assertStatus(422)
    const long = await client
      .put(URL)
      .bearerToken(token)
      .json({ name: 'x'.repeat(121) })
    long.assertStatus(422)
    const missing = await client
      .put('/api/admin/services/inconnu/translations/en')
      .bearerToken(token)
      .json({ name: 'X' })
    missing.assertStatus(404)
  })
})
