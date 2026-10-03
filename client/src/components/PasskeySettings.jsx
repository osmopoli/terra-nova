import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { focusFirstError } from '../lib/focusError.js';
import { createPasskey, passkeyErrorMessage, passkeysSupported } from '../lib/webauthn.js';
import Field, { FormError, inputClass } from './Field.jsx';

const primaryButton =
  'rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-60';
const secondaryButton =
  'rounded-control border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:bg-mist';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// Clés d'accès (D02) : liste, ajout sur cet appareil (mot de passe redemandé), retrait.
export default function PasskeySettings() {
  const supported = passkeysSupported();
  const [passkeys, setPasskeys] = useState(null);
  const [adding, setAdding] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const passwordRef = useRef(null);

  useEffect(() => {
    api('/me/passkeys').then((data) => setPasskeys(data.passkeys), setError);
  }, []);

  useEffect(() => {
    if (adding) passwordRef.current?.focus();
  }, [adding]);

  function close() {
    setAdding(false);
    setPassword('');
    setName('');
    setError(null);
  }

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const options = await api('/me/passkeys/options', { method: 'POST', body: { password } });
      const credential = await createPasskey(options);
      const passkey = await api('/me/passkeys', {
        method: 'POST',
        body: { ...credential, name: name.trim() || undefined },
      });
      setPasskeys((list) => [...(list ?? []), passkey]);
      close();
      setNotice(`Clé « ${passkey.name} » ajoutée. À la prochaine connexion, choisissez « Se connecter avec une clé d’accès ».`);
    } catch (err) {
      setError(err.fields ? err : { message: passkeyErrorMessage(err, 'create'), fields: {} });
      focusFirstError(e.target);
    } finally {
      setBusy(false);
    }
  }

  async function remove(passkey) {
    if (!window.confirm(`Retirer la clé « ${passkey.name} » ? Elle ne permettra plus de vous connecter.`)) return;
    setError(null);
    setNotice('');
    try {
      await api(`/me/passkeys/${passkey.id}`, { method: 'DELETE' });
      setPasskeys((list) => list.filter((p) => p.id !== passkey.id));
      setNotice(`Clé « ${passkey.name} » retirée.`);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-ink">Clés d’accès</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Connectez-vous sans mot de passe, avec le verrouillage de votre appareil : empreinte, visage,
          Windows Hello ou code du téléphone. Une clé d’accès ne fonctionne que sur ce site : un faux site
          ne peut pas la récupérer.
        </p>
      </div>

      {passkeys && (
        <ul className="divide-y divide-line rounded-control border border-line">
          {passkeys.length === 0 && <li className="p-3 text-sm text-ink-muted">Aucune clé d’accès pour l’instant.</li>}
          {passkeys.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium break-words text-ink">{p.name}</p>
                <p className="text-xs text-ink-muted">
                  Ajoutée le {formatDate(p.createdAt)} ·{' '}
                  {p.lastUsedAt ? `dernière utilisation le ${formatDate(p.lastUsedAt)}` : 'jamais utilisée'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(p)}
                aria-label={`Retirer la clé ${p.name}`}
                className="rounded-control border border-danger px-3 py-1.5 text-sm font-semibold text-danger hover:bg-mist"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}

      {!supported && (
        <p className="text-sm text-ink-muted">
          Ce navigateur ne permet pas d’ajouter une clé d’accès (il faut une version récente et une connexion
          sécurisée).
        </p>
      )}

      {supported && !adding && (
        <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
          Ajouter une clé d’accès sur cet appareil
        </button>
      )}

      {adding && (
        <form onSubmit={add} className="space-y-3" noValidate>
          <Field label="Mot de passe actuel" error={error?.fields?.password}>
            <input
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Nom de la clé (facultatif)" hint="Pour la reconnaître ensuite, par exemple « Ordinateur du bureau ».">
            <input className={inputClass} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <FormError error={error} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !password} aria-busy={busy} className={primaryButton}>
              {busy ? 'Suivez les indications de l’appareil…' : 'Créer la clé'}
            </button>
            <button type="button" onClick={close} className={secondaryButton}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {!adding && <FormError error={error} />}
      <p role="status" aria-live="polite" className="text-sm text-success">
        {notice}
      </p>
    </div>
  );
}
