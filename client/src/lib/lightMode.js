import { useSyncExternalStore } from 'react';

// Version légère (F59/F62) : moins d'images et d'animations, pages plus rapides.
// Attribut posé sur <html> (data-light="on") ; index.css retire ombres, flous, animations
// et polices téléchargées, les pages concernées affichent une mise en page simplifiée.
const STORAGE_KEY = 'light_mode';
const NOTICE_KEY = 'light_mode_notice';
const CHANGE_EVENT = 'app:light-mode';

/**
 * Connexion lente ou économie de données demandée par l'appareil.
 * Paramètres injectables pour les tests (navigator.connection, window.matchMedia).
 */
export function detectSlowConnection(connection, matchMedia) {
  if (connection?.saveData) return true;
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return true;
  return matchMedia?.('(prefers-reduced-data: reduce)').matches ?? false;
}

/** Choix mémorisé ('on' / 'off') prioritaire ; sinon détection automatique. */
export function resolveLightMode(saved, slow) {
  if (saved === 'on' || saved === 'off') return { enabled: saved === 'on', auto: false };
  return { enabled: Boolean(slow), auto: Boolean(slow) };
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Navigation privée : le choix vaut pour la session.
  }
}

function detect() {
  if (typeof window === 'undefined') return false;
  return detectSlowConnection(navigator.connection, window.matchMedia?.bind(window));
}

let state = resolveLightMode(readStorage(STORAGE_KEY), detect());

export const isLightMode = () => state.enabled;

export function setLightAttribute(enabled) {
  if (enabled) {
    document.documentElement.dataset.light = 'on';
  } else {
    delete document.documentElement.dataset.light;
    ensureWebFonts();
  }
}

function update(next) {
  state = next;
  setLightAttribute(next.enabled);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Choix explicite de l'utilisateur : appliqué et mémorisé (la détection ne le remplace plus).
export function applyLightMode(enabled) {
  writeStorage(STORAGE_KEY, enabled ? 'on' : 'off');
  writeStorage(NOTICE_KEY, '1');
  update({ enabled, auto: false });
  return enabled;
}

// Activée automatiquement : le message d'explication n'est montré qu'une fois.
export const shouldShowAutoNotice = () => state.auto && readStorage(NOTICE_KEY) !== '1';

export function dismissAutoNotice() {
  writeStorage(NOTICE_KEY, '1');
  update({ ...state });
}

function subscribe(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/** true si la version légère est active ; se met à jour à chaque bascule. */
export function useLightMode() {
  return useSyncExternalStore(subscribe, isLightMode);
}

/** Rythme de rafraîchissement automatique : 4 fois moins souvent en version légère (ex. 30 s → 2 min). */
export const pollFactor = () => (state.enabled ? 4 : 1);

// Retour à la version complète sans recharger : les polices web, non chargées au départ
// en version légère (index.html), sont ajoutées à ce moment-là.
function ensureWebFonts() {
  if (document.getElementById('webfonts')) return;
  const href = document.querySelector('meta[name="webfonts"]')?.content;
  if (!href) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'webfonts';
  link.href = href;
  document.head.appendChild(link);
}
