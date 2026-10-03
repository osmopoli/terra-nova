import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { LIMITS, SERVICE_VALUES } from '#constants/domain'

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
  },
  { 'subject': 'objet', 'service': 'service', 'message': 'message', 'params.id': 'identifiant' }
)

export const createDemandeValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(LIMITS.demandeSubject),
    service: vine.enum(SERVICE_VALUES),
    message: vine.string().trim().minLength(10).maxLength(LIMITS.demandeMessage),
  })
)
createDemandeValidator.messagesProvider = messages

export const showDemandeValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().withoutDecimals().min(1),
    }),
  })
)
showDemandeValidator.messagesProvider = messages
