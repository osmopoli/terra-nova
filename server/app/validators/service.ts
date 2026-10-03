import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import {
  CONTENT_LANGUAGE_VALUES,
  DEFAULT_CONTENT_LANGUAGE,
  QUARTIER_VALUES,
  SERVICE_CATEGORY_VALUES,
} from '#constants/domain'

/** F27 : langue des contenus demandée en paramètre (?lang=en). */
export const serviceLanguageValidator = vine.compile(
  vine.object({ lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional() })
)
serviceLanguageValidator.messagesProvider = new SimpleMessagesProvider(
  { enum: 'Langue non disponible.' },
  { lang: 'langue' }
)

/** Langues saisissables par un admin : toutes sauf le français, qui est le contenu de référence. */
const TRANSLATABLE_LANGUAGES = CONTENT_LANGUAGE_VALUES.filter(
  (lang) => lang !== DEFAULT_CONTENT_LANGUAGE
)

const translationParams = vine.object({
  slug: vine.string().regex(/^[a-z0-9-]{1,80}$/),
  lang: vine.enum(TRANSLATABLE_LANGUAGES),
})

/** F27 : lecture de la traduction brute d'un service (admin). */
export const showTranslationValidator = vine.compile(vine.object({ params: translationParams }))

/**
 * F27 : saisie de la traduction d'un service par un admin. Un champ vide ou absent
 * est retiré de la traduction : la fiche retombe alors sur le français pour ce champ.
 */
export const updateTranslationValidator = vine.compile(
  vine.object({
    params: translationParams,
    name: vine.string().trim().maxLength(120).nullable().optional(),
    summary: vine.string().trim().maxLength(255).nullable().optional(),
    description: vine.string().trim().maxLength(5000).nullable().optional(),
    hours: vine.string().trim().maxLength(1000).nullable().optional(),
  })
)
updateTranslationValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'string': 'Ce champ doit être un texte.',
    'maxLength': 'Ce champ ne doit pas dépasser {{ max }} caractères.',
    'enum': 'Langue non disponible.',
    'params.slug.regex': 'Service inconnu.',
  },
  { name: 'nom', summary: 'résumé', description: 'description', hours: 'horaires' }
)

/** WEBC-72 : filtres de l'annuaire (?quartier=, ?category=) en plus de ?lang=. */
export const listServicesValidator = vine.compile(
  vine.object({
    lang: vine.enum(CONTENT_LANGUAGE_VALUES).optional(),
    quartier: vine.enum(QUARTIER_VALUES).optional(),
    category: vine.enum(SERVICE_CATEGORY_VALUES).optional(),
  })
)
listServicesValidator.messagesProvider = new SimpleMessagesProvider(
  { enum: 'Valeur non autorisée.' },
  { lang: 'langue', quartier: 'quartier', category: 'catégorie' }
)

/** F28 : mise en avant d'un service par un administrateur. */
export const featureServiceValidator = vine.compile(vine.object({ featured: vine.boolean() }))
featureServiceValidator.messagesProvider = new SimpleMessagesProvider(
  { required: 'Ce champ est obligatoire.', boolean: 'Valeur oui/non attendue.' },
  { featured: 'mise en avant' }
)
