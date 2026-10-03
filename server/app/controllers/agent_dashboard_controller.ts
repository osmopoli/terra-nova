import { DateTime } from 'luxon'
import Demande from '#models/demande'
import ContactMessage from '#models/contact_message'
import User from '#models/user'
import { DEMANDE_STATUS_VALUES, CONTACT_STATUS_VALUES } from '#constants/domain'

/** Nombre de lignes par valeur de `status`, avec 0 pour les valeurs absentes. */
async function countByStatus(
  model: typeof Demande | typeof ContactMessage,
  values: readonly string[]
) {
  const rows = await model.query().select('status').count('* as total').groupBy('status')
  const counts: Record<string, number> = Object.fromEntries(values.map((v) => [v, 0]))
  for (const row of rows) {
    if (row.status in counts) counts[row.status] = Number(row.$extras.total)
  }
  return counts
}

/** Tableau de bord des agents (F50) : compteurs en lecture seule sur les tables existantes. */
export default class AgentDashboardController {
  async show() {
    const since = DateTime.now().minus({ days: 7 }).toSQL({ includeOffset: false })!
    const [demandes, messages, recent, accounts] = await Promise.all([
      countByStatus(Demande, DEMANDE_STATUS_VALUES),
      countByStatus(ContactMessage, CONTACT_STATUS_VALUES),
      Demande.query().where('created_at', '>=', since).count('* as total').first(),
      User.countByRole(),
    ])

    return {
      demandes: { byStatus: demandes, total: Object.values(demandes).reduce((a, b) => a + b, 0) },
      newDemandesLast7Days: Number(recent?.$extras.total ?? 0),
      messages: { byStatus: messages, total: Object.values(messages).reduce((a, b) => a + b, 0) },
      citizenAccounts: accounts.citoyen,
    }
  }
}
