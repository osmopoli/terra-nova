import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CONTENT_LANGUAGE_VALUES } from '#constants/domain'

/** F27 : langue des contenus demandée en paramètre (?lang=en). */
export const serviceLanguageValidator = vine.compile(
  vine.object({ lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional() })
)
serviceLanguageValidator.messagesProvider = new SimpleMessagesProvider(
  { enum: 'Langue non disponible.' },
  { lang: 'langue' }
)
