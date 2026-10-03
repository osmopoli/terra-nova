import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTACT_SERVICE_VALUES, CONTACT_STATUS_VALUES, LIMITS } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
    enum: 'Choisissez un service dans la liste.',
  },
  { subject: 'sujet', service: 'service', message: 'message' }
)

export const createContactMessageValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(LIMITS.contactSubject),
    service: vine.enum(CONTACT_SERVICE_VALUES),
    message: vine.string().trim().minLength(10).maxLength(LIMITS.contactMessage),
  })
)
createContactMessageValidator.messagesProvider = messages

export const updateContactStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(CONTACT_STATUS_VALUES),
    params: vine.object({ code: vine.string().maxLength(20) }),
  })
)
updateContactStatusValidator.messagesProvider = new SimpleMessagesProvider(
  { required: 'Ce champ est obligatoire.', enum: 'Valeur non autorisée.' },
  { status: 'statut' }
)
