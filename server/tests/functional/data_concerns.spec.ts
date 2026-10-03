import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import type { Role } from '#constants/domain'

async function login(role: Role, email = `${role}@test.local`) {
  const user = await User.create({
    fullName: `Compte ${role}`,
    email,
    password: 'motdepasse123',
    role,
  })
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}

const CONCERN = {
  subject: 'Qui lit mes messages ?',
  service: 'donnees_personnelles',
  message:
    'Je voudrais savoir qui a accès à mon adresse e-mail et combien de temps elle est gardée.',
}

test.group('Inquiétudes sur les données personnelles (F51)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('la catégorie « Données personnelles » est exposée et acceptée', async ({
    client,
    assert,
  }) => {
    const meta = await client.get('/api/meta')
    assert.deepInclude(meta.body().contactServices, {
      value: 'donnees_personnelles',
      label: 'Données personnelles',
    })

    const citizen = await login('citoyen')
    const sent = await client.post('/api/contact-messages').bearerToken(citizen).json(CONCERN)
    sent.assertStatus(201)
    assert.match(sent.body().trackingCode, /^NT-[A-Z0-9]{6}$/)
    assert.equal(sent.body().status, 'nouveau')
  })

  test('un agent répond, l’habitant voit la réponse et le statut « Traité »', async ({
    client,
    assert,
  }) => {
    const citizen = await login('citoyen')
    const sent = await client.post('/api/contact-messages').bearerToken(citizen).json(CONCERN)
    const code = sent.body().trackingCode
    const agent = await login('agent')

    const replied = await client
      .post(`/api/agent/contact-messages/${code}/reply`)
      .bearerToken(agent)
      .json({ reply: '  Seuls les agents municipaux lisent votre message.  ' })
    replied.assertStatus(200)
    assert.equal(replied.body().status, 'traite')

    const mine = await client.get('/api/contact-messages').bearerToken(citizen)
    const [message] = mine.body()
    assert.equal(message.reply, 'Seuls les agents municipaux lisent votre message.')
    assert.equal(message.status, 'traite')
    assert.isNotNull(message.repliedAt)
  })

  test('réponse : 401 sans token, 403 citoyen, 422 vide, 404 inconnu', async ({ client }) => {
    const citizen = await login('citoyen')
    const sent = await client.post('/api/contact-messages').bearerToken(citizen).json(CONCERN)
    const url = `/api/agent/contact-messages/${sent.body().trackingCode}/reply`

    const anonymous = await client.post(url).json({ reply: 'Bonjour madame.' })
    anonymous.assertStatus(401)
    const forbidden = await client.post(url).bearerToken(citizen).json({ reply: 'Bonjour madame.' })
    forbidden.assertStatus(403)

    const agent = await login('agent')
    const empty = await client.post(url).bearerToken(agent).json({ reply: '   ' })
    empty.assertStatus(422)
    const unknown = await client
      .post('/api/agent/contact-messages/NT-ZZZZZZ/reply')
      .bearerToken(agent)
      .json({ reply: 'Bonjour madame.' })
    unknown.assertStatus(404)
  })
})
