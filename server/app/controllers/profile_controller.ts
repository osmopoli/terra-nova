import type { HttpContext } from '@adonisjs/core/http'
import AuditService from '#services/audit_service'
import { updateProfileValidator } from '#validators/auth'

export default class ProfileController {
  async show({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  /** Seul le nom est modifiable ici (pas d'e-mail ni de mot de passe). */
  async update(ctx: HttpContext) {
    const { auth, request } = ctx
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)
    const previousName = user.fullName
    await user.merge(payload).save()
    await AuditService.log(ctx, {
      action: 'account_updated',
      objectType: 'account',
      objectId: user.id,
      before: { fullName: previousName },
      after: { fullName: user.fullName },
    })

    return user
  }
}
