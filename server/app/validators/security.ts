import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/** Validation des réglages de sécurité de connexion (F53 deux étapes, D02 clés d'accès). */

export const securityMessages = new SimpleMessagesProvider(
  {
    'required': 'Ce champ est obligatoire.',
    'string': 'Ce champ doit être un texte.',
    'maxLength': 'Au plus {{ max }} caractères.',
    'code.regex': 'Saisissez les 6 chiffres affichés par votre application.',
  },
  { password: 'mot de passe', code: 'code' }
)

export const passwordConfirmationValidator = vine.compile(
  vine.object({ password: vine.string().maxLength(72) })
)
passwordConfirmationValidator.messagesProvider = securityMessages

/** Premier code de l'application, pour confirmer l'activation. */
export const totpConfirmValidator = vine.compile(
  vine.object({
    code: vine
      .string()
      .trim()
      .regex(/^\d{3}\s?\d{3}$/),
  })
)
totpConfirmValidator.messagesProvider = securityMessages

/** Deuxième étape de connexion : code de l'application ou code de secours. */
export const twoFactorLoginValidator = vine.compile(
  vine.object({
    challengeToken: vine.string().maxLength(200),
    code: vine.string().trim().maxLength(20),
  })
)
twoFactorLoginValidator.messagesProvider = securityMessages
