import { useSyncExternalStore } from 'react';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import { translate, translateError } from './translate.js';

// Langue de l'interface (D14) : dictionnaires JSON, choix mémorisé dans le navigateur.
// Ajouter une langue = un fichier dans src/i18n/ + une entrée ici.
export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
];
const DICTS = { fr, en };
const STORAGE_KEY = 'ui_lang';
const EVENT = 'app:lang';

function read() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value in DICTS ? value : 'fr';
  } catch {
    return 'fr';
  }
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function setLang(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Navigation privée : le choix vaut pour la session en cours.
  }
  document.documentElement.lang = code;
  window.dispatchEvent(new Event(EVENT));
}

// Attribut lang du document dès le chargement (lecteurs d'écran).
document.documentElement.lang = read();

/** { lang, t(key, vars), tError(message) } pour la langue choisie. */
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, read);
  const dict = DICTS[lang];
  return {
    lang,
    t: (key, vars) => translate(dict, fr, key, vars),
    tError: (message) => translateError(dict, message),
  };
}
