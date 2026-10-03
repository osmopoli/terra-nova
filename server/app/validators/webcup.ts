import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = new SimpleMessagesProvider(
  {
    'boolean': 'Ce champ doit valoir true ou false.',
    'array': 'Ce champ doit être une liste.',
    'string': 'Ce champ doit être un texte.',
    'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s).',
    'maxLength': 'Ce champ doit contenir au plus {{ max }} caractères.',
    'array.maxLength': 'La liste doit contenir au plus {{ max }} éléments.',
  },
  { 'onlyNew': 'onlyNew', 'codes': 'codes', 'codes.*': 'code de demande' }
)

export const listWebcupRequestsValidator = vine.compile(
  vine.object({
    onlyNew: vine.boolean().optional(),
  })
)
listWebcupRequestsValidator.messagesProvider = messages

/** Sans `codes`, toutes les demandes sont marquées comme vues. */
export const markWebcupSeenValidator = vine.compile(
  vine.object({
    codes: vine.array(vine.string().trim().minLength(1).maxLength(64)).maxLength(500).optional(),
  })
)
markWebcupSeenValidator.messagesProvider = messages
