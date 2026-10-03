// Affichage à contraste élevé (préférence d'affichage, WEBC-19) : attribut posé sur <html>,
// les tokens de index.css sont redéfinis sous [data-contrast="high"].
const STORAGE_KEY = 'high_contrast';

export function getHighContrast() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    // Stockage indisponible : on suit la préférence du système.
  }
  return window.matchMedia?.('(prefers-contrast: more)').matches ?? false;
}

export function setContrastAttribute(enabled) {
  if (enabled) document.documentElement.dataset.contrast = 'high';
  else delete document.documentElement.dataset.contrast;
}

// Choix explicite de l'utilisateur : appliqué et mémorisé.
export function applyHighContrast(enabled) {
  setContrastAttribute(enabled);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Navigation privée : le choix vaut pour la session.
  }
  return enabled;
}
