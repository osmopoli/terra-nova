import { test } from '@japa/runner'
import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'

test.group('GET /api/sobriete', () => {
  test('public, mis en cache 5 minutes, chiffres des pages principales', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/sobriete')

    if (!existsSync(app.publicPath('index.html'))) {
      // Front non buildé sur cette machine : refus explicite, jamais de chiffres inventés.
      response.assertStatus(503)
      assert.match(response.body().error, /Mesures indisponibles/)
      return
    }

    response.assertStatus(200)
    assert.include(response.header('cache-control'), 'max-age=300')
    const body = response.body()
    assert.isTrue(body.estimate)
    assert.properties(body.method, ['weight', 'co2', 'grade'])
    assert.equal(body.pages[0].path, '/')
    for (const page of body.pages) {
      assert.isAbove(page.transferred, 0)
      assert.isAbove(page.requests, 0)
      assert.match(page.grade, /^[A-G]$/)
    }
    // La page Sobriété compte le poids de cette réponse elle-même.
    const sobriety = body.pages.find((p: { path: string }) => p.path === '/sobriete')
    const self = sobriety.resources.find((r: { url: string }) => r.url === '/api/sobriete')
    assert.isUndefined(self.estimated)
  })
})
