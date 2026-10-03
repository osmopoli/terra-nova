import { defineConfig } from '@adonisjs/static'

/**
 * Configuration options to tweak the static files middleware.
 * The complete set of options are documented on the
 * official documentation website.
 *
 * https://docs.adonisjs.com/guides/static-assets
 */
const staticServerConfig = defineConfig({
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',
  // Les fichiers de /assets/ sont hachés par Vite : cache long. Le reste (index.html…) se revalide.
  headers: (path) => ({
    'Cache-Control': path.replaceAll('\\', '/').includes('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  }),
})

export default staticServerConfig
