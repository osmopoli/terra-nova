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
  demandeSubject: 120,
  demandeMessage: 2000,
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
  citoyen: ['citoyen'],
} as const satisfies Record<string, readonly Role[]>

/** Services municipaux destinataires d'une demande (colonne demandes.service). */
export const SERVICES = {
  etat_civil: 'État civil',
  urbanisme: 'Urbanisme',
  voirie: 'Voirie et propreté',
  social: 'Action sociale',
  education: 'Éducation et jeunesse',
  autre: 'Autre',
} as const
export type Service = keyof typeof SERVICES
export const SERVICE_VALUES = Object.keys(SERVICES) as Service[]

/** Statuts d'une demande citoyenne (colonnes demandes.status et demande_steps.status). */
export const DEMANDE_STATUSES = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
} as const
export type DemandeStatus = keyof typeof DEMANDE_STATUSES
export const DEMANDE_STATUS_VALUES = Object.keys(DEMANDE_STATUSES) as DemandeStatus[]
/** Statut de toute demande à sa création. */
export const DEFAULT_DEMANDE_STATUS: DemandeStatus = 'nouveau'

/** Listes fermées exposées au front par GET /api/meta (clé -> libellé). */
export const META: Record<string, Record<string, string>> = {
  roles: ROLES,
  services: SERVICES,
  demandeStatuses: DEMANDE_STATUSES,
}
