import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import {
  CONTENT_LANGUAGE_VALUES,
  DEFAULT_CONTENT_LANGUAGE,
  LIMITS,
  SERVICE_AVAILABILITY_VALUES,
} from '#constants/domain'

/** F27 : langue des contenus demandée en paramètre (?lang=en). */
export const serviceLanguageValidator = vine.compile(
  vine.object({ lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional() })
)
serviceLanguageValidator.messagesProvider = new SimpleMessagesProvider(
  { enum: 'Langue non disponible.' },
  { lang: 'langue' }
)

/** Langues saisissables par un admin : toutes sauf le français, qui est le contenu de référence. */
const TRANSLATABLE_LANGUAGES = CONTENT_LANGUAGE_VALUES.filter(
  (lang) => lang !== DEFAULT_CONTENT_LANGUAGE
)

const translationParams = vine.object({
  slug: vine.string().regex(/^[a-z0-9-]{1,80}$/),
  lang: vine.enum(TRANSLATABLE_LANGUAGES),
})

/** F27 : lecture de la traduction brute d'un service (admin). */
export const showTranslationValidator = vine.compile(vine.object({ params: translationParams }))

/**
 * F27 : saisie de la traduction d'un service par un admin. Un champ vide ou absent
 * est retiré de la traduction : la fiche retombe alors sur le français pour ce champ.
 */
export const updateTranslationValidator = vine.compile(
  vine.object({
    params: translationParams,
    name: vine.string().trim().maxLength(120).nullable().optional(),
    summary: vine.string().trim().maxLength(255).nullable().optional(),
    description: vine.string().trim().maxLength(5000).nullable().optional(),
    hours: vine.string().trim().maxLength(1000).nullable().optional(),
  })
)
updateTranslationValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'string': 'Ce champ doit être un texte.',
    'maxLength': 'Ce champ ne doit pas dépasser {{ max }} caractères.',
    'enum': 'Langue non disponible.',
    'params.slug.regex': 'Service inconnu.',
  },
  { name: 'nom', summary: 'résumé', description: 'description', hours: 'horaires' }
)

/** Statut de disponibilité d'un service (WEBC-61), saisi par un agent. */
const availabilityMessages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    requiredWhen: 'Ce champ est obligatoire pour un service indisponible.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    regex: 'Date invalide (format AAAA-MM-JJ).',
    enum: 'Valeur non autorisée.',
  },
  {
    status: 'statut',
    message: 'message',
    returnDate: 'date de retour',
  }
)

export const serviceAvailabilityValidator = vine.compile(
  vine.object({
    status: vine.enum(SERVICE_AVAILABILITY_VALUES.filter((value) => value !== 'desactive')),
    message: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(LIMITS.availabilityMessage)
      .optional()
      .requiredWhen('status', 'in', ['maintenance', 'incident']),
    returnDate: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
)
serviceAvailabilityValidator.messagesProvider = availabilityMessages

/** Désactivation d'un service par un administrateur (WEBC-91). */
export const serviceDisableValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(3).maxLength(LIMITS.availabilityMessage),
    action: vine.string().trim().minLength(3).maxLength(LIMITS.availabilityAction),
    returnDate: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
)
serviceDisableValidator.messagesProvider = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    regex: 'Date invalide (format AAAA-MM-JJ).',
  },
  { reason: 'motif', action: 'action alternative', returnDate: 'date de retour' }
)
