import type { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { AUDIT_ACTIONS } from '#constants/domain'
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

  /** Historique d'un objet : dernier modificateur + changements champ par champ. */
  static async history(objectType: AuditObjectType, objectId: string) {
    const logs = await AuditLog.query()
      .where('object_type', objectType)
      .where('object_id', objectId)
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(50)
    const history = logs.map((log) => ({
      id: log.id,
      action: log.action,
      actionLabel: AUDIT_ACTIONS[log.action] ?? log.action,
      actorName: log.actorName,
      actorRole: log.actorRole,
      createdAt: log.createdAt,
      changes: diff(log.beforeSummary, log.afterSummary),
    }))
    const last = history[0]
    return {
      objectType,
      objectId,
      lastModifiedBy: last
        ? { name: last.actorName, role: last.actorRole, at: last.createdAt }
        : null,
      history,
    }
  }
}

function parse(text: string | null): Record<string, unknown> | string | null {
  if (text === null) return null
  try {
    const value = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : text
  } catch {
    return text
  }
}

/** Liste {field, before, after} ; field vaut null quand le résumé est un simple texte. */
function diff(beforeText: string | null, afterText: string | null) {
  const before = parse(beforeText)
  const after = parse(afterText)
  if (typeof before === 'object' && before && typeof after === 'object' && after) {
    return Object.keys(after)
      .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .map((field) => ({ field, before: before[field] ?? null, after: after[field] ?? null }))
  }
  if (before === null && after === null) return []
  return [{ field: null, before: beforeText, after: afterText }]
}
