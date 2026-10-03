import { test } from '@japa/runner'

test.group('Sobriété : compression et cache', () => {
  test('GET /api/meta est compressé en gzip et mis en cache court', async ({ client, assert }) => {
    const response = await client.get('/api/meta').header('Accept-Encoding', 'gzip').redirects(0)
    response.assertStatus(200)
    assert.equal(response.header('content-encoding'), 'gzip')
    assert.include(response.header('cache-control'), 'max-age=300')
    assert.include(response.header('vary'), 'Accept-Encoding')
  })

  test('sans Accept-Encoding gzip, la réponse reste en clair', async ({ client, assert }) => {
    const response = await client.get('/api/meta').header('Accept-Encoding', 'identity')
    response.assertStatus(200)
    assert.isUndefined(response.header('content-encoding'))
    assert.isArray(response.body().roles)
  })

  test('GET /api/health n’est jamais compressé', async ({ client, assert }) => {
    const response = await client.get('/api/health').header('Accept-Encoding', 'gzip')
    response.assertStatus(200)
    assert.isUndefined(response.header('content-encoding'))
  })

  test('une route protégée refuse toujours sans jeton', async ({ client }) => {
    const response = await client.get('/api/agent/overview').header('Accept-Encoding', 'gzip')
    response.assertStatus(401)
  })
})
