import { test } from '@japa/runner'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { co2Grams, ESTIMATES, grade, measureSobriety } from '#services/sobriety'

/** Faux build Vite : coquille, une image en deux formats, une police auto-hébergée. */
function fakeBuild() {
  const dir = mkdtempSync(join(tmpdir(), 'sobriete-'))
  mkdirSync(join(dir, 'assets'))
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html><html><head>
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=A:wght@400&family=B:wght@700&display=swap" />
    <script type="module" crossorigin src="/assets/index-abc.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-abc.css">
    </head><body><div id="root"></div></body></html>`
  )
  writeFileSync(join(dir, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>')
  writeFileSync(join(dir, 'manifest.webmanifest'), '{"name":"Test"}')
  writeFileSync(join(dir, 'assets', 'index-abc.js'), 'console.log("x");'.repeat(2000))
  writeFileSync(
    join(dir, 'assets', 'index-abc.css'),
    '@font-face{src:url(/assets/police-1.woff2)}body{color:red}'
  )
  writeFileSync(join(dir, 'assets', 'police-1.woff2'), Buffer.alloc(9000))
  writeFileSync(join(dir, 'assets', 'planete-orbite-h1.webp'), Buffer.alloc(30000))
  writeFileSync(join(dir, 'assets', 'planete-orbite-h2.avif'), Buffer.alloc(12000))
  return dir
}

test.group('Sobriété : calcul depuis le build', (group) => {
  let dir: string
  group.each.setup(() => {
    dir = fakeBuild()
    return () => rmSync(dir, { recursive: true, force: true })
  })

  test('sans build, aucune mesure inventée', ({ assert }) => {
    assert.isNull(measureSobriety(join(dir, 'absent'), {}))
  })

  test('pèse la coquille réellement servie, compressée comme en production', ({ assert }) => {
    const result = measureSobriety(dir, { '/meta': { roles: [] } })!
    const home = result.pages.find((p) => p.path === '/')!
    const urls = home.resources.map((r) => r.url)

    // index.html, icône, manifeste, CSS, police auto-hébergée, JS ; preconnect ignoré.
    for (const url of [
      '/index.html',
      '/icon.svg',
      '/manifest.webmanifest',
      '/assets/index-abc.js',
    ]) {
      assert.include(urls, url)
    }
    assert.include(urls, '/assets/police-1.woff2')
    assert.notInclude(urls, 'https://fonts.googleapis.com')

    const js = home.resources.find((r) => r.url === '/assets/index-abc.js')!
    assert.equal(js.bytes, 34000)
    assert.isBelow(js.transferred, js.bytes / 10, 'texte compressé en Brotli')

    const font = home.resources.find((r) => r.type === 'woff2' && !r.estimated)!
    assert.equal(font.transferred, 9000, 'binaire compté tel quel')
  })

  test('Google Fonts : feuille + une police par famille, marquées estimées', ({ assert }) => {
    const home = measureSobriety(dir, {})!.pages[0]
    const estimated = home.resources.filter((r) => r.estimated && r.type !== 'json')
    assert.lengthOf(estimated, 3)
    assert.equal(estimated.filter((r) => r.type === 'woff2').length, 2)
    assert.isTrue(home.estimated)
  })

  test('visuel de page : le format le plus léger (AVIF du <picture>)', ({ assert }) => {
    const result = measureSobriety(dir, {})!
    const home = result.pages.find((p) => p.path === '/')!
    const services = result.pages.find((p) => p.path === '/services')!
    assert.include(
      home.resources.map((r) => r.url),
      '/assets/planete-orbite-h2.avif'
    )
    assert.equal(
      home.requests,
      services.requests,
      'une image en plus, une liste de données en moins'
    )
    assert.deepEqual(
      result.images.map((i) => i.format),
      ['webp', 'avif', 'svg']
    )
  })

  test('API : /meta mesurée, données variables estimées', ({ assert }) => {
    const result = measureSobriety(dir, { '/meta': { roles: [{ value: 'a', label: 'A' }] } })!
    const services = result.pages.find((p) => p.path === '/services')!
    const meta = services.resources.find((r) => r.url === '/api/meta')!
    const list = services.resources.find((r) => r.url === '/api/services')!
    assert.equal(meta.bytes, JSON.stringify({ roles: [{ value: 'a', label: 'A' }] }).length)
    assert.isUndefined(meta.estimated)
    assert.isTrue(list.estimated)
    assert.equal(list.transferred, ESTIMATES.dynamicApi)
    assert.equal(services.navigationTransferred, meta.transferred + list.transferred)
  })

  test('totaux, CO2 et note cohérents', ({ assert }) => {
    const result = measureSobriety(dir, {}, new Date('2026-10-03T12:00:00Z'))!
    assert.equal(result.generatedAt, '2026-10-03T12:00:00.000Z')
    for (const page of result.pages) {
      assert.equal(
        page.transferred,
        page.resources.reduce((total, r) => total + r.transferred, 0)
      )
      assert.equal(page.co2Grams, co2Grams(page.transferred))
      assert.oneOf(page.grade, ['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    }
    assert.equal(result.summary.pages, 6)
  })
})

test.group('Sobriété : formules', () => {
  test('CO2 : environ 0,36 g par Mo (Sustainable Web Design v3)', ({ assert }) => {
    assert.equal(co2Grams(1e6), 0.358)
  })

  test('note A à G', ({ assert }) => {
    assert.deepEqual(grade(0, 0), { score: 100, grade: 'A' })
    assert.equal(grade(200, 10).grade, 'A')
    assert.equal(grade(1000, 25).grade, 'D')
    assert.equal(grade(5000, 100).grade, 'G')
  })
})
