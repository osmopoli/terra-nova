import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { ALERT_LEVEL_VALUES, DISTRICT_VALUES, LIMITS } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    enum: 'Valeur non autorisée.',
    array: 'Liste attendue.',
    distinct: 'Quartier en double.',
    date: 'Date invalide (format ISO 8601 attendu).',
    number: 'Identifiant invalide.',
    withoutDecimals: 'Identifiant invalide.',
    positive: 'Identifiant invalide.',
  },
  {
    title: 'titre',
    message: 'message',
    level: 'niveau',
    startsAt: 'début',
    endsAt: 'fin',
    districts: 'quartiers',
    instructions: 'consignes',
    vulnerableAdvice: 'recommandations pour les personnes vulnérables',
  }
)

const title = () => vine.string().trim().minLength(3).maxLength(LIMITS.alertTitle)
const message = () => vine.string().trim().minLength(3).maxLength(LIMITS.alertMessage)
const level = () => vine.enum(ALERT_LEVEL_VALUES)
/** Liste vide ou null = toute la ville. */
const districts = () => vine.array(vine.enum(DISTRICT_VALUES)).distinct().nullable()
const instructions = () => vine.string().trim().maxLength(LIMITS.alertInstructions).nullable()
const date = () => vine.date({ formats: ['iso8601'] })
const params = () => vine.object({ id: vine.number().withoutDecimals().positive() })

/** `startsAt` absent = diffusion immédiate. */
export const createAlertValidator = vine.compile(
  vine.object({
    title: title(),
    message: message(),
    level: level(),
    startsAt: date().optional(),
    endsAt: date(),
    districts: districts().optional(),
    instructions: instructions().optional(),
    vulnerableAdvice: instructions().optional(),
  })
)
createAlertValidator.messagesProvider = messages

export const updateAlertValidator = vine.compile(
  vine.object({
    title: title().optional(),
    message: message().optional(),
    level: level().optional(),
    startsAt: date().optional(),
    endsAt: date().optional(),
    districts: districts().optional(),
    instructions: instructions().optional(),
    vulnerableAdvice: instructions().optional(),
    params: params(),
  })
)
updateAlertValidator.messagesProvider = messages

export const alertParamsValidator = vine.compile(vine.object({ params: params() }))
alertParamsValidator.messagesProvider = messages
