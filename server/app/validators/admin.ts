import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { ROLE_VALUES } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    number: 'Ce champ doit être un nombre.',
    min: 'La valeur doit être au moins {{ min }}.',
    max: 'La valeur doit être au plus {{ max }}.',
    withoutDecimals: 'La valeur doit être un entier.',
    enum: 'Valeur non autorisée.',
  },
  { 'role': 'rôle', 'page': 'page', 'params.id': 'identifiant' }
)

export const listUsersValidator = vine.compile(
  vine.object({
    role: vine.enum(ROLE_VALUES).optional(),
    page: vine.number().withoutDecimals().min(1).optional(),
  })
)
listUsersValidator.messagesProvider = messages

export const updateRoleValidator = vine.compile(
  vine.object({
    role: vine.enum(ROLE_VALUES),
    params: vine.object({
      id: vine.number().withoutDecimals().min(1),
    }),
  })
)
updateRoleValidator.messagesProvider = messages
