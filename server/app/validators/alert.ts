import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { ALERT_LEVEL_VALUES, LIMITS } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    enum: 'Valeur non autorisée.',
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
  }
)

const title = () => vine.string().trim().minLength(3).maxLength(LIMITS.alertTitle)
const message = () => vine.string().trim().minLength(3).maxLength(LIMITS.alertMessage)
const level = () => vine.enum(ALERT_LEVEL_VALUES)
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
    params: params(),
  })
)
updateAlertValidator.messagesProvider = messages

export const alertParamsValidator = vine.compile(vine.object({ params: params() }))
alertParamsValidator.messagesProvider = messages
