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
  },
};
export const serviceUi = (lang) => SERVICE_UI[lang] ?? SERVICE_UI.fr;
