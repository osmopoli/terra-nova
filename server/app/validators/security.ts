import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/** Validation des réglages de sécurité de connexion (F53 deux étapes, D02 clés d'accès). */

export const securityMessages = new SimpleMessagesProvider(
  {
    'required': 'Ce champ est obligatoire.',
    'string': 'Ce champ doit être un texte.',
    'maxLength': 'Au plus {{ max }} caractères.',
    'minLength': 'Au moins {{ min }} caractères.',
    'regex': 'Réponse de la clé illisible.',
    'number': 'Réponse de la clé illisible.',
    'in': 'Type de clé non pris en charge.',
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

const base64url = (max: number) =>
  vine
    .string()
    .maxLength(max)
    .regex(/^[A-Za-z0-9_-]+$/)

/** Clé d'accès créée par le navigateur (D02) : clé publique SPKI, pas de CBOR. */
export const passkeyRegistrationValidator = vine.compile(
  vine.object({
    id: base64url(512).minLength(16),
    clientDataJSON: base64url(4096),
    authenticatorData: base64url(4096),
    publicKey: base64url(2048),
    publicKeyAlgorithm: vine.number().in([-7, -257]),
    name: vine.string().trim().maxLength(60).optional(),
  })
)
passkeyRegistrationValidator.messagesProvider = securityMessages

/** Assertion de connexion par clé d'accès. */
export const passkeyLoginValidator = vine.compile(
  vine.object({
    id: base64url(512),
    clientDataJSON: base64url(4096),
    authenticatorData: base64url(4096),
    signature: base64url(1024),
  })
)
passkeyLoginValidator.messagesProvider = securityMessages
