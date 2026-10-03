import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

/** Outils réservés aux agents municipaux (et aux admins). */
export default class AgentController {
  async overview({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return {
      role: user.role,
      accounts: await User.countByRole(),
    }
  }
}
