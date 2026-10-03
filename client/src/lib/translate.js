/** Texte de `key` dans le dictionnaire, sinon en français ; `{nom}` est remplacé par vars.nom. */
export function translate(dict, fallback, key, vars = {}) {
  const text = dict[key] ?? fallback[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/**
 * Traduit un message d'erreur de l'API (toujours en français) via la table `errors`
 * du dictionnaire. Les nombres sont génériques : « Au moins 8 caractères. » utilise
 * l'entrée « Au moins {n} caractères. ». Message inconnu : renvoyé tel quel.
 */
export function translateError(dict, message) {
  if (!message || !dict.errors) return message;
  const numbers = message.match(/\d+/g) ?? [];
  const text = dict.errors[message.replace(/\d+/g, '{n}')];
  if (!text) return message;
  let i = 0;
  return text.replace(/\{n\}/g, () => numbers[i++] ?? '');
}
