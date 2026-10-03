// Version allégée (WEBC-90) : attribut posé sur <html>, les règles de index.css
// sous [data-lite] retirent décors, animations, flous et ombres, et passent en une colonne.
const STORAGE_KEY = 'lite_mode';

export function getLiteMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    // Stockage indisponible : on suit l'économiseur de données du navigateur.
  }
  return navigator.connection?.saveData ?? false;
}

export function setLiteAttribute(enabled) {
  if (enabled) document.documentElement.dataset.lite = '';
  else delete document.documentElement.dataset.lite;
}

// Choix explicite de l'utilisateur : appliqué et mémorisé.
export function applyLiteMode(enabled) {
  setLiteAttribute(enabled);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Navigation privée : le choix vaut pour la session.
  }
  return enabled;
}
