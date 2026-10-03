import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { ModelObject } from '@adonisjs/lucid/types/model'
import {
  CONTENT_LANGUAGE_VALUES,
  DEFAULT_CONTENT_LANGUAGE,
  type ContentLanguage,
  type ServiceCategory,
} from '#constants/domain'

export type ServiceProcedure = { title: string; detail: string }

/** Champs traduisibles d'un service (F27) ; un champ absent retombe sur le français. */
export type ServiceTranslation = Partial<{
  name: string
  summary: string
  description: string
  hours: string
  procedures: ServiceProcedure[]
}>
type Translations = Partial<Record<ContentLanguage, ServiceTranslation>>

/** Service municipal présenté dans l'annuaire. */
export default class Service extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare category: ServiceCategory

  @column()
  declare summary: string

  @column()
  declare description: string

  @column()
  declare hours: string

  @column()
  declare phone: string | null

  @column()
  declare email: string | null

  @column()
  declare address: string | null

  @column({
    prepare: (value: ServiceProcedure[]) => JSON.stringify(value),
    consume: (value: string | null) => (value ? JSON.parse(value) : []),
  })
  declare procedures: ServiceProcedure[]

  @column({
    serializeAs: null,
    prepare: (value: Translations | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : {}),
  })
  declare translations: Translations

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /** Langues disponibles pour ce service : le français, plus chaque traduction présente. */
  get languages(): ContentLanguage[] {
    return CONTENT_LANGUAGE_VALUES.filter(
      (lang) => lang === DEFAULT_CONTENT_LANGUAGE || this.translations?.[lang]
    )
  }

  /**
   * Service sérialisé dans la langue demandée (F27). `lang` indique la langue réellement
   * servie : le français si la traduction n'existe pas.
   */
  localized(lang: ContentLanguage = DEFAULT_CONTENT_LANGUAGE): ModelObject {
    const translation = lang === DEFAULT_CONTENT_LANGUAGE ? null : this.translations?.[lang]
    return {
      ...this.serialize(),
      ...(translation ?? {}),
      lang: translation ? lang : DEFAULT_CONTENT_LANGUAGE,
      languages: this.languages,
    }
  }
}
