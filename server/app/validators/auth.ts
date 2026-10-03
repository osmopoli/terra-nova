import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { LIMITS } from '#constants/domain'

/** bcrypt ignore tout ce qui dépasse 72 octets : on borne la saisie. */
const PASSWORD = { min: 8, max: 72 } as const

const messages = new SimpleMessagesProvider(
  {
    'required': 'Ce champ est obligatoire.',
    'string': 'Ce champ doit être un texte.',
    'email': 'Adresse e-mail invalide.',
    'minLength': 'Au moins {{ min }} caractères.',
    'maxLength': 'Au plus {{ max }} caractères.',
    'database.unique': 'Un compte existe déjà avec cet e-mail.',
  },
  {
    fullName: 'nom',
    email: 'e-mail',
    password: 'mot de passe',
  }
)

const fullName = () => vine.string().trim().minLength(2).maxLength(LIMITS.fullName)

export const registerValidator = vine.compile(
  vine.object({
    fullName: fullName(),
    email: vine
      .string()
      .trim()
      .toLowerCase()
      .email()
      .maxLength(LIMITS.email)
      .unique({ table: 'users', column: 'email', caseInsensitive: true }),
    password: vine.string().minLength(PASSWORD.min).maxLength(PASSWORD.max),
  })
)
registerValidator.messagesProvider = messages

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().maxLength(LIMITS.email),
    password: vine.string().maxLength(PASSWORD.max),
  })
)
loginValidator.messagesProvider = messages

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: fullName().optional(),
  })
)
updateProfileValidator.messagesProvider = messages

export const deleteAccountValidator = vine.compile(
  vine.object({
    password: vine.string().maxLength(PASSWORD.max),
  })
)
deleteAccountValidator.messagesProvider = messages
