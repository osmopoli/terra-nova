import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function tokenFor(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}-services@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const service = (slug: string, featuredRank: number | null, views = 0) => ({
  slug,
  name: `Service ${slug}`,
  category: 'demarches' as const,
  summary: 'Résumé.',
  description: 'Description.',
  hours: 'Lundi',
  phone: null,
  email: null,
  address: null,
  procedures: [{ title: `Démarche ${slug}`, detail: 'Détail.' }],
  translations: {},
  featuredRank,
  views,
})

test.group('Services mis en avant (F28)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('sélection de la mairie d’abord, complétée par les plus consultés', async ({
    client,
    assert,
  }) => {
    await Service.createMany([
      service('b', 2),
      service('a', 1),
      service('populaire', null, 40),
      service('peu-vu', null, 3),
      service('jamais-vu', null, 0),
    ])
    const response = await client.get('/api/services/highlights')
    response.assertStatus(200)
    assert.deepEqual(
      response.body().map((h: { slug: string; reason: string }) => [h.slug, h.reason]),
      [
        ['a', 'featured'],
        ['b', 'featured'],
        ['populaire', 'popular'],
        ['peu-vu', 'popular'],
      ]
    )
    assert.equal(response.body()[0].firstProcedure, 'Démarche a')
  })

  test('consulter une fiche augmente son compteur', async ({ client, assert }) => {
    await Service.create(service('fiche', null))
    await client.get('/api/services/fiche')
    await client.get('/api/services/fiche')
    const fresh = await Service.findByOrFail('slug', 'fiche')
    assert.equal(fresh.views, 2)
  })

  test('un admin met en avant puis retire un service', async ({ client, assert }) => {
    await Service.createMany([service('deja', 1), service('nouveau', null)])
    const token = await tokenFor('admin')

    const on = await client
      .patch('/api/services/nouveau/featured')
      .bearerToken(token)
      .json({ featured: true })
    on.assertStatus(200)
    const featured = await Service.findByOrFail('slug', 'nouveau')
    assert.equal(featured.featuredRank, 2)

    const off = await client
      .patch('/api/services/nouveau/featured')
      .bearerToken(token)
      .json({ featured: false })
    off.assertBodyContains({ featured: false })
    const removed = await Service.findByOrFail('slug', 'nouveau')
    assert.isNull(removed.featuredRank)
  })

  test('mise en avant refusée hors admin (401, 403)', async ({ client }) => {
    await Service.create(service('x', null))
    const anonymous = await client.patch('/api/services/x/featured').json({ featured: true })
    anonymous.assertStatus(401)
    const citizen = await client
      .patch('/api/services/x/featured')
      .bearerToken(await tokenFor('citoyen'))
      .json({ featured: true })
    citizen.assertStatus(403)
  })
})
