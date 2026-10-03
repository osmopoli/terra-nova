// Glossaire des mots administratifs (D13) : textes d'aide de l'interface, pas des constantes métier.
// Chaque définition tient en une phrase simple, sans autre mot du glossaire si possible.
// `id` sert d'ancre (/glossaire#etat-civil) et de clé pour <Term id="..." />.
export const GLOSSARY = [
  {
    id: 'action-sociale',
    term: 'Action sociale',
    definition:
      "L'aide de la mairie aux personnes en difficulté : logement, argent, santé, solitude, perte d'autonomie.",
  },
  {
    id: 'agent-municipal',
    term: 'Agent municipal',
    definition: 'Une personne qui travaille pour la mairie et qui lit et traite vos demandes.',
  },
  {
    id: 'demarche',
    term: 'Démarche',
    definition:
      'Ce que vous faites auprès de la mairie pour obtenir quelque chose : un papier, une aide, une autorisation.',
  },
  {
    id: 'etat-civil',
    term: 'État civil',
    definition:
      'Les papiers qui prouvent qui vous êtes : naissance, mariage, décès, carte d’identité, passeport.',
  },
  {
    id: 'justificatif',
    term: 'Justificatif',
    definition:
      'Un document qui prouve ce que vous dites, par exemple une facture récente pour prouver votre adresse.',
  },
  {
    id: 'numero-de-suivi',
    term: 'Numéro de suivi',
    definition:
      'Le code reçu après l’envoi de votre demande. Gardez-le pour savoir où elle en est.',
  },
  {
    id: 'petite-enfance',
    term: 'Petite enfance',
    definition: 'Les enfants de la naissance à 6 ans : crèches, assistantes maternelles, inscriptions.',
  },
  {
    id: 'service-municipal',
    term: 'Service municipal',
    definition: 'Une équipe de la mairie chargée d’un sujet précis, par exemple les écoles ou les routes.',
  },
  {
    id: 'statut',
    term: 'Statut',
    definition:
      'L’étape où en est votre demande : reçue, prise en charge par un agent de la mairie, ou terminée.',
  },
  {
    id: 'urbanisme',
    term: 'Urbanisme',
    definition:
      'Tout ce qui concerne la construction et l’aménagement : permis de construire, travaux, clôture, extension.',
  },
  {
    id: 'voirie',
    term: 'Voirie',
    definition: 'Les routes, trottoirs, éclairage public et la propreté des rues.',
  },
];

export const glossaryEntry = (id) => GLOSSARY.find((entry) => entry.id === id);

// Recherche insensible à la casse et aux accents (« etat » trouve « État civil »).
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function searchGlossary(query, entries = GLOSSARY) {
  const q = normalize(query.trim());
  if (!q) return entries;
  return entries.filter((e) => normalize(e.term).includes(q) || normalize(e.definition).includes(q));
}
