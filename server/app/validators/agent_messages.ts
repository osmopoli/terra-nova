import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTACT_STATUS_VALUES } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    enum: 'Statut non autorisé.',
  },
  { status: 'statut', filter: 'filtre' }
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
