// Indications de première visite (WEBC-58) : une fois fermée, une indication ne revient plus.
// Mémorisation locale au navigateur, comme la taille du texte.
const STORAGE_KEY = 'hints_seen';

function read(storage) {
  try {
    const list = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isHintSeen(id, storage = globalThis.localStorage) {
  if (!storage) return false;
  return read(storage).includes(id);
}

export function markHintSeen(id, storage = globalThis.localStorage) {
  if (!storage) return;
  const seen = read(storage);
  if (seen.includes(id)) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...seen, id]));
  } catch {
    // Stockage indisponible (navigation privée) : l'indication reste fermée pour cette page.
  }
}
