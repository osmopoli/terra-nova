import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, sep } from 'node:path'
import { brotliCompressSync, constants } from 'node:zlib'

/**
 * Diagnostic de sobriété numérique (F57) : poids et requêtes des pages principales, calculés à
 * partir des fichiers réellement servis (build Vite dans `public/`), plus une estimation CO2.
 *
 * Le front est une application monopage : chaque page charge la même coquille (index.html, JS,
 * CSS, icône, manifeste, polices) puis ses visuels et ses données d'API.
 */

const KB = 1024

/** Pages principales : visuels propres (préfixe du fichier dans assets/) et appels d'API. */
export const MAIN_PAGES = [
  { path: '/', label: 'Accueil (visiteur)', images: ['planete-orbite'], api: ['/meta'] },
  { path: '/connexion', label: 'Connexion', images: ['planete-horizon'], api: ['/meta'] },
  { path: '/services', label: 'Services', images: [], api: ['/meta', '/services'] },
  { path: '/contact', label: 'Contact', images: [], api: ['/meta'] },
  { path: '/accessibilite', label: 'Accessibilité', images: [], api: ['/meta'] },
  { path: '/sobriete', label: 'Sobriété numérique', images: [], api: ['/meta', '/sobriete'] },
]

/**
 * Fichiers texte : compressés en Brotli par le serveur web en production (Apache sur HODI,
 * `Content-Encoding: br` vérifié). La qualité 5 reproduit au octet près la taille servie.
 */
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json', '.webmanifest', '.txt'])
const IMAGE = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg', '.gif', '.svg'])

/** Ressources impossibles à peser depuis le serveur : ordres de grandeur fixes (estimation). */
export const ESTIMATES = {
  /** Feuille Google Fonts (CSS compressé). */
  fontCss: 2 * KB,
  /** Une famille Google Fonts, sous-ensemble latin en woff2 (mesuré : 22 à 27 Ko). */
  fontFamily: 25 * KB,
  /** Réponse d'API dont le contenu varie (liste des services…), compressée. */
  dynamicApi: 3 * KB,
}

/** Sustainable Web Design (v3) : 0,81 kWh par Go transféré × 442 g CO2e par kWh. */
const KWH_PER_GB = 0.81
const G_CO2_PER_KWH = 442
export const co2Grams = (bytes: number) =>
  Math.round((bytes / 1e9) * KWH_PER_GB * G_CO2_PER_KWH * 1000) / 1000

/**
 * Note A–G inspirée d'EcoIndex (ce n'est PAS le calcul officiel) :
 * score = 100 − 60 × min(1, poids / 2 000 Ko) − 40 × min(1, requêtes / 50).
 */
export function grade(weightKb: number, requests: number) {
  const score = Math.round(
    100 - 60 * Math.min(1, weightKb / 2000) - 40 * Math.min(1, requests / 50)
  )
  const thresholds: [number, string][] = [
    [80, 'A'],
    [70, 'B'],
    [60, 'C'],
    [50, 'D'],
    [40, 'E'],
    [30, 'F'],
  ]
  return { score, grade: thresholds.find(([min]) => score >= min)?.[1] ?? 'G' }
}

const brotli = (buffer: Buffer | string) =>
  brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }).length

type Resource = {
  url: string
  type: string
  bytes: number
  transferred: number
  estimated?: boolean
}

function weigh(publicDir: string, url: string): Resource | null {
  const file = normalize(join(publicDir, url))
  if (!file.startsWith(normalize(publicDir) + sep) || !existsSync(file)) return null
  if (!statSync(file).isFile()) return null
  const buffer = readFileSync(file)
  const ext = extname(file).toLowerCase()
  return {
    url: '/' + url.replace(/^\/+/, ''),
    type: ext.slice(1),
    bytes: buffer.length,
    transferred: TEXT.has(ext) ? brotli(buffer) : buffer.length,
  }
}

const isLocal = (url: string) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)
const clean = (url: string) => url.split('#')[0].split('?')[0]

/** URL chargées par index.html : scripts, feuilles de style, icône, manifeste, préchargements. */
function shellReferences(html: string) {
  const local: string[] = []
  const external: string[] = []
  const add = (url?: string) => {
    if (!url) return
    if (isLocal(url)) local.push(clean(url))
    else external.push(url.startsWith('//') ? `https:${url}` : url)
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = /\brel\s*=\s*["']([^"']+)/i.exec(tag)?.[1] ?? ''
    if (!/stylesheet|icon|manifest|modulepreload|preload/i.test(rel)) continue
    add(/\bhref\s*=\s*["']([^"']+)/i.exec(tag)?.[1])
  }
  for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)/gi)) add(src)
  return { local: [...new Set(local)], external: [...new Set(external)] }
}

/** Fichiers locaux appelés par une feuille de style (polices auto-hébergées, images de fond). */
function cssReferences(css: string, cssUrl: string) {
  const dir = cssUrl.slice(0, cssUrl.lastIndexOf('/') + 1)
  return [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)]
    .map(([, url]) => url)
    .filter((url) => isLocal(url) && !url.startsWith('data:'))
    .map((url) => (url.startsWith('/') ? clean(url) : clean(dir + url)))
}

function externalResources(urls: string[]): Resource[] {
  return urls.flatMap((url) => {
    if (/fonts\.googleapis\.com\/css/i.test(url)) {
      const families = (url.match(/family=/g) ?? []).length
      const fonts = Array.from({ length: families }, (_, i) => ({
        url: `police Google Fonts ${i + 1}`,
        type: 'woff2',
        bytes: ESTIMATES.fontFamily,
        transferred: ESTIMATES.fontFamily,
        estimated: true,
      }))
      return [
        {
          url,
          type: 'css',
          bytes: ESTIMATES.fontCss,
          transferred: ESTIMATES.fontCss,
          estimated: true,
        },
        ...fonts,
      ]
    }
    return [{ url, type: 'externe', bytes: 20 * KB, transferred: 20 * KB, estimated: true }]
  })
}

/** Images servies (dossier assets/ et racine) : nom, format, poids. */
function listImages(publicDir: string) {
  const images: { url: string; format: string; bytes: number }[] = []
  for (const dir of ['', 'assets']) {
    const abs = join(publicDir, dir)
    if (!existsSync(abs)) continue
    for (const name of readdirSync(abs)) {
      const ext = extname(name).toLowerCase()
      if (!IMAGE.has(ext) || !statSync(join(abs, name)).isFile()) continue
      const url = `${dir ? `/${dir}` : ''}/${name}`
      images.push({ url, format: ext.slice(1), bytes: statSync(join(abs, name)).size })
    }
  }
  return images.sort((a, b) => b.bytes - a.bytes)
}

/**
 * Visuel d'une page : fichier `assets/<préfixe>-<hash>.<ext>`. S'il existe en plusieurs formats
 * (AVIF + WebP dans un <picture>), le plus léger est retenu : c'est celui des navigateurs récents.
 */
function pageImage(publicDir: string, prefix: string): Resource | null {
  const dir = join(publicDir, 'assets')
  if (!existsSync(dir)) return null
  const candidates = readdirSync(dir)
    .filter((name) => IMAGE.has(extname(name).toLowerCase()))
    .filter((name) => name.startsWith(`${prefix}-`) || name.startsWith(`${prefix}.`))
    .map((name) => weigh(publicDir, `assets/${name}`))
    .filter((r): r is Resource => r !== null)
    .sort((a, b) => a.transferred - b.transferred)
  return candidates[0] ?? null
}

const sum = (list: Resource[], key: 'bytes' | 'transferred') =>
  list.reduce((total, r) => total + r[key], 0)

/** Calcule le diagnostic complet. `null` si le front n'est pas buildé. */
export function measureSobriety(
  publicDir: string,
  apiPayloads: Record<string, unknown>,
  now = new Date()
) {
  const indexFile = join(publicDir, 'index.html')
  if (!existsSync(indexFile)) return null

  const refs = shellReferences(readFileSync(indexFile, 'utf8'))
  const shellLocal: Resource[] = [weigh(publicDir, 'index.html')!]
  for (const url of refs.local) {
    const resource = weigh(publicDir, url)
    if (!resource) continue
    shellLocal.push(resource)
    if (resource.type === 'css') {
      for (const nested of cssReferences(readFileSync(join(publicDir, url), 'utf8'), url)) {
        const asset = weigh(publicDir, nested)
        if (asset && !shellLocal.some((r) => r.url === asset.url)) shellLocal.push(asset)
      }
    }
  }
  const shell = [...shellLocal, ...externalResources(refs.external)]

  const apiResource = (path: string): Resource => {
    if (path in apiPayloads) {
      const json = JSON.stringify(apiPayloads[path])
      return {
        url: `/api${path}`,
        type: 'json',
        bytes: Buffer.byteLength(json),
        transferred: brotli(json),
      }
    }
    const size = ESTIMATES.dynamicApi
    return { url: `/api${path}`, type: 'json', bytes: size, transferred: size, estimated: true }
  }

  const pages = MAIN_PAGES.map((page) => {
    const images = page.images
      .map((prefix) => pageImage(publicDir, prefix))
      .filter((r): r is Resource => r !== null)
    const api = page.api.map(apiResource)
    const resources = [...shell, ...images, ...api]
    const transferred = sum(resources, 'transferred')
    const weightKb = Math.round(transferred / KB)
    return {
      path: page.path,
      label: page.label,
      requests: resources.length,
      bytes: sum(resources, 'bytes'),
      transferred,
      weightKb,
      co2Grams: co2Grams(transferred),
      ...grade(weightKb, resources.length),
      /** Changement de page dans l'application déjà chargée : seulement visuels et données. */
      navigationTransferred: sum([...images, ...api], 'transferred'),
      estimated: resources.some((r) => r.estimated),
      resources,
    }
  })

  const average = (key: 'transferred' | 'requests') =>
    Math.round(pages.reduce((total, p) => total + p[key], 0) / pages.length)
  const avgTransferred = average('transferred')
  const avgRequests = average('requests')

  return {
    generatedAt: now.toISOString(),
    estimate: true,
    summary: {
      pages: pages.length,
      transferred: avgTransferred,
      weightKb: Math.round(avgTransferred / KB),
      requests: avgRequests,
      co2Grams: co2Grams(avgTransferred),
      ...grade(Math.round(avgTransferred / KB), avgRequests),
    },
    shell: {
      requests: shell.length,
      bytes: sum(shell, 'bytes'),
      transferred: sum(shell, 'transferred'),
    },
    images: listImages(publicDir),
    method: {
      weight:
        'Fichiers du site mesurés dans le build servi ; texte compressé en Brotli comme le fait le serveur de production, images comptées telles quelles. Premier chargement, sans cache.',
      external:
        'Polices Google Fonts et données d’API variables : ordre de grandeur fixe (estimation), car elles ne se pèsent pas depuis le serveur.',
      co2: 'Modèle Sustainable Web Design (v3) : 0,81 kWh par Go transféré × 442 g de CO2e par kWh (moyenne mondiale), soit environ 0,36 g par Mo. Ordre de grandeur, pas une mesure.',
      grade:
        'Note maison inspirée d’EcoIndex : 100 − 60 × min(1, poids / 2 000 Ko) − 40 × min(1, requêtes / 50). A ≥ 80, B ≥ 70, C ≥ 60, D ≥ 50, E ≥ 40, F ≥ 30, sinon G. Ce n’est pas la note officielle EcoIndex.',
    },
    pages,
  }
}
