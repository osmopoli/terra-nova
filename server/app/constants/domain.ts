/**
 * Constantes métier du projet : SOURCE DE VÉRITÉ UNIQUE.
 *
 * Règles (skill conventions-webcup) :
 * - les valeurs stockées en base sont des clés ASCII en snake_case ;
 * - les libellés servent uniquement à l'UI ;
 * - toute constante métier est déclarée ICI, puis exposée au front via GET /api/meta.
 *   Le front ne recopie jamais ces listes à la main.
 *
 * Exemple à remplacer à H+0 selon le sujet :
 *
 * export const CATEGORIES = { exemple_a: 'Exemple A', exemple_b: 'Exemple B' } as const
 * export type Category = keyof typeof CATEGORIES
 * export const CATEGORY_VALUES = Object.keys(CATEGORIES) as Category[]
 */

export const LIMITS = {
  fullName: 80,
  email: 254,
  contactSubject: 120,
  contactMessage: 2000,
} as const

/** Profils de la plateforme (colonne users.role). */
export const ROLES = {
  citoyen: 'Citoyen',
  agent: 'Agent municipal',
  admin: 'Administrateur',
} as const
export type Role = keyof typeof ROLES
export const ROLE_VALUES = Object.keys(ROLES) as Role[]
/** Rôle attribué à toute inscription publique. */
export const DEFAULT_ROLE: Role = 'citoyen'

/**
 * Profils autorisés par espace protégé (middleware `role`, 403 sinon).
 * - agent : outils des agents municipaux (l'admin y a aussi accès) ;
 * - admin : fonctions sensibles (gestion des comptes et des rôles).
 */
export const ACCESS = {
  agent: ['agent', 'admin'],
  admin: ['admin'],
} as const satisfies Record<string, readonly Role[]>

/** Services municipaux joignables par le formulaire de contact (colonne contact_messages.service). */
export const CONTACT_SERVICES = {
  etat_civil: 'État civil et démarches',
  urbanisme: 'Urbanisme et logement',
  voirie: 'Voirie et propreté',
  social: 'Action sociale et santé',
  education: 'Écoles et petite enfance',
  culture_sport: 'Culture et sport',
  autre: 'Autre demande',
} as const
export type ContactService = keyof typeof CONTACT_SERVICES
export const CONTACT_SERVICE_VALUES = Object.keys(CONTACT_SERVICES) as ContactService[]

/** Suivi d'un message d'habitant (colonne contact_messages.status). */
export const CONTACT_STATUSES = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
} as const
export type ContactStatus = keyof typeof CONTACT_STATUSES
export const CONTACT_STATUS_VALUES = Object.keys(CONTACT_STATUSES) as ContactStatus[]
export const DEFAULT_CONTACT_STATUS: ContactStatus = 'nouveau'

/** Thématiques de l'annuaire des services municipaux (colonne services.category). */
export const SERVICE_CATEGORIES = {
  demarches: 'Démarches administratives',
  famille: 'Famille et éducation',
  solidarite: 'Solidarité et santé',
  cadre_de_vie: 'Cadre de vie',
  urbanisme: 'Urbanisme et logement',
  culture_sport: 'Culture et sport',
} as const
export type ServiceCategory = keyof typeof SERVICE_CATEGORIES
export const SERVICE_CATEGORY_VALUES = Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]

/**
 * Opérations sensibles tracées dans le journal d'audit (colonne audit_logs.action).
 * Les actions des fonctionnalités à venir (alertes, actualités, suppression de compte,
 * statut des demandes) sont déjà déclarées : il suffit d'appeler AuditService.log.
 */
export const AUDIT_ACTIONS = {
  role_changed: 'Rôle d’un compte modifié',
  account_created: 'Compte créé',
  account_deleted: 'Compte supprimé',
  request_status_changed: 'Statut d’une demande modifié',
  alert_broadcast: 'Alerte ou message diffusé',
  news_published: 'Actualité publiée',
} as const
export type AuditAction = keyof typeof AUDIT_ACTIONS
export const AUDIT_ACTION_VALUES = Object.keys(AUDIT_ACTIONS) as AuditAction[]

/** Type d'objet concerné par une entrée d'audit (colonne audit_logs.object_type). */
export const AUDIT_OBJECT_TYPES = {
  account: 'Compte',
  contact_message: 'Demande d’habitant',
  alert: 'Alerte',
  news: 'Actualité',
} as const
export type AuditObjectType = keyof typeof AUDIT_OBJECT_TYPES
export const AUDIT_OBJECT_TYPE_VALUES = Object.keys(AUDIT_OBJECT_TYPES) as AuditObjectType[]

/** Listes fermées exposées au front par GET /api/meta (clé -> libellé). */
export const META: Record<string, Record<string, string>> = {
  roles: ROLES,
  contactServices: CONTACT_SERVICES,
  contactStatuses: CONTACT_STATUSES,
  serviceCategories: SERVICE_CATEGORIES,
  auditActions: AUDIT_ACTIONS,
  auditObjectTypes: AUDIT_OBJECT_TYPES,
}
