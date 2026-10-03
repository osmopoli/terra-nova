import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { citizenIdValidator, listCitizensValidator } from '#validators/citizens'

const PER_PAGE = 20
const NOT_FOUND = { error: 'Compte citoyen introuvable.' }

/** Administration des comptes citoyens par les agents (F34). Seuls les citoyens sont visibles. */
export default class CitizensController {
  async index({ request }: HttpContext) {
    const { q, page } = await request.validateUsing(listCitizensValidator)
    const citizens = await User.query()
      .where('role', 'citoyen')
      .if(q, (query) => {
        // `!` sert d'échappement : %, _ saisis par l'agent restent des caractères littéraux.
        const like = `%${q!.toLowerCase().replace(/[!%_]/g, '!$&')}%`
        query.whereRaw("(lower(full_name) like ? escape '!' or lower(email) like ? escape '!')", [
          like,
          like,
        ])
      })
      .orderBy('id', 'desc')
      .paginate(page ?? 1, PER_PAGE)

    return citizens.toJSON()
  }

  async disable({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(citizenIdValidator)
    const citizen = await User.query().where('role', 'citoyen').where('id', params.id).first()
    if (!citizen) return response.notFound(NOT_FOUND)

    await citizen.disable()
    return citizen
  }

  async enable({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(citizenIdValidator)
    const citizen = await User.query().where('role', 'citoyen').where('id', params.id).first()
    if (!citizen) return response.notFound(NOT_FOUND)

    await citizen.enable()
    return citizen
  }
}
