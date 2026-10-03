import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import {
  CONTACT_SERVICES,
  CONTACT_STATUSES,
  DATA_EXPORT_MAX_CONNECTIONS,
  DATA_SECTIONS,
  DEFAULT_ROLE,
  LOGIN_OUTCOMES,
  ROLES,
  type DataSection,
} from '#constants/domain'
import ContactMessage from '#models/contact_message'
import LoginAttempt from '#models/login_attempt'
import { checkLock, lockMessage, recordAttempt } from '#services/login_guard'
import { deleteAccountValidator, updateProfileValidator } from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  /**
   * Export des données personnelles (portabilité, WEBC-82) : uniquement `auth.user`, aucun id
   * lu dans la requête. Sérialisation explicite : ni mot de passe, ni jeton, ni champ interne.
   */
  async dataExport({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const [messages, attempts] = await Promise.all([
      ContactMessage.query().where('userId', user.id).orderBy('createdAt', 'desc'),
      LoginAttempt.query()
        .where('email', user.email)
        .orderBy('attemptedAt', 'desc')
        .limit(DATA_EXPORT_MAX_CONNECTIONS),
    ])

    const data: Record<DataSection, unknown> = {
      identite: {
        nomComplet: user.fullName,
        email: user.email,
        profil: ROLES[user.role],
        compteCreeLe: user.createdAt.toISO(),
        premiereConnexionTerminee: user.onboardedAt?.toISO() ?? null,
      },
      preferences: [],
      demandes: messages.map((m) => ({
        numeroSuivi: m.trackingCode,
        objet: m.subject,
        service: CONTACT_SERVICES[m.service] ?? m.service,
        message: m.message,
        statut: CONTACT_STATUSES[m.status] ?? m.status,
        envoyeLe: m.createdAt.toISO(),
      })),
      rendez_vous: [],
      notifications: [],
      connexions: attempts.map((a) => ({
        date: new Date(a.attemptedAt).toISOString(),
        resultat: LOGIN_OUTCOMES[a.outcome] ?? a.outcome,
        adresseIp: a.ip,
      })),
    }

    return {
      generatedAt: new Date().toISOString(),
      format: 'nova-terra-data-export/1',
      sections: (Object.keys(DATA_SECTIONS) as DataSection[]).map((key) => {
        const value = data[key]
        return {
          key,
          label: DATA_SECTIONS[key].label,
          purpose: DATA_SECTIONS[key].purpose,
          retention: DATA_SECTIONS[key].retention,
          count: Array.isArray(value) ? value.length : 1,
          data: value,
        }
      }),
    }
  }

  /** Seul le nom est modifiable ici (pas d'e-mail ni de mot de passe). */
  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)
    await user.merge(payload).save()

    return user
  }

  /** Marque le guide de première connexion comme vu (idempotent : garde la première date). */
  async completeOnboarding({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.onboardedAt) {
      user.onboardedAt = DateTime.now()
      await user.save()
    }
    return user
  }

  /**
   * Suppression du compte de l'utilisateur authentifié (jamais d'id dans l'URL).
   * Mot de passe redemandé ; jetons et messages liés partent en cascade (FK).
   * Réservé aux citoyens : on ne supprime pas un admin ou un agent par erreur.
   */
  async destroy({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== DEFAULT_ROLE) {
      return response.forbidden({
        error: 'Accès refusé : seul un compte citoyen peut être supprimé ici.',
      })
    }

    const { password } = await request.validateUsing(deleteAccountValidator)

    // Même limiteur que la connexion : on ne peut pas deviner le mot de passe via cette route.
    const ip = request.ip()
    const lock = await checkLock(user.email, ip)
    if (lock) {
      await recordAttempt(user.email, ip, 'bloque', lock.scope)
      const retryAfter = Math.ceil((lock.until - Date.now()) / 1000)
      response.header('Retry-After', String(retryAfter))
      return response.tooManyRequests({
        error: lockMessage(lock.until),
        retryAfterSeconds: retryAfter,
      })
    }

    if (!(await hash.verify(user.password, password))) {
      await recordAttempt(user.email, ip, 'echec')
      return response.unprocessableEntity({
        errors: [
          {
            field: 'password',
            message: 'Mot de passe incorrect : le compte n’a pas été supprimé.',
          },
        ],
      })
    }

    await user.delete()
    return response.noContent()
  }
}
