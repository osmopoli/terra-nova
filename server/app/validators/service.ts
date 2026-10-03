import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTENT_LANGUAGE_VALUES, SERVICE_CATEGORY_VALUES } from '#constants/domain'

/** F27 : langue des contenus demandée en paramètre (?lang=en). */
export const serviceLanguageValidator = vine.compile(
  vine.object({ lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional() })
)
const messages = new SimpleMessagesProvider(
  { enum: 'Valeur non disponible.', maxLength: 'Au plus {{ max }} caractères.' },
  { lang: 'langue', q: 'recherche', category: 'catégorie' }
)
serviceLanguageValidator.messagesProvider = messages

/** F32 : recherche plein texte et filtre par catégorie dans l'annuaire. */
export const listServicesValidator = vine.compile(
  vine.object({
    lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional(),
    q: vine.string().trim().maxLength(80).optional(),
    category: vine.enum(SERVICE_CATEGORY_VALUES).optional(),
  })
)
listServicesValidator.messagesProvider = messages
