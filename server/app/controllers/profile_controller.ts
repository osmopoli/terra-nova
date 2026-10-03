import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  /** Nom, quartier et vulnérabilité modifiables ici (pas d'e-mail ni de mot de passe). */
  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)
    await user.merge(payload).save()

    return user
  }
}
