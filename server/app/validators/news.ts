import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { LIMITS, NEWS_CATEGORY_VALUES } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    number: 'Ce champ doit être un nombre.',
    min: 'La valeur doit être au moins {{ min }}.',
    max: 'La valeur doit être au plus {{ max }}.',
    withoutDecimals: 'La valeur doit être un nombre entier.',
    date: 'Date invalide.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    enum: 'Valeur non autorisée.',
    boolean: 'Valeur oui/non attendue.',
  },
  {
    title: 'titre',
    summary: 'résumé',
    body: 'contenu',
    category: 'catégorie',
    publishedAt: 'date de publication',
    important: 'annonce importante',
  }
)

const dateFormats = { formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'iso8601'] }

const fields = {
  title: vine.string().trim().minLength(3).maxLength(LIMITS.newsTitle),
  summary: vine.string().trim().minLength(3).maxLength(LIMITS.newsSummary),
  body: vine.string().trim().minLength(3).maxLength(LIMITS.newsBody),
  category: vine.enum(NEWS_CATEGORY_VALUES),
  important: vine.boolean().optional(),
}

export const listNewsValidator = vine.compile(
  vine.object({
    category: vine.enum(NEWS_CATEGORY_VALUES).optional(),
    page: vine.number().withoutDecimals().min(1).optional(),
    perPage: vine.number().withoutDecimals().min(1).max(50).optional(),
  })
)
listNewsValidator.messagesProvider = messages

export const newsIdValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().withoutDecimals().min(1),
    }),
  })
)
newsIdValidator.messagesProvider = messages

export const createNewsValidator = vine.compile(
  vine.object({
    ...fields,
    publishedAt: vine.date(dateFormats).optional(),
  })
)
createNewsValidator.messagesProvider = messages

export const updateNewsValidator = vine.compile(
  vine.object({
    title: fields.title.clone().optional(),
    summary: fields.summary.clone().optional(),
    body: fields.body.clone().optional(),
    category: fields.category.clone().optional(),
    important: vine.boolean().optional(),
    publishedAt: vine.date(dateFormats).optional(),
  })
)
updateNewsValidator.messagesProvider = messages
