import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { ISSUE_CATEGORY_VALUES, LIMITS, SERVICE_VALUES } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    number: 'Ce champ doit être un nombre.',
    min: 'La valeur doit être au moins {{ min }}.',
    withoutDecimals: 'La valeur doit être un entier.',
    enum: 'Valeur non autorisée.',
    max: 'La valeur doit être au plus {{ max }}.',
    regex: 'Format invalide.',
  },
  {
    'subject': 'objet',
    'service': 'service',
    'message': 'message',
    'params.id': 'identifiant',
    'category': 'type de problème',
    'location': 'lieu',
  }
)

export const createDemandeValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(LIMITS.demandeSubject),
    service: vine.enum(SERVICE_VALUES),
    message: vine.string().trim().minLength(10).maxLength(LIMITS.demandeMessage),
    serviceSlug: vine
      .string()
      .trim()
      .regex(/^[a-z0-9-]{1,80}$/)
      .optional(),
  })
)
createDemandeValidator.messagesProvider = messages

/** Signalement (F25) : le service et l'objet sont déduits du type de problème. */
export const createIssueValidator = vine.compile(
  vine.object({
    category: vine.enum(ISSUE_CATEGORY_VALUES),
    message: vine.string().trim().minLength(10).maxLength(LIMITS.demandeMessage),
    location: vine.string().trim().minLength(3).maxLength(LIMITS.location),
    latitude: vine.number().min(-90).max(90).nullable().optional(),
    longitude: vine.number().min(-180).max(180).nullable().optional(),
  })
)
createIssueValidator.messagesProvider = messages

export const showDemandeValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().withoutDecimals().min(1),
    }),
  })
)
showDemandeValidator.messagesProvider = messages
