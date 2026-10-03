import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import NewsPost from '#models/news_post'
import {
  createNewsValidator,
  listNewsValidator,
  newsIdValidator,
  updateNewsValidator,
} from '#validators/news'

const NOT_FOUND = { error: 'Actualité introuvable.' }
const FORBIDDEN = { error: 'Vous ne pouvez modifier que vos propres actualités.' }

/** Actualités de la ville : lecture publique, publication par les agents et admins. */
export default class NewsController {
  /** Liste publique, la plus récente d'abord, filtrable par catégorie. */
  async index({ request }: HttpContext) {
    const {
      category,
      page = 1,
      perPage = 12,
    } = await request.validateUsing(listNewsValidator, {
      data: request.qs(),
    })

    return NewsPost.query()
      .withScopes((scopes) => scopes.visible())
      .if(category, (query) => query.where('category', category!))
      .preload('author')
      .orderBy('published_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, perPage)
  }

  /** Détail public : une actualité programmée n'est pas encore visible. */
  async show({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(newsIdValidator, {
      data: { params: request.params() },
    })
    const post = await NewsPost.query()
      .withScopes((scopes) => scopes.visible())
      .where('id', params.id)
      .preload('author')
      .first()

    return post ?? response.notFound(NOT_FOUND)
  }

  async store({ auth, request, response }: HttpContext) {
    const { publishedAt, ...payload } = await request.validateUsing(createNewsValidator)
    const post = await NewsPost.create({
      ...payload,
      publishedAt: publishedAt ? DateTime.fromJSDate(publishedAt) : DateTime.now(),
      authorId: auth.getUserOrFail().id,
    })
    await post.load('author')

    return response.created(post)
  }

  async update({ auth, request, response }: HttpContext) {
    const { params } = await request.validateUsing(newsIdValidator, {
      data: { params: request.params() },
    })
    const post = await NewsPost.find(params.id)
    if (!post) return response.notFound(NOT_FOUND)
    if (!post.canBeEditedBy(auth.getUserOrFail())) return response.forbidden(FORBIDDEN)

    const { publishedAt, ...payload } = await request.validateUsing(updateNewsValidator)
    post.merge(payload)
    if (publishedAt) post.publishedAt = DateTime.fromJSDate(publishedAt)
    await post.save()
    await post.load('author')

    return post
  }

  async destroy({ auth, request, response }: HttpContext) {
    const { params } = await request.validateUsing(newsIdValidator, {
      data: { params: request.params() },
    })
    const post = await NewsPost.find(params.id)
    if (!post) return response.notFound(NOT_FOUND)
    if (!post.canBeEditedBy(auth.getUserOrFail())) return response.forbidden(FORBIDDEN)

    await post.delete()
    return response.noContent()
  }

  /**
   * F30 : annonces importantes publiées depuis la dernière consultation de l'habitant
   * (pour un nouveau compte : celles des 7 derniers jours), la plus récente d'abord.
   */
  async unreadImportant({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const since = user.newsSeenAt ?? DateTime.now().minus({ days: 7 })
    const data = await NewsPost.query()
      .withScopes((scopes) => scopes.visible())
      .where('important', true)
      .where('published_at', '>', since.toSQL({ includeOffset: false })!)
      .orderBy('published_at', 'desc')
      .orderBy('id', 'desc')
      .limit(20)
    return { count: data.length, data }
  }

  /** F30 : l'habitant a vu ses annonces importantes. */
  async markImportantSeen({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    user.newsSeenAt = DateTime.now()
    await user.save()
    return response.noContent()
  }
}
