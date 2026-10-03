import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AuditService from '#services/audit_service'
import { listUsersValidator, updateRoleValidator } from '#validators/admin'

const PER_PAGE = 20

/** Gestion des comptes : réservée aux administrateurs. */
export default class AdminUsersController {
  async index({ request }: HttpContext) {
    const { role, page } = await request.validateUsing(listUsersValidator)
    const users = await User.query()
      .if(role, (query) => query.where('role', role!))
      .orderBy('id', 'asc')
      .paginate(page ?? 1, PER_PAGE)

    return users.toJSON()
  }

  async updateRole(ctx: HttpContext) {
    const { auth, request, response } = ctx
    const { role, params } = await request.validateUsing(updateRoleValidator)
    const target = await User.find(params.id)
    if (!target) {
      return response.notFound({ error: 'Compte introuvable.' })
    }
    if (target.id === auth.getUserOrFail().id) {
      return response.conflict({ error: 'Vous ne pouvez pas modifier votre propre rôle.' })
    }

    const previousRole = target.role
    await target.changeRole(role)
    await AuditService.log(ctx, {
      action: 'role_changed',
      objectType: 'account',
      objectId: target.id,
      before: { role: previousRole, email: target.email },
      after: { role },
    })
    return target
  }
}
