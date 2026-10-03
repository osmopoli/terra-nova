// Clés d'accès (WebAuthn, D02) côté navigateur : conversion base64url <-> octets et appels
// navigator.credentials. Le serveur reçoit la clé publique au format SPKI (pas de CBOR).

export const toB64u = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const fromB64u = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64 + '==='.slice((base64.length + 3) % 4)), (c) => c.charCodeAt(0));
};

export const passkeysSupported = () =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  typeof window.PublicKeyCredential === 'function' &&
  !!navigator.credentials;

// Annulation, délai dépassé ou clé déjà présente : message compréhensible, jamais l'erreur brute.
export function passkeyErrorMessage(error, action) {
  if (error?.status !== undefined) return error.message;
  if (error?.name === 'InvalidStateError') return 'Cette clé d’accès est déjà enregistrée sur cet appareil.';
  if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
    return action === 'create'
      ? 'Ajout de la clé d’accès annulé ou délai dépassé. Vous pouvez réessayer.'
      : 'Connexion par clé d’accès annulée ou délai dépassé. Réessayez ou utilisez votre mot de passe.';
  }
  return error?.message || 'La clé d’accès n’a pas pu être utilisée.';
}

export async function createPasskey(options) {
  const credential = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: fromB64u(options.challenge),
      user: { ...options.user, id: fromB64u(options.user.id) },
      excludeCredentials: options.excludeCredentials.map((c) => ({ ...c, id: fromB64u(c.id) })),
    },
  });
  const response = credential.response;
  const publicKey = response.getPublicKey?.();
  if (!publicKey || !response.getAuthenticatorData) {
    throw new Error('Ce navigateur ne transmet pas la clé publique : utilisez une version récente de Chrome, Edge, Firefox ou Safari.');
  }
  return {
    id: credential.id,
    clientDataJSON: toB64u(response.clientDataJSON),
    authenticatorData: toB64u(response.getAuthenticatorData()),
    publicKey: toB64u(publicKey),
    publicKeyAlgorithm: response.getPublicKeyAlgorithm(),
  };
}

export async function getPasskeyAssertion(options) {
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: fromB64u(options.challenge),
      rpId: options.rpId,
      userVerification: options.userVerification,
      timeout: options.timeout,
    },
  });
  const response = credential.response;
  return {
    id: credential.id,
    clientDataJSON: toB64u(response.clientDataJSON),
    authenticatorData: toB64u(response.authenticatorData),
    signature: toB64u(response.signature),
  };
}
