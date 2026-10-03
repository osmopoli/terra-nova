import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTACT_STATUS_VALUES, LIMITS } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    enum: 'Statut non autorisé.',
    string: 'Ce champ doit être un texte.',
    minLength: 'Au moins {{ min }} caractères.',
    maxLength: 'Au plus {{ max }} caractères.',
  },
  { status: 'statut', filter: 'filtre', reply: 'réponse' }
)

export const listAgentMessagesValidator = vine.compile(
  vine.object({
    filter: vine.enum(['a_traiter', ...CONTACT_STATUS_VALUES]).optional(),
  })
)
listAgentMessagesValidator.messagesProvider = messages

export const updateMessageStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(CONTACT_STATUS_VALUES),
  })
)
updateMessageStatusValidator.messagesProvider = messages

export const replyMessageValidator = vine.compile(
  vine.object({
    reply: vine.string().trim().minLength(5).maxLength(LIMITS.contactReply),
  })
)
replyMessageValidator.messagesProvider = messages
