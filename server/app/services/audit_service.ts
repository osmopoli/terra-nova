import type { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import type { AuditAction, AuditObjectType } from '#constants/domain'

type Summary = string | Record<string, unknown> | null

interface AuditEntry {
  action: AuditAction
  objectType: AuditObjectType
  objectId?: string | number | null
  before?: Summary
  after?: Summary
}

const toText = (summary: Summary | undefined) =>
  summary === null || summary === undefined
    ? null
    : (typeof summary === 'string' ? summary : JSON.stringify(summary)).slice(0, 1000)

/**
 * Seul point d'écriture du journal d'audit. À appeler dans les contrôleurs
 * après une opération sensible réussie : `await AuditService.log(ctx, {...})`.
 */
export default class AuditService {
  static async log({ auth, request }: HttpContext, entry: AuditEntry) {
    const actor = auth.user ?? null
    return AuditLog.create({
      actorId: actor?.id ?? null,
      actorName: actor ? (actor.fullName ?? actor.email) : null,
      actorRole: actor?.role ?? null,
      action: entry.action,
      objectType: entry.objectType,
      objectId:
        entry.objectId === null || entry.objectId === undefined ? null : String(entry.objectId),
      beforeSummary: toText(entry.before),
      afterSummary: toText(entry.after),
      ip: request.ip(),
    })
  }
}
