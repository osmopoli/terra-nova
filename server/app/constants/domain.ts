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
  newsTitle: 160,
  newsSummary: 300,
  newsBody: 10000,
} as const

/** Catégories des actualités de la ville (colonne news_posts.category). */
export const NEWS_CATEGORIES = {
  annonce: 'Annonce municipale',
  changement_service: 'Changement de service',
  info_pratique: 'Info pratique',
} as const
export type NewsCategory = keyof typeof NEWS_CATEGORIES
export const NEWS_CATEGORY_VALUES = Object.keys(NEWS_CATEGORIES) as NewsCategory[]

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
/** Messages qui attendent encore une action d'un agent (filtre « à traiter »). */
export const CONTACT_STATUSES_TO_HANDLE: ContactStatus[] = ['nouveau', 'en_cours']

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

/** Protection contre les connexions abusives (WEBC-60) : seuils et durée de verrouillage. */
export const LOGIN_LIMITS = {
  maxFailuresPerAccount: 5,
  maxFailuresPerIp: 20,
  /** Fenêtre de comptage des échecs = durée du verrouillage. */
  windowMinutes: 15,
} as const

/** Résultat d'une tentative de connexion (colonne login_attempts.outcome). */
export const LOGIN_OUTCOMES = {
  succes: 'Réussie',
  echec: 'Échec',
  bloque: 'Bloquée',
} as const
export type LoginOutcome = keyof typeof LOGIN_OUTCOMES

/** Origine d'un blocage (colonne login_attempts.reason). */
export const LOGIN_BLOCK_SCOPES = {
  compte: 'Compte verrouillé',
  ip: 'Adresse IP verrouillée',
} as const
export type LoginBlockScope = keyof typeof LOGIN_BLOCK_SCOPES
/**
 * Langues des contenus des services (F27), libellées dans leur propre langue.
 * Le français est la langue de référence : toute traduction manquante retombe sur lui.
 */
export const CONTENT_LANGUAGES = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
} as const
export type ContentLanguage = keyof typeof CONTENT_LANGUAGES
export const CONTENT_LANGUAGE_VALUES = Object.keys(CONTENT_LANGUAGES) as ContentLanguage[]
export const DEFAULT_CONTENT_LANGUAGE: ContentLanguage = 'fr'

/** Listes fermées exposées au front par GET /api/meta (clé -> libellé). */
export const META: Record<string, Record<string, string>> = {
  roles: ROLES,
  contactServices: CONTACT_SERVICES,
  contactStatuses: CONTACT_STATUSES,
  serviceCategories: SERVICE_CATEGORIES,
  newsCategories: NEWS_CATEGORIES,
  loginOutcomes: LOGIN_OUTCOMES,
  loginBlockScopes: LOGIN_BLOCK_SCOPES,
  contentLanguages: CONTENT_LANGUAGES,
}
