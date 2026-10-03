import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AUDIT_ACTION_VALUES, AUDIT_OBJECT_TYPE_VALUES } from '#constants/domain'

export const listAuditLogsValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().min(1).optional(),
    from: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    actorId: vine.number().withoutDecimals().min(1).optional(),
    action: vine.enum(AUDIT_ACTION_VALUES).optional(),
    objectType: vine.enum(AUDIT_OBJECT_TYPE_VALUES).optional(),
    objectId: vine.string().maxLength(64).optional(),
  })
)
listAuditLogsValidator.messagesProvider = new SimpleMessagesProvider(
  {
    number: 'Ce champ doit être un nombre.',
    min: 'La valeur doit être au moins {{ min }}.',
    withoutDecimals: 'La valeur doit être un entier.',
    enum: 'Valeur non autorisée.',
    regex: 'Date attendue au format AAAA-MM-JJ.',
    maxLength: 'Valeur trop longue.',
  },
  { actorId: 'agent', objectType: "type d'objet", from: 'date de début', to: 'date de fin' }
)
