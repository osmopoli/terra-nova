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
  contactSubject: 120,
  contactMessage: 2000,
  newsTitle: 160,
  newsSummary: 300,
  newsBody: 10000,
  alertTitle: 120,
  alertMessage: 2000,
  location: 200,
  demandeNote: 1000,

  availabilityMessage: 300,
  availabilityAction: 300,
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
/** Nature d'une demande (colonne demandes.kind) : message aux services ou signalement d'un problème. */
export const DEMANDE_KINDS = {
  demande: 'Demande',
  signalement: 'Signalement',
} as const
export type DemandeKind = keyof typeof DEMANDE_KINDS

/** Problèmes signalables sur l'espace public (F25, colonne demandes.category). */
export const ISSUE_CATEGORIES = {
  eclairage: 'Éclairage public (lampadaire, feu)',
  voirie: 'Chaussée, trottoir, nid-de-poule',
  proprete: 'Propreté, dépôt sauvage',
  espaces_verts: 'Espaces verts, arbre tombé',
  eau: 'Fuite d’eau, inondation',
  autre: 'Autre problème',
} as const
export type IssueCategory = keyof typeof ISSUE_CATEGORIES
export const ISSUE_CATEGORY_VALUES = Object.keys(ISSUE_CATEGORIES) as IssueCategory[]
/** Service qui traite chaque type de signalement : l'habitant n'a pas à le connaître. */
export const ISSUE_SERVICE: Record<IssueCategory, Service> = {
  eclairage: 'voirie',
  voirie: 'voirie',
  proprete: 'voirie',
  espaces_verts: 'voirie',
  eau: 'urbanisme',
  autre: 'autre',
}

/** Disponibilité d'un service municipal (colonne services.availability). */
export const SERVICE_AVAILABILITIES = {
  disponible: 'Disponible',
  maintenance: 'En maintenance',
  incident: 'Incident en cours',
  desactive: 'Désactivé',
} as const
export type ServiceAvailability = keyof typeof SERVICE_AVAILABILITIES
export const SERVICE_AVAILABILITY_VALUES = Object.keys(
  SERVICE_AVAILABILITIES
) as ServiceAvailability[]

/** Listes fermées exposées au front par GET /api/meta (clé -> libellé). */
export const META: Record<string, Record<string, string>> = {
  roles: ROLES,
  services: SERVICES,
  demandeStatuses: DEMANDE_STATUSES,
  contactServices: CONTACT_SERVICES,
  contactStatuses: CONTACT_STATUSES,
  serviceCategories: SERVICE_CATEGORIES,
  serviceAvailabilities: SERVICE_AVAILABILITIES,
  newsCategories: NEWS_CATEGORIES,
  loginOutcomes: LOGIN_OUTCOMES,
  loginBlockScopes: LOGIN_BLOCK_SCOPES,
  contentLanguages: CONTENT_LANGUAGES,
  alertLevels: ALERT_LEVELS,
  demandeKinds: DEMANDE_KINDS,
  issueCategories: ISSUE_CATEGORIES,
}
