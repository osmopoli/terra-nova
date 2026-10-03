// Taille du texte (préférence d'affichage, WEBC-20) : appliquée à la racine <html>.
// Toute la mise en page Tailwind est en rem : elle suit la taille choisie sans chevauchement.
const STORAGE_KEY = 'text_size';

export const TEXT_SIZES = [
  { value: 'normal', label: 'A', name: 'Taille normale', scale: 100 },
  { value: 'grand', label: 'A+', name: 'Grande taille (125 %)', scale: 125 },
  { value: 'tres_grand', label: 'A++', name: 'Très grande taille (150 %)', scale: 150 },
];

const find = (value) => TEXT_SIZES.find((s) => s.value === value) ?? TEXT_SIZES[0];

export function getTextSize() {
  try {
    return find(localStorage.getItem(STORAGE_KEY)).value;
  } catch {
    return TEXT_SIZES[0].value;
  }
}

export function applyTextSize(value) {
  const size = find(value);
  document.documentElement.style.fontSize = size.scale === 100 ? '' : `${size.scale}%`;
  try {
    localStorage.setItem(STORAGE_KEY, size.value);
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la session.
  }
  return size.value;
}
