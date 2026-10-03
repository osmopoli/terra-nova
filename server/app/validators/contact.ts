import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTACT_SERVICE_VALUES, LIMITS } from '#constants/domain'

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
