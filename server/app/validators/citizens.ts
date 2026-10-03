import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    string: 'Ce champ doit être un texte.',
    number: 'Ce champ doit être un nombre.',
    min: 'La valeur doit être au moins {{ min }}.',
    maxLength: 'Au plus {{ max }} caractères.',
    withoutDecimals: 'La valeur doit être un entier.',
  },
  { 'q': 'recherche', 'page': 'page', 'params.id': 'identifiant' }
)

export const listCitizensValidator = vine.compile(
  vine.object({
    q: vine.string().trim().maxLength(100).optional(),
    page: vine.number().withoutDecimals().min(1).optional(),
  })
)
listCitizensValidator.messagesProvider = messages

export const citizenIdValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().withoutDecimals().min(1),
    }),
  })
)
citizenIdValidator.messagesProvider = messages
