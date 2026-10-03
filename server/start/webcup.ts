import app from '@adonisjs/core/services/app'
import { startPolling, stopPolling } from '#services/webcup_sync'

/** Polling de l'API Webcup uniquement quand le serveur HTTP tourne (pas en test ni dans les commandes ace). */
if (app.getEnvironment() === 'web' && !app.inTest) {
  startPolling()
  app.terminating(() => stopPolling())
}
