import { useState } from 'react';
import { api } from '../api/client.js';
import { getPasskeyAssertion, passkeyErrorMessage, passkeysSupported } from '../lib/webauthn.js';

// Connexion sans mot de passe par clé d'accès (D02) : clé découvrable, aucun e-mail à saisir.
export default function PasskeyLogin({ onAuthenticated }) {
  const supported = passkeysSupported();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setError('');
    setBusy(true);
    try {
      const options = await api('/auth/passkey/options', { method: 'POST' });
      const assertion = await getPasskeyAssertion(options);
      onAuthenticated(await api('/auth/passkey', { method: 'POST', body: assertion }));
    } catch (err) {
      setError(passkeyErrorMessage(err, 'get'));
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-2">
      <button
        type="button"
        onClick={signIn}
        disabled={!supported || busy}
        aria-busy={busy}
        aria-describedby="aide-cle-acces"
        className="w-full rounded-control border-2 border-primary py-3 font-semibold text-primary hover:bg-mist disabled:opacity-60"
      >
        {busy ? 'Suivez les indications de l’appareil…' : 'Se connecter avec une clé d’accès'}
      </button>
      <p id="aide-cle-acces" className="text-xs text-ink-muted">
        {supported
          ? 'Empreinte, visage, Windows Hello ou code du téléphone : la clé doit avoir été ajoutée depuis votre profil.'
          : 'Ce navigateur ne permet pas d’utiliser les clés d’accès. Connectez-vous avec votre mot de passe.'}
      </p>
      <p role="alert" className="text-sm text-danger empty:hidden">
        {error}
      </p>
      <p className="flex items-center gap-3 pt-2 text-xs text-ink-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        ou avec votre mot de passe
      </p>
    </div>
  );
}
