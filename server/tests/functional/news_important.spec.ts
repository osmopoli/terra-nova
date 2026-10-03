import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import NewsPost from '#models/news_post'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function login(role: Role) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email: `${role}-annonces@test.local`,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const post = (title: string, important: boolean, hoursAgo: number) => ({
  title,
  summary: 'Résumé de l’annonce.',
  body: 'Contenu de l’annonce.',
  category: 'annonce' as const,
  important,
  publishedAt: DateTime.now().minus({ hours: hoursAgo }),
})

test.group('Être prévenu des annonces importantes (F30)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un agent publie une annonce importante', async ({ client, assert }) => {
    const response = await client
      .post('/api/news')
      .bearerToken(await login('agent'))
      .json({
        title: 'Coupure d’eau générale',
        summary: 'Mardi de 8 h à 12 h.',
        body: 'Travaux sur le réseau principal.',
        category: 'annonce',
        important: true,
      })
    response.assertStatus(201)
    assert.isTrue(response.body().important)
  })

  test('l’habitant voit les annonces importantes non lues, puis plus rien après lecture', async ({
    client,
    assert,
  }) => {
    await NewsPost.createMany([
      post('Importante récente', true, 1),
      post('Ordinaire', false, 1),
      post('Importante ancienne', true, 24 * 30),
    ])
    const token = await login('citoyen')

    const unread = await client.get('/api/news/important/unread').bearerToken(token)
    unread.assertStatus(200)
    assert.equal(unread.body().count, 1)
    assert.equal(unread.body().data[0].title, 'Importante récente')

    const seen = await client.post('/api/news/important/seen').bearerToken(token)
    seen.assertStatus(204)
    const after = await client.get('/api/news/important/unread').bearerToken(token)
    assert.equal(after.body().count, 0)

    await NewsPost.create(post('Nouvelle importante', true, -0.001))
    const later = await client.get('/api/news/important/unread').bearerToken(token)
    assert.equal(
      later.body().count,
      0,
      'une annonce programmée dans le futur n’est pas encore visible'
    )
  })

  test('les notifications demandent une connexion', async ({ client }) => {
    const response = await client.get('/api/news/important/unread')
    response.assertStatus(401)
  })
})
