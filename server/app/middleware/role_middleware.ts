import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Role } from '#constants/domain'

/**
 * Restreint une route aux profils listés (403 sinon).
 * À placer après `middleware.auth()` : le rôle est relu en base avec l'utilisateur
 * du token, jamais pris dans la requête.
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: readonly Role[] }) {
    const user = ctx.auth.getUserOrFail()
    if (!options.roles.includes(user.role)) {
      return ctx.response.forbidden({
        error: "Accès refusé : votre profil n'autorise pas cette action.",
      })
    }
    return next()
  }
}
