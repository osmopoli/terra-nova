import { gzipSync } from 'node:zlib'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** En dessous de ce poids, la compression coûte plus qu'elle ne rapporte. */
const MIN_BYTES = 1024

/**
 * Compresse en gzip les réponses JSON de l'API (zlib natif, aucune dépendance).
 * `GET /api/health` n'est jamais modifié.
 */
export default class CompressionMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    await next()

    const url = request.url()
    if (!url.startsWith('/api/') || url === '/api/health') return
    if (request.method() === 'HEAD' || !response.hasLazyBody || response.hasStream) return
    if (!/\bgzip\b/.test(request.header('accept-encoding') ?? '')) return
    if (response.getHeader('content-encoding')) return

    const body = response.getBody()
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    if (text === undefined || Buffer.byteLength(text) < MIN_BYTES) return

    const contentType =
      typeof body === 'string'
        ? String(response.getHeader('content-type') ?? 'text/plain; charset=utf-8')
        : 'application/json; charset=utf-8'

    response.append('Vary', 'Accept-Encoding')
    response.header('Content-Encoding', 'gzip')
    response.header('Content-Type', contentType)
    response.send(gzipSync(text))
  }
}
