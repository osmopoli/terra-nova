import { test } from '@japa/runner'
import type { TestContext } from '@japa/runner/core'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import AuthChallenge from '#models/auth_challenge'
import TwoFactorSetting from '#models/two_factor_setting'
import { TWO_FACTOR } from '#constants/domain'
import { codeAt, currentStep, fromBase32, toBase32 } from '#services/totp'

const PASSWORD = 'motdepasse123'
const EMAIL = 'double@test.local'

type Client = TestContext['client']

async function login(client: Client) {
  return client.post('/api/auth/login').json({ email: EMAIL, password: PASSWORD })
}

async function loginBody(client: Client) {
  const response = await login(client)
  return response.body()
}

/** Compte avec la vérification en deux étapes activée ; renvoie le secret, les codes et le jeton. */
async function enable(client: Client) {
  const user = await User.create({
    fullName: 'Double Étape',
    email: EMAIL,
    password: PASSWORD,
    role: 'citoyen',
  })
  const token = await loginBody(client).then((b) => b.token as string)
  const setup = await client
    .post('/api/me/two-factor/setup')
    .bearerToken(token)
    .json({ password: PASSWORD })
  setup.assertStatus(200)
  const secret = (setup.body().secret as string).replace(/\s/g, '')
  const step = currentStep()
  const confirm = await client
    .post('/api/me/two-factor/confirm')
    .bearerToken(token)
    .json({ code: codeAt(secret, step) })
  confirm.assertStatus(200)
  return { user, secret, step, token, recoveryCodes: confirm.body().recoveryCodes as string[] }
}

test.group('Vérification en deux étapes (F53)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('TOTP conforme aux vecteurs de la RFC 6238 (SHA-1)', ({ assert }) => {
    // Secret ASCII « 12345678901234567890 », 8 chiffres dans la RFC : on compare les 6 derniers.
    const secret = toBase32(Buffer.from('12345678901234567890'))
    assert.equal(fromBase32(secret).toString(), '12345678901234567890')
    assert.equal(codeAt(secret, Math.floor(59 / 30)), '287082')
    assert.equal(codeAt(secret, Math.floor(1111111109 / 30)), '081804')
    assert.equal(codeAt(secret, Math.floor(1234567890 / 30)), '005924')
    assert.equal(codeAt(secret, Math.floor(20000000000 / 30)), '353130')
  })

  test('activation guidée : clé, lien otpauth, premier code, codes de secours', async ({
    client,
    assert,
  }) => {
    const { user, token, recoveryCodes, secret } = await enable(client)
    assert.lengthOf(recoveryCodes, TWO_FACTOR.recoveryCodes)
    recoveryCodes.forEach((c) => assert.match(c, /^[A-Z2-7]{5}-[A-Z2-7]{5}$/))

    const setting = await TwoFactorSetting.findByOrFail('userId', user.id)
    // Secret chiffré en base, codes de secours en sha256 uniquement.
    assert.notInclude(setting.secret, secret)
    setting.recoveryCodes.forEach((h) => assert.match(h, /^[0-9a-f]{64}$/))

    const state = await client.get('/api/me/two-factor').bearerToken(token)
    state.assertBodyContains({ enabled: true, recoveryCodesLeft: TWO_FACTOR.recoveryCodes })

    const again = await client
      .post('/api/me/two-factor/setup')
      .bearerToken(token)
      .json({ password: PASSWORD })
    again.assertStatus(409)
  })

  test('activation refusée avec un mauvais mot de passe ou un code faux', async ({
    client,
    assert,
  }) => {
    await User.create({ fullName: 'Double', email: EMAIL, password: PASSWORD, role: 'citoyen' })
    const token = await loginBody(client).then((b) => b.token as string)

    const badPassword = await client
      .post('/api/me/two-factor/setup')
      .bearerToken(token)
      .json({ password: 'pas-le-bon' })
    badPassword.assertStatus(422)
    badPassword.assertBodyContains({ errors: [{ field: 'password' }] })

    const setup = await client
      .post('/api/me/two-factor/setup')
      .bearerToken(token)
      .json({ password: PASSWORD })
    assert.match(setup.body().otpauthUrl, /^otpauth:\/\/totp\/Terra%20Nova%3A.+secret=[A-Z2-7]+/)
    const secret = (setup.body().secret as string).replace(/\s/g, '')
    const wrongCode = codeAt(secret, currentStep() + 5)
    const wrong = await client
      .post('/api/me/two-factor/confirm')
      .bearerToken(token)
      .json({ code: wrongCode })
    wrong.assertStatus(422)
    wrong.assertBodyContains({ errors: [{ field: 'code' }] })

    const state = await client.get('/api/me/two-factor').bearerToken(token)
    state.assertBodyContains({ enabled: false })
    // Tant que ce n'est pas confirmé, la connexion reste en une étape.
    const { token: direct } = await loginBody(client)
    assert.isString(direct)
  })

  test('connexion : aucun jeton d’accès avant le code, puis jeton après un bon code', async ({
    client,
    assert,
  }) => {
    const { secret, step } = await enable(client)

    const first = await login(client)
    first.assertStatus(200)
    assert.isTrue(first.body().twoFactorRequired)
    assert.notProperty(first.body(), 'token')
    assert.notProperty(first.body(), 'user')
    const challengeToken = first.body().challengeToken as string
    // Le jeton intermédiaire n'ouvre aucune route protégée.
    const refused = await client.get('/api/me').bearerToken(challengeToken)
    refused.assertStatus(401)

    const ok = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken, code: codeAt(secret, step + 1) })
    ok.assertStatus(200)
    assert.isString(ok.body().token)
    const me = await client.get('/api/me').bearerToken(ok.body().token)
    me.assertStatus(200)

    // Jeton intermédiaire à usage unique.
    const reuse = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken, code: codeAt(secret, step + 1) })
    reuse.assertStatus(410)
  })

  test('code faux refusé, rejeu du même pas refusé, trop d’essais = recommencer', async ({
    client,
    assert,
  }) => {
    const { secret, step } = await enable(client)

    // Le code utilisé pour l'activation ne peut pas resservir (même pas TOTP).
    const replayChallenge = await loginBody(client).then((b) => b.challengeToken as string)
    const replay = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: replayChallenge, code: codeAt(secret, step) })
    replay.assertStatus(422)
    assert.match(replay.body().errors[0].message, /Il vous reste 4 essais/)

    const used = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: replayChallenge, code: codeAt(secret, step + 1) })
    used.assertStatus(200)

    const second = await loginBody(client).then((b) => b.challengeToken as string)
    const sameStepAgain = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: second, code: codeAt(secret, step + 1) })
    sameStepAgain.assertStatus(422)

    for (let i = 0; i < TWO_FACTOR.maxAttempts - 2; i++) {
      const wrong = await client
        .post('/api/auth/two-factor')
        .json({ challengeToken: second, code: '000000' })
      wrong.assertStatus(422)
    }
    const last = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: second, code: 'ABCDE-ABCDE' })
    last.assertStatus(410)
    assert.match(last.body().error, /Reprenez la connexion/)
  })

  test('code de secours accepté une seule fois', async ({ client, assert }) => {
    const { recoveryCodes } = await enable(client)

    const challengeToken = await loginBody(client).then((b) => b.challengeToken as string)
    const ok = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken, code: recoveryCodes[0].toLowerCase() })
    ok.assertStatus(200)
    assert.equal(ok.body().method, 'secours')
    assert.equal(ok.body().recoveryCodesLeft, TWO_FACTOR.recoveryCodes - 1)

    const next = await loginBody(client).then((b) => b.challengeToken as string)
    const reuse = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: next, code: recoveryCodes[0] })
    reuse.assertStatus(422)
  })

  test('jeton intermédiaire expiré ou inconnu', async ({ client }) => {
    const { secret, step } = await enable(client)
    const challengeToken = await loginBody(client).then((b) => b.challengeToken as string)
    await AuthChallenge.query().update({ expires_at: Date.now() - 1000 })

    const expired = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken, code: codeAt(secret, step + 1) })
    expired.assertStatus(410)

    const unknown = await client
      .post('/api/auth/two-factor')
      .json({ challengeToken: 'inconnu', code: codeAt(secret, step + 1) })
    unknown.assertStatus(410)
  })

  test('désactivation avec le mot de passe', async ({ client, assert }) => {
    const { token } = await enable(client)

    const wrong = await client
      .delete('/api/me/two-factor')
      .bearerToken(token)
      .json({ password: 'pas-le-bon' })
    wrong.assertStatus(422)

    const ok = await client
      .delete('/api/me/two-factor')
      .bearerToken(token)
      .json({ password: PASSWORD })
    ok.assertStatus(204)
    const { token: direct } = await loginBody(client)
    assert.isString(direct)
  })

  test('routes de réglage en 401 sans jeton', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/me/two-factor'),
      client.post('/api/me/two-factor/setup').json({ password: PASSWORD }),
      client.post('/api/me/two-factor/confirm').json({ code: '123456' }),
      client.delete('/api/me/two-factor').json({ password: PASSWORD }),
    ])
    responses.forEach((response) => response.assertStatus(401))
  })
})
