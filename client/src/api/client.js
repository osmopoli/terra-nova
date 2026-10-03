const TOKEN_KEY = 'app_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

/** Appel JSON vers l'API ; lève une erreur { status, message, fields } si la réponse n'est pas OK. */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${import.meta.env?.BASE_URL ?? '/'}api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Serveur injoignable ou réseau coupé : jamais le « Failed to fetch » du navigateur.
    throw apiError(0, OFFLINE_MESSAGE);
  }
  const text = res.status === 204 ? '' : await res.text().catch(() => '');
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Réponse non JSON (page d'erreur du serveur ou du proxy) : rien d'exploitable à afficher.
    throw apiError(res.status, res.ok || res.status >= 500 ? SERVER_MESSAGE : DEFAULT_MESSAGE);
  }

  if (!res.ok) {
    const errors = data?.errors ?? [];
    const fields = {};
    for (const e of errors) if (e.field && !fields[e.field]) fields[e.field] = e.message;
    // Erreurs métier de l'API : { error: "..." } (403/409, PAND-11). Les 5xx et le 401
    // du middleware d'authentification (message anglais) sont traduits ici.
    const message =
      res.status >= 500
        ? SERVER_MESSAGE
        : res.status === 401
          ? SESSION_MESSAGE
          : (errors[0]?.message ?? data?.error ?? DEFAULT_MESSAGE);
    throw apiError(res.status, message, fields);
  }
  return data;
}

const DEFAULT_MESSAGE = 'Une erreur est survenue.';
const OFFLINE_MESSAGE = 'Connexion au serveur impossible. Vérifiez votre réseau puis réessayez.';
const SERVER_MESSAGE = 'Le service est momentanément indisponible. Réessayez dans quelques instants.';
const SESSION_MESSAGE = 'Votre session a expiré. Reconnectez-vous pour continuer.';

function apiError(status, message, fields = {}) {
  const error = new Error(message);
  error.status = status;
  error.fields = fields;
  return error;
}
