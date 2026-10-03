import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { focusFirstError } from '../lib/focusError.js';
import Field, { FormError, inputClass } from './Field.jsx';

// Deuxième étape de connexion (F53) : le mot de passe est bon, le jeton d'accès attend le code.
export default function TwoFactorStep({ challengeToken, onAuthenticated, onRestart }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Le seul geste attendu : saisir le code. Le libellé et l’aide sont lus avec le champ.
  useEffect(() => inputRef.current?.focus(), []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api('/auth/two-factor', { method: 'POST', body: { challengeToken, code } });
      onAuthenticated(data);
    } catch (err) {
      setError(err);
      setExpired(err.status === 410);
      setLoading(false);
      focusFirstError(e.target);
    }
  }

  return (
    <form onSubmit={submit} aria-labelledby="titre-deux-etapes" className="mt-6 space-y-4" noValidate>
      <h3 id="titre-deux-etapes" className="font-semibold text-ink">
        Code de vérification
      </h3>
      <p className="text-sm text-ink-muted">
        Ouvrez votre application d’authentification et saisissez le code à 6 chiffres affiché pour Terra
        Nova. Il change toutes les 30 secondes.
      </p>
      <Field
        label="Code à 6 chiffres ou code de secours"
        error={error?.fields?.code}
        hint="Téléphone perdu ? Saisissez l’un de vos codes de secours (format ABCDE-FGHIJ)."
      >
        <input
          ref={inputRef}
          className={`${inputClass} font-mono tracking-widest`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="text"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={11}
          disabled={expired}
        />
      </Field>
      <FormError error={error} />
      {expired ? (
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-control bg-primary py-3 font-semibold text-on-primary hover:bg-primary-strong"
        >
          Reprendre la connexion
        </button>
      ) : (
        <>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            aria-busy={loading}
            className="w-full rounded-control bg-primary py-3 font-semibold text-on-primary hover:bg-primary-strong disabled:opacity-60"
          >
            {loading ? 'Vérification…' : 'Valider et me connecter'}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-control border border-line-strong py-2.5 text-sm font-medium text-ink hover:bg-mist"
          >
            Revenir au mot de passe
          </button>
        </>
      )}
    </form>
  );
}
