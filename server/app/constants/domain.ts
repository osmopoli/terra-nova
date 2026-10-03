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
  alertTitle: 120,
  alertMessage: 2000,
  alertInstructions: 2000,
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

/**
 * Niveaux des alertes diffusées à tous les habitants (colonne alerts.level),
 * du moins au plus critique : l'ordre sert au tri des bannières.
 */
export const ALERT_LEVELS = {
  info: 'Information',
  important: 'Important',
  urgent: 'Urgent',
} as const
export type AlertLevel = keyof typeof ALERT_LEVELS
export const ALERT_LEVEL_VALUES = Object.keys(ALERT_LEVELS) as AlertLevel[]

/**
 * Quartiers de Nova Terra (colonnes users.district et alerts.districts) :
 * une alerte peut cibler un ou plusieurs quartiers, l'habitant déclare le sien dans son profil.
 */
export const DISTRICTS = {
  centre: 'Centre-ville',
  nord: 'Quartier nord',
  sud: 'Quartier sud',
  est: 'Quartier est',
  ouest: 'Quartier ouest',
} as const
export type District = keyof typeof DISTRICTS
export const DISTRICT_VALUES = Object.keys(DISTRICTS) as District[]

/** Listes fermées exposées au front par GET /api/meta (clé -> libellé). */
export const META: Record<string, Record<string, string>> = {
  roles: ROLES,
  alertLevels: ALERT_LEVELS,
  districts: DISTRICTS,
}
