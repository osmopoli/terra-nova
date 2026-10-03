import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
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

  async updateRole({ auth, request, response }: HttpContext) {
    const { role, params } = await request.validateUsing(updateRoleValidator)
    const target = await User.find(params.id)
    if (!target) {
      return response.notFound({ error: 'Compte introuvable.' })
    }
    if (target.id === auth.getUserOrFail().id) {
      return response.conflict({ error: 'Vous ne pouvez pas modifier votre propre rôle.' })
    }

    await target.changeRole(role)
    return target
  }
}
