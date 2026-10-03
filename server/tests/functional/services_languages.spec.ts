import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'

async function seedService() {
  await Service.create({
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
    translations: {
      en: {
        name: 'Civil registry',
        summary: 'Certificates and identity documents.',
        procedures: [{ title: 'Request a certificate', detail: 'Free.' }],
      },
    },
  })
}

test.group('Contenus des services en plusieurs langues (F27)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('par défaut, le contenu est en français avec les langues disponibles', async ({
    client,
    assert,
  }) => {
    await seedService()
    const response = await client.get('/api/services/etat-civil')
    response.assertStatus(200)
    assert.equal(response.body().name, 'État civil')
    assert.equal(response.body().lang, 'fr')
    assert.deepEqual(response.body().languages, ['fr', 'en'])
    assert.notProperty(response.body(), 'translations')
  })

  test('en anglais : champs traduits, les autres retombent sur le français', async ({
    client,
    assert,
  }) => {
    await seedService()
    const response = await client.get('/api/services/etat-civil?lang=en')
    assert.equal(response.body().lang, 'en')
    assert.equal(response.body().name, 'Civil registry')
    assert.equal(response.body().procedures[0].title, 'Request a certificate')
    assert.equal(response.body().description, 'Description en français.')

    const list = await client.get('/api/services?lang=en')
    assert.equal(list.body()[0].summary, 'Certificates and identity documents.')
  })

  test('langue sans traduction : français, et `lang` le signale', async ({ client, assert }) => {
    await seedService()
    const response = await client.get('/api/services/etat-civil?lang=es')
    assert.equal(response.body().lang, 'fr')
    assert.equal(response.body().name, 'État civil')
  })

  test('langue inconnue refusée (422)', async ({ client }) => {
    const response = await client.get('/api/services?lang=xx')
    response.assertStatus(422)
  })
})
