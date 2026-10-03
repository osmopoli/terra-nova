import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { DEMANDE_STATUS_VALUES, LIMITS } from '#constants/domain'

const messages = new SimpleMessagesProvider(
  {
    required: 'Ce champ est obligatoire.',
    enum: 'Valeur non autorisée.',
    maxLength: 'Au plus {{ max }} caractères.',
    number: 'Identifiant invalide.',
    withoutDecimals: 'Identifiant invalide.',
    min: 'Identifiant invalide.',
  },
  { 'status': 'état', 'note': 'réponse', 'params.id': 'identifiant' }
)

/** F22 : liste des demandes côté agent, filtrable par état (« à traiter » = non traitées). */
export const listAgentDemandesValidator = vine.compile(
  vine.object({ status: vine.enum([...DEMANDE_STATUS_VALUES, 'a_traiter'] as const).optional() })
)
listAgentDemandesValidator.messagesProvider = messages

/** F22 : changement d'état d'une demande, avec une réponse facultative pour l'habitant. */
export const updateAgentDemandeValidator = vine.compile(
  vine.object({
    status: vine.enum(DEMANDE_STATUS_VALUES),
    note: vine.string().trim().maxLength(LIMITS.demandeNote).nullable().optional(),
    params: vine.object({ id: vine.number().withoutDecimals().min(1) }),
  })
)
updateAgentDemandeValidator.messagesProvider = messages
