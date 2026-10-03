import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
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
}
