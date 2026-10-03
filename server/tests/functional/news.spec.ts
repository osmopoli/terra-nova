import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import NewsPost from '#models/news_post'
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

function makePost(attrs: Partial<NewsPost> = {}) {
  return NewsPost.create({
    title: 'Fermeture exceptionnelle de la piscine',
    summary: 'La piscine municipale ferme pour entretien.',
    body: 'La piscine municipale sera fermée du lundi au mercredi.',
    category: 'changement_service',
    publishedAt: DateTime.now().minus({ hours: 1 }),
    ...attrs,
  })
}

const payload = {
  title: 'Nouvelle ligne de bus',
  summary: 'Une ligne relie désormais le port au centre-ville.',
  body: 'La ligne 7 circule toutes les 15 minutes de 6 h à 21 h.',
  category: 'annonce',
}

test.group('Actualités : lecture publique', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  // La base de test peut contenir les actualités du seed : on part d'une table vide.
  group.each.setup(async () => {
    await NewsPost.query().delete()
  })

  test('GET /api/news liste sans compte, la plus récente d’abord, sans les programmées', async ({
    client,
    assert,
  }) => {
    const { user } = await login('agent')
    await makePost({ title: 'Ancienne', publishedAt: DateTime.now().minus({ days: 3 }) })
    await makePost({
      title: 'Récente',
      publishedAt: DateTime.now().minus({ minutes: 5 }),
      authorId: user.id,
    })
    await makePost({ title: 'Programmée', publishedAt: DateTime.now().plus({ days: 2 }) })

    const response = await client.get('/api/news')
    response.assertStatus(200)
    const { data, meta } = response.body()
    assert.deepEqual(
      data.map((post: { title: string }) => post.title),
      ['Récente', 'Ancienne']
    )
    assert.equal(meta.total, 2)
    assert.equal(data[0].authorName, 'Compte agent')
    assert.notProperty(data[0], 'author')
    assert.notProperty(data[0], 'authorId')
  })

  test('GET /api/news filtre par catégorie et valide la query', async ({ client, assert }) => {
    await makePost({ title: 'Info', category: 'info_pratique' })
    await makePost({ title: 'Annonce', category: 'annonce' })

    const filtered = await client.get('/api/news').qs({ category: 'info_pratique' })
    filtered.assertStatus(200)
    assert.deepEqual(
      filtered.body().data.map((post: { title: string }) => post.title),
      ['Info']
    )

    const invalid = await client.get('/api/news').qs({ category: 'inconnue' })
    invalid.assertStatus(422)
    assert.equal(invalid.body().errors[0].field, 'category')
  })

  test('GET /api/news/:id renvoie le détail, 404 si introuvable ou programmée', async ({
    client,
    assert,
  }) => {
    const post = await makePost()
    const scheduled = await makePost({ publishedAt: DateTime.now().plus({ days: 1 }) })

    const response = await client.get(`/api/news/${post.id}`)
    response.assertStatus(200)
    assert.equal(response.body().body, post.body)

    const hidden = await client.get(`/api/news/${scheduled.id}`)
    hidden.assertStatus(404)
    hidden.assertBody({ error: 'Actualité introuvable.' })

    const response1 = await client.get('/api/news/999999')
    response1.assertStatus(404)
  })

  test('GET /api/meta expose les catégories d’actualités', async ({ client }) => {
    const response = await client.get('/api/meta')
    response.assertBodyContains({
      newsCategories: [
        { value: 'annonce', label: 'Annonce municipale' },
        { value: 'changement_service', label: 'Changement de service' },
        { value: 'info_pratique', label: 'Info pratique' },
      ],
    })
  })
})

test.group('Actualités : publication', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  // La base de test peut contenir les actualités du seed : on part d'une table vide.
  group.each.setup(async () => {
    await NewsPost.query().delete()
  })

  test('POST /api/news : un agent publie, il est l’auteur', async ({ client, assert }) => {
    const { user, token } = await login('agent')

    const response = await client.post('/api/news').bearerToken(token).json(payload)
    response.assertStatus(201)
    assert.equal(response.body().authorName, 'Compte agent')

    const post = await NewsPost.findOrFail(response.body().id)
    assert.equal(post.authorId, user.id)
    assert.equal(post.category, 'annonce')
  })

  test('POST /api/news : 401 sans compte, 403 pour un citoyen, 422 si invalide', async ({
    client,
    assert,
  }) => {
    const response2 = await client.post('/api/news').json(payload)
    response2.assertStatus(401)

    const citizen = await login('citoyen')
    const forbidden = await client.post('/api/news').bearerToken(citizen.token).json(payload)
    forbidden.assertStatus(403)
    assert.property(forbidden.body(), 'error')

    const agent = await login('agent')
    const invalid = await client
      .post('/api/news')
      .bearerToken(agent.token)
      .json({ ...payload, title: '', category: 'autre' })
    invalid.assertStatus(422)
    const fields = invalid.body().errors.map((error: { field: string }) => error.field)
    assert.includeMembers(fields, ['title', 'category'])
  })

  test('PATCH /api/news/:id : un agent ne modifie que les siennes, l’admin toutes', async ({
    client,
    assert,
  }) => {
    const author = await login('agent')
    const other = await login('agent', 'autre-agent@test.local')
    const admin = await login('admin')
    const post = await makePost({ authorId: author.user.id })

    const denied = await client
      .patch(`/api/news/${post.id}`)
      .bearerToken(other.token)
      .json({ title: 'Piratage' })
    denied.assertStatus(403)

    const own = await client
      .patch(`/api/news/${post.id}`)
      .bearerToken(author.token)
      .json({ title: 'Piscine fermée trois jours' })
    own.assertStatus(200)
    assert.equal(own.body().title, 'Piscine fermée trois jours')

    const byAdmin = await client
      .patch(`/api/news/${post.id}`)
      .bearerToken(admin.token)
      .json({ category: 'info_pratique' })
    byAdmin.assertStatus(200)
    assert.equal(byAdmin.body().category, 'info_pratique')

    const response3 = await client.patch('/api/news/999999').bearerToken(admin.token).json({})
    response3.assertStatus(404)
  })

  test('DELETE /api/news/:id : 403 pour un autre agent, 204 pour l’auteur', async ({
    client,
    assert,
  }) => {
    const author = await login('agent')
    const other = await login('agent', 'autre-agent@test.local')
    const citizen = await login('citoyen')
    const post = await makePost({ authorId: author.user.id })

    const response4 = await client.delete(`/api/news/${post.id}`).bearerToken(citizen.token)
    response4.assertStatus(403)
    const response5 = await client.delete(`/api/news/${post.id}`).bearerToken(other.token)
    response5.assertStatus(403)
    const response6 = await client.delete(`/api/news/${post.id}`).bearerToken(author.token)
    response6.assertStatus(204)
    assert.isNull(await NewsPost.find(post.id))
  })
})
