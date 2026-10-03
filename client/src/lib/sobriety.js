// Sobriété numérique (F57) : mesures réelles de la visite en cours (Performance API) et formats.

/** Sustainable Web Design (v3) : 0,81 kWh par Go transféré × 442 g CO2e par kWh. */
export const co2Grams = (bytes) => (bytes / 1e9) * 0.81 * 442;

const nf = (options) => new Intl.NumberFormat('fr-FR', options);

export const formatKb = (bytes) =>
  bytes > 0 && bytes < 1024
    ? `${bytes} octets`
    : `${nf({ maximumFractionDigits: 0 }).format(Math.round(bytes / 1024))} Ko`;

export const formatGrams = (grams) =>
  `${nf({ maximumFractionDigits: grams < 0.1 ? 3 : 2 }).format(grams)} g`;

export const formatMs = (ms) =>
  ms >= 1000 ? `${nf({ maximumFractionDigits: 1 }).format(ms / 1000)} s` : `${Math.round(ms)} ms`;

/** A–C sobre, D–E moyen, F–G lourd : le mot accompagne toujours la lettre (pas la couleur seule). */
export function gradeTone(grade) {
  if ('ABC'.includes(grade)) return { word: 'sobre', tone: 'success' };
  if ('DE'.includes(grade)) return { word: 'moyen', tone: 'warning' };
  return { word: 'lourd', tone: 'danger' };
}

export const RESOURCE_KINDS = [
  { key: 'document', label: 'Page HTML' },
  { key: 'script', label: 'Scripts' },
  { key: 'style', label: 'Styles' },
  { key: 'font', label: 'Polices' },
  { key: 'image', label: 'Images' },
  { key: 'api', label: 'Données (API)' },
  { key: 'other', label: 'Autres' },
];

export function resourceKind(entry) {
  const url = String(entry.name).split('?')[0].toLowerCase();
  if (entry.entryType === 'navigation') return 'document';
  if (url.includes('/api/')) return 'api';
  if (/\.(woff2?|ttf|otf)$/.test(url) || url.includes('fonts.gstatic.com')) return 'font';
  if (/\.(webp|avif|png|jpe?g|gif|svg|ico)$/.test(url) || entry.initiatorType === 'img') return 'image';
  if (/\.css$/.test(url) || url.includes('fonts.googleapis.com')) return 'style';
  if (/\.m?js$/.test(url) || entry.initiatorType === 'script') return 'script';
  return 'other';
}

/**
 * Résume les entrées navigation + ressources de la visite.
 * transferSize = 0 avec un contenu (decodedBodySize > 0) : servi depuis le cache du navigateur.
 * transferSize = 0 sans contenu : fichier d'un autre site qui ne publie pas sa taille.
 */
export function summarizeVisit(perf) {
  if (!perf?.getEntriesByType) return null;
  const nav = perf.getEntriesByType('navigation')[0];
  const entries = [...(nav ? [nav] : []), ...perf.getEntriesByType('resource')];
  if (!entries.length) return null;

  const byKind = Object.fromEntries(RESOURCE_KINDS.map(({ key }) => [key, { requests: 0, transferred: 0 }]));
  let transferred = 0;
  let cached = 0;
  let unmeasured = 0;
  for (const entry of entries) {
    const size = entry.transferSize || 0;
    const kind = byKind[resourceKind(entry)];
    kind.requests += 1;
    kind.transferred += size;
    transferred += size;
    if (size === 0 && entry.decodedBodySize > 0) cached += 1;
    else if (size === 0) unmeasured += 1;
  }

  return {
    requests: entries.length,
    transferred,
    cached,
    unmeasured,
    co2Grams: co2Grams(transferred),
    byKind,
    domReady: nav?.domContentLoadedEventEnd || null,
    loaded: nav?.loadEventEnd || null,
  };
}
