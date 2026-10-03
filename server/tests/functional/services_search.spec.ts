import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'

const base = {
  hours: 'Lundi : 8 h – 16 h',
  phone: null,
  email: null,
  address: null,
  procedures: [],
  translations: {},
}

async function seed() {
  await Service.createMany([
    {
      ...base,
      slug: 'sante',
      name: 'Centre municipal de santé',
      category: 'solidarite',
      summary: 'Médecins et vaccinations.',
      description: 'Consultations.',
    },
    {
      ...base,
      slug: 'ccas',
      name: 'CCAS',
      category: 'solidarite',
      summary: 'Aides sociales.',
      description: 'Accompagnement, accès aux soins et à la santé.',
    },
    {
      ...base,
      slug: 'sports',
      name: 'Sports',
      category: 'culture_sport',
      summary: 'Piscine et gymnases.',
      description: 'Équipements sportifs.',
    },
  ])
}

const slugs = (body: { slug: string }[]) => body.map((s) => s.slug).sort()

test.group('Recherche dans l’annuaire des services (F32)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('« sante » sans accent trouve les services de santé', async ({ client, assert }) => {
    await seed()
    const response = await client.get('/api/services?q=sante')
    response.assertStatus(200)
    assert.deepEqual(slugs(response.body()), ['ccas', 'sante'])
  })

  test('filtre par catégorie, combinable avec la recherche', async ({ client, assert }) => {
    await seed()
    const sport = await client.get('/api/services?category=culture_sport')
    assert.deepEqual(slugs(sport.body()), ['sports'])
    const none = await client.get('/api/services?category=culture_sport&q=sante')
    assert.lengthOf(none.body(), 0)
  })

  test('les caractères spéciaux de LIKE sont pris littéralement', async ({ client, assert }) => {
    await seed()
    const response = await client.get('/api/services?q=%25')
    assert.lengthOf(response.body(), 0)
  })
})
