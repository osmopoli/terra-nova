/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { middleware } from '#start/kernel'
import { ACCESS, META } from '#constants/domain'
import env from '#start/env'

const NewsController = () => import('#controllers/news_controller')
const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const AgentController = () => import('#controllers/agent_controller')
const AdminUsersController = () => import('#controllers/admin_users_controller')
const WebcupController = () => import('#controllers/webcup_controller')
const ContactMessagesController = () => import('#controllers/contact_messages_controller')
const ServicesController = () => import('#controllers/services_controller')
const AdminServiceTranslationsController = () =>
  import('#controllers/admin_service_translations_controller')
const AgentMessagesController = () => import('#controllers/agent_messages_controller')
const AlertsController = () => import('#controllers/alerts_controller')
const DemandesController = () => import('#controllers/demandes_controller')
const AgentDemandesController = () => import('#controllers/agent_demandes_controller')

router
  .group(() => {
    router.get('/health', async () => {
      let database: 'ok' | 'error' = 'ok'
      try {
        await db.rawQuery('SELECT 1')
      } catch {
        database = 'error'
      }

      return {
        status: 'ok',
        service: env.get('APP_NAME', 'nova-terra'),
        database,
        time: new Date().toISOString(),
      }
    })

    /** Listes fermées pour les formulaires du front. */
    router.get('/meta', async () =>
      Object.fromEntries(
        Object.entries(META).map(([name, map]) => [
          name,
          Object.entries(map).map(([value, label]) => ({ value, label })),
        ])
      )
    )

    /** Actualités de la ville : lecture publique, publication agent / admin. */
    router.get('/news', [NewsController, 'index'])
    router.get('/news/:id', [NewsController, 'show'])
    router
      .group(() => {
        router.post('/news', [NewsController, 'store'])
        router.patch('/news/:id', [NewsController, 'update'])
        router.delete('/news/:id', [NewsController, 'destroy'])
      })
      .use([middleware.auth(), middleware.role({ roles: ACCESS.agent })])

    router.post('/auth/register', [AuthController, 'register'])
    router.post('/auth/login', [AuthController, 'login'])

    router
      .group(() => {
        router.post('/auth/logout', [AuthController, 'logout'])
        router.get('/me', [ProfileController, 'show'])
        router.patch('/me', [ProfileController, 'update'])
        router.post('/me/onboarding', [ProfileController, 'completeOnboarding'])
        router.delete('/me', [ProfileController, 'destroy'])

        /** Messages aux services municipaux (WEBC-6) : chaque habitant ne voit que les siens. */
        router.get('/contact-messages', [ContactMessagesController, 'index'])
        router.post('/contact-messages', [ContactMessagesController, 'store'])
        router.get('/contact-messages/:code', [ContactMessagesController, 'show'])
      })
      .use(middleware.auth())

    /** Espace agent municipal : 401 sans token, 403 pour un citoyen. */
    router
      .group(() => {
        router.get('/overview', [AgentController, 'overview'])
        router.patch('/services/:slug/availability', [ServicesController, 'updateAvailability'])
        router.get('/webcup/requests', [WebcupController, 'index'])
        router.post('/webcup/requests/seen', [WebcupController, 'markSeen'])
        /** Messages des habitants (F22) : liste, filtre « à traiter », changement de statut. */
        router.get('/contact-messages', [AgentMessagesController, 'index'])
        router
          .patch('/contact-messages/:code', [AgentMessagesController, 'updateStatus'])
          .where('code', /^NT-[A-Za-z0-9]{6}$/)
        router.get('/demandes', [AgentDemandesController, 'index'])
        router.get('/demandes/:id', [AgentDemandesController, 'show'])
        router.patch('/demandes/:id', [AgentDemandesController, 'update'])
      })
      .prefix('/agent')
      .use([middleware.auth(), middleware.role({ roles: ACCESS.agent })])

    /** Fonctions sensibles : administrateurs uniquement. */
    router
      .group(() => {
        router.get('/users', [AdminUsersController, 'index'])
        router.patch('/users/:id/role', [AdminUsersController, 'updateRole'])
        router.get('/login-attempts', [AdminUsersController, 'loginAttempts'])
        router.post('/webcup/refresh', [WebcupController, 'refresh'])
        router.put('/services/:slug/disable', [ServicesController, 'disable'])
        router.put('/services/:slug/enable', [ServicesController, 'enable'])
        // F27 : traduction des contenus d'un service (ex. version EN).
        router.get('/services/:slug/translations/:lang', [
          AdminServiceTranslationsController,
          'show',
        ])
        router.put('/services/:slug/translations/:lang', [
          AdminServiceTranslationsController,
          'update',
        ])
      })
      .prefix('/admin')
      .use([middleware.auth(), middleware.role({ roles: ACCESS.admin })])

    /** Alertes générales : bannière publique, gestion réservée aux administrateurs. */
    router.get('/alerts/active', [AlertsController, 'active'])
    router
      .group(() => {
        router.get('/', [AlertsController, 'index'])
        router.post('/', [AlertsController, 'store'])
        router.patch('/:id', [AlertsController, 'update'])
        router.delete('/:id', [AlertsController, 'destroy'])
      })
      .prefix('/alerts')
      .use([middleware.auth(), middleware.role({ roles: ACCESS.admin })])
    /** Demandes des habitants (« Mes demandes ») : citoyens uniquement, 403 sinon. */
    router
      .group(() => {
        router.get('/', [DemandesController, 'index'])
        router.post('/', [DemandesController, 'store'])
        router.post('/signalements', [DemandesController, 'storeIssue'])
        router.get('/:id', [DemandesController, 'show'])
      })
      .prefix('/demandes')
      .use([middleware.auth(), middleware.role({ roles: ACCESS.citoyen })])

    // Routes métier : à ajouter ici (préfixe /api déjà appliqué, jamais de /spike).

    // Annuaire des services municipaux : public, lecture seule.
    router.get('/services', [ServicesController, 'index'])
    router.get('/services/:slug', [ServicesController, 'show']).where('slug', /^[a-z0-9-]{1,80}$/)

    router.any('/*', async ({ response }) => {
      return response.notFound({ error: 'Route introuvable' })
    })
  })
  .prefix('/api')

/**
 * Fallback SPA : toute route hors /api renvoie le build React (public/index.html).
 * Les fichiers statiques (assets) sont servis en amont par @adonisjs/static.
 */
router.get('*', async ({ request, response }) => {
  // Un fichier introuvable (ex. /assets/x.js) reste une 404, pas la page React.
  if (/\.[a-z0-9]+$/i.test(request.url())) {
    return response.notFound({ error: 'Fichier introuvable' })
  }

  const indexHtml = app.publicPath('index.html')
  if (!existsSync(indexHtml)) {
    return response.notFound({ error: 'Front non buildé (npm run build à la racine)' })
  }
  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.download(indexHtml)
})
