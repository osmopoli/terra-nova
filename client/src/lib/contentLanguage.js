import { useState } from 'react';

// Langue des contenus des services (F27), mémorisée dans le navigateur.
// Les langues disponibles viennent de GET /api/meta (contentLanguages).
const STORAGE_KEY = 'content_lang';

function read() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'fr';
  } catch {
    return 'fr';
  }
}

export function useContentLanguage() {
  const [lang, setLang] = useState(read);
  function change(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Navigation privée : le choix vaut pour la page.
    }
    setLang(value);
  }
  return [lang, change];
}

// Libellés des pages services dans chaque langue de contenu (le reste de l'interface reste en français).
export const SERVICE_UI = {
  fr: {
    title: 'Services municipaux',
    intro: 'Trouvez le service qui correspond à votre besoin : horaires, contact et démarches utiles.',
    see: 'Voir la fiche',
    back: 'Tous les services',
    presentation: 'Présentation',
    procedures: 'Démarches',
    hours: 'Horaires',
    contact: 'Contact',
    language: 'Langue du contenu',
    notTranslated: 'Ce service n’est pas encore traduit : le contenu est affiché en français.',
    search: 'Rechercher un service',
    searchHint: 'Ex. santé, école, déchets, passeport',
    category: 'Catégorie',
    allCategories: 'Toutes les catégories',
    results: (n) => (n > 1 ? `${n} services trouvés` : n === 1 ? '1 service trouvé' : 'Aucun service ne correspond à votre recherche.'),
  },
  en: {
    title: 'City services',
    intro: 'Find the service you need: opening hours, contact details and useful procedures.',
    see: 'View details',
    back: 'All services',
    presentation: 'About',
    procedures: 'Procedures',
    hours: 'Opening hours',
    contact: 'Contact',
    language: 'Content language',
    notTranslated: 'This service is not translated yet: the content is shown in French.',
    search: 'Search for a service',
    searchHint: 'E.g. health, school, waste, passport',
    category: 'Category',
    allCategories: 'All categories',
    results: (n) => (n > 1 ? `${n} services found` : n === 1 ? '1 service found' : 'No service matches your search.'),
  },
  es: {
    title: 'Servicios municipales',
    intro: 'Encuentre el servicio que necesita: horarios, contacto y trámites útiles.',
    see: 'Ver la ficha',
    back: 'Todos los servicios',
    presentation: 'Presentación',
    procedures: 'Trámites',
    hours: 'Horarios',
    contact: 'Contacto',
    language: 'Idioma del contenido',
    notTranslated: 'Este servicio aún no está traducido: el contenido se muestra en francés.',
    search: 'Buscar un servicio',
    searchHint: 'Ej. salud, escuela, residuos, pasaporte',
    category: 'Categoría',
    allCategories: 'Todas las categorías',
    results: (n) => (n > 1 ? `${n} servicios encontrados` : n === 1 ? '1 servicio encontrado' : 'Ningún servicio corresponde a su búsqueda.'),
  },
};
export const serviceUi = (lang) => SERVICE_UI[lang] ?? SERVICE_UI.fr;
