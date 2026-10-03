import { createHash, generateKeyPairSync, randomBytes, sign, type KeyObject } from 'node:crypto'
import { test } from '@japa/runner'
import type { TestContext } from '@japa/runner/core'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'
import User from '#models/user'
import Passkey from '#models/passkey'

const PASSWORD = 'motdepasse123'
const EMAIL = 'cle@test.local'
const RP_ID = env.get('HOST')
const ORIGIN = `http://${env.get('HOST')}:${env.get('PORT')}`

type Client = TestContext['client']

const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest()
const b64u = (data: Buffer) => data.toString('base64url')

/** Authentificateur simulé avec node:crypto (ECDSA P-256 ou RSA 2048). */
function authenticator(kind: 'ec' | 'rsa' = 'ec') {
  const { publicKey, privateKey } =
    kind === 'ec'
      ? generateKeyPairSync('ec', { namedCurve: 'P-256' })
      : generateKeyPairSync('rsa', { modulusLength: 2048 })
  return {
    id: randomBytes(32),
    privateKey,
    spki: publicKey.export({ type: 'spki', format: 'der' }),
    algorithm: kind === 'ec' ? -7 : -257,
    counter: 0,
  }
}
type Authenticator = ReturnType<typeof authenticator>

const clientData = (type: string, challenge: string, origin = ORIGIN) =>
  Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }))

function authData(flags: number, counter: number, attested?: Buffer, rpId = RP_ID) {
  const head = Buffer.alloc(37)
  sha256(rpId).copy(head, 0)
  head[32] = flags
  head.writeUInt32BE(counter, 33)
  if (!attested) return head
  const length = Buffer.alloc(2)
  length.writeUInt16BE(attested.length)
  // aaguid nul + identifiant ; la clé COSE n'est pas lue par le serveur (SPKI fourni à part).
  return Buffer.concat([head, Buffer.alloc(16), length, attested, Buffer.from([0xa0])])
}

function registration(device: Authenticator, challenge: string) {
  return {
    id: b64u(device.id),
    clientDataJSON: b64u(clientData('webauthn.create', challenge)),
    authenticatorData: b64u(authData(0x45, 0, device.id)),
    publicKey: b64u(device.spki),
    publicKeyAlgorithm: device.algorithm,
    name: 'Ordinateur de test',
  }
}

function assertion(
  device: Authenticator,
  challenge: string,
  options: { signer?: KeyObject; origin?: string; counter?: number } = {}
) {
  const counter = options.counter ?? ++device.counter
  const data = authData(0x05, counter)
  const client = clientData('webauthn.get', challenge, options.origin)
  const signature = sign(
    'sha256',
    Buffer.concat([data, sha256(client)]),
    options.signer ?? device.privateKey
  )
  return {
    id: b64u(device.id),
    clientDataJSON: b64u(client),
    authenticatorData: b64u(data),
    signature: b64u(signature),
  }
}

async function accountWithToken(client: Client) {
  await User.create({ fullName: 'Clé Test', email: EMAIL, password: PASSWORD, role: 'citoyen' })
  const response = await client.post('/api/auth/login').json({ email: EMAIL, password: PASSWORD })
  return response.body().token as string
}

async function register(client: Client, token: string, device: Authenticator) {
  const options = await client
    .post('/api/me/passkeys/options')
    .bearerToken(token)
    .json({ password: PASSWORD })
  options.assertStatus(200)
  return client
    .post('/api/me/passkeys')
    .bearerToken(token)
    .json(registration(device, options.body().challenge))
}

async function loginChallenge(client: Client) {
  const options = await client.post('/api/auth/passkey/options')
  options.assertStatus(200)
  return options.body().challenge as string
}

test.group('Clés d’accès (D02)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('ajout d’une clé puis connexion sans mot de passe (ES256)', async ({ client, assert }) => {
    const token = await accountWithToken(client)
    const device = authenticator('ec')

    const created = await register(client, token, device)
    created.assertStatus(201)
    assert.equal(created.body().name, 'Ordinateur de test')
    assert.notProperty(created.body(), 'publicKey')

    const list = await client.get('/api/me/passkeys').bearerToken(token)
    assert.lengthOf(list.body().passkeys, 1)

    const options = await client.post('/api/auth/passkey/options')
    assert.equal(options.body().rpId, RP_ID)
    assert.equal(options.body().userVerification, 'required')

    const login = await client
      .post('/api/auth/passkey')
      .json(assertion(device, options.body().challenge))
    login.assertStatus(200)
    assert.equal(login.body().user.email, EMAIL)
    const me = await client.get('/api/me').bearerToken(login.body().token)
    me.assertStatus(200)

    const stored = await Passkey.findByOrFail('credentialId', b64u(device.id))
    assert.equal(stored.signCount, 1)
    assert.isNotNull(stored.lastUsedAt)
  })

  test('connexion avec une clé RSA (RS256)', async ({ client }) => {
    const token = await accountWithToken(client)
    const device = authenticator('rsa')
    const registered = await register(client, token, device)
    registered.assertStatus(201)
    const login = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client)))
    login.assertStatus(200)
  })

  test('défi rejoué refusé', async ({ client }) => {
    const token = await accountWithToken(client)
    const device = authenticator()
    const registered = await register(client, token, device)
    registered.assertStatus(201)

    const challenge = await loginChallenge(client)
    const first = await client.post('/api/auth/passkey').json(assertion(device, challenge))
    first.assertStatus(200)
    const replay = await client.post('/api/auth/passkey').json(assertion(device, challenge))
    replay.assertStatus(410)

    const invented = await client
      .post('/api/auth/passkey')
      .json(assertion(device, b64u(randomBytes(32))))
    invented.assertStatus(410)
  })

  test('signature falsifiée, mauvaise origine, compteur qui recule : refus', async ({
    client,
    assert,
  }) => {
    const token = await accountWithToken(client)
    const device = authenticator()
    const registered = await register(client, token, device)
    registered.assertStatus(201)

    const forged = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client), { signer: authenticator().privateKey }))
    forged.assertStatus(400)
    assert.match(forged.body().error, /n’a pas pu être vérifiée/)

    const phishing = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client), { origin: 'https://terra-nova.evil' }))
    phishing.assertStatus(400)
    assert.match(phishing.body().error, /Origine/)

    const advanced = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client), { counter: 5 }))
    advanced.assertStatus(200)
    const cloned = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client), { counter: 3 }))
    cloned.assertStatus(400)
    assert.match(cloned.body().error, /refusée par sécurité/)
  })

  test('clé inconnue et présence non vérifiée refusées', async ({ client }) => {
    const stranger = authenticator()
    const unknown = await client
      .post('/api/auth/passkey')
      .json(assertion(stranger, await loginChallenge(client)))
    unknown.assertStatus(400)

    const token = await accountWithToken(client)
    const device = authenticator()
    const options = await client
      .post('/api/me/passkeys/options')
      .bearerToken(token)
      .json({ password: PASSWORD })
    const withoutUv = {
      ...registration(device, options.body().challenge),
      authenticatorData: b64u(authData(0x41, 0, device.id)),
    }
    const refused = await client.post('/api/me/passkeys').bearerToken(token).json(withoutUv)
    refused.assertStatus(400)
  })

  test('ajout : mot de passe exigé, défi d’un autre site ou rejoué refusé', async ({ client }) => {
    const token = await accountWithToken(client)
    const device = authenticator()

    const wrong = await client
      .post('/api/me/passkeys/options')
      .bearerToken(token)
      .json({ password: 'pas-le-bon' })
    wrong.assertStatus(422)

    const options = await client
      .post('/api/me/passkeys/options')
      .bearerToken(token)
      .json({ password: PASSWORD })
    const otherSite = {
      ...registration(device, options.body().challenge),
      authenticatorData: b64u(authData(0x45, 0, device.id, 'autre-site.example')),
    }
    const refused = await client.post('/api/me/passkeys').bearerToken(token).json(otherSite)
    refused.assertStatus(400)
    // Le défi a été consommé par la tentative refusée.
    const replay = await client
      .post('/api/me/passkeys')
      .bearerToken(token)
      .json(registration(device, options.body().challenge))
    replay.assertStatus(410)
  })

  test('retrait d’une clé : seulement la sienne', async ({ client }) => {
    const token = await accountWithToken(client)
    const device = authenticator()
    const created = await register(client, token, device)

    const other = await User.create({
      fullName: 'Autre',
      email: 'autre@test.local',
      password: PASSWORD,
      role: 'citoyen',
    })
    const otherLogin = await client
      .post('/api/auth/login')
      .json({ email: other.email, password: PASSWORD })
    const foreign = await client
      .delete(`/api/me/passkeys/${created.body().id}`)
      .bearerToken(otherLogin.body().token)
    foreign.assertStatus(404)

    const removed = await client.delete(`/api/me/passkeys/${created.body().id}`).bearerToken(token)
    removed.assertStatus(204)
    const login = await client
      .post('/api/auth/passkey')
      .json(assertion(device, await loginChallenge(client)))
    login.assertStatus(400)
  })

  test('routes de gestion en 401 sans jeton', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/me/passkeys'),
      client.post('/api/me/passkeys/options').json({ password: PASSWORD }),
      client.post('/api/me/passkeys').json({}),
      client.delete('/api/me/passkeys/1'),
    ])
    responses.forEach((response) => response.assertStatus(401))
  })
})
