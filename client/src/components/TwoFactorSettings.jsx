import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { focusFirstError } from '../lib/focusError.js';
import Field, { FormError, inputClass } from './Field.jsx';
import QrCode from './QrCode.jsx';

const primaryButton =
  'rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-strong disabled:opacity-60';
const secondaryButton =
  'rounded-control border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:bg-mist';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// Vérification en deux étapes (F53) : activation guidée, codes de secours, désactivation.
// Étapes : idle → password (activation) → scan → codes ; ou idle → disable (désactivation).
export default function TwoFactorSettings() {
  const [status, setStatus] = useState(null);
  const [step, setStep] = useState('idle');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [setup, setSetup] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const headingRef = useRef(null);

  useEffect(() => {
    api('/me/two-factor').then(setStatus, setError);
  }, []);

  // À chaque étape, le focus va sur le mot de passe à saisir, sinon sur le titre de l'étape
  // (QR code, codes de secours) : le lecteur d'écran annonce où l'on en est.
  useEffect(() => {
    if (step === 'idle') return;
    const heading = headingRef.current;
    const field = ['password', 'disable'].includes(step) ? heading?.closest('form')?.querySelector('input') : null;
    (field ?? heading)?.focus();
  }, [step]);

  function go(next) {
    setError(null);
    setPassword('');
    setCode('');
    setStep(next);
  }

  async function run(e, action) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      await action();
    } catch (err) {
      setError(err);
      focusFirstError(e.target);
    } finally {
      setBusy(false);
    }
  }

  const startSetup = (e) =>
    run(e, async () => {
      setSetup(await api('/me/two-factor/setup', { method: 'POST', body: { password } }));
      go('scan');
    });

  const confirmCode = (e) =>
    run(e, async () => {
      const data = await api('/me/two-factor/confirm', { method: 'POST', body: { code } });
      setRecoveryCodes(data.recoveryCodes);
      setSetup(null);
      setStatus({ enabled: true, enabledAt: data.enabledAt, recoveryCodesLeft: data.recoveryCodes.length });
      go('codes');
    });

  const disable = (e) =>
    run(e, async () => {
      await api('/me/two-factor', { method: 'DELETE', body: { password } });
      setStatus({ enabled: false, enabledAt: null, recoveryCodesLeft: 0 });
      go('idle');
      setNotice('Vérification en deux étapes désactivée : seul votre mot de passe protège désormais le compte.');
    });

  function finish() {
    setRecoveryCodes([]);
    go('idle');
    setNotice('Vérification en deux étapes activée. Un code vous sera demandé à chaque connexion.');
  }

  const passwordField = (
    <Field label="Mot de passe actuel" error={error?.fields?.password}>
      <input
        type="password"
        autoComplete="current-password"
        className={inputClass}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </Field>
  );

  const stepHeading = (text) => (
    <h4 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-ink focus:outline-none">
      {text}
    </h4>
  );

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-ink">Vérification en deux étapes</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Après le mot de passe, un code à 6 chiffres donné par une application de votre téléphone (Google
          Authenticator, Microsoft Authenticator, Aegis…) est demandé. Quelqu’un qui connaît votre mot de
          passe ne peut pas entrer sans ce téléphone.
        </p>
      </div>

      {step === 'idle' && status && (
        <>
          <p className="text-sm text-ink">
            {status.enabled
              ? `Activée depuis le ${formatDate(status.enabledAt)}. Codes de secours restants : ${status.recoveryCodesLeft}.`
              : 'Non activée.'}
          </p>
          <button
            type="button"
            onClick={() => go(status.enabled ? 'disable' : 'password')}
            className={status.enabled ? secondaryButton : primaryButton}
          >
            {status.enabled ? 'Désactiver' : 'Activer la vérification en deux étapes'}
          </button>
        </>
      )}

      {step === 'password' && (
        <form onSubmit={startSetup} className="space-y-3" noValidate>
          {stepHeading('Confirmez que c’est bien vous')}
          {passwordField}
          <FormError error={error} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !password} className={primaryButton}>
              Continuer
            </button>
            <button type="button" onClick={() => go('idle')} className={secondaryButton}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {step === 'scan' && setup && (
        <form onSubmit={confirmCode} className="space-y-4" noValidate>
          {stepHeading('Reliez votre application')}
          <ol className="list-decimal space-y-4 pl-5 text-sm text-ink">
            <li className="space-y-2">
              <p>Dans l’application, ajoutez un compte et scannez ce QR code.</p>
              <div className="inline-block rounded-control border border-line p-2">
                <QrCode value={setup.otpauthUrl} label={`QR code à scanner pour ${setup.issuer}`} />
              </div>
              <p className="text-ink-muted">Impossible de scanner ? Saisissez cette clé dans l’application :</p>
              <p className="rounded-control bg-mist px-3 py-2 font-mono text-base break-all select-all text-ink">
                {setup.secret}
              </p>
              <p>
                <a href={setup.otpauthUrl} className="font-medium text-primary underline underline-offset-4">
                  Ouvrir directement dans l’application de ce téléphone
                </a>
              </p>
            </li>
            <li className="space-y-2">
              <p>Saisissez le code à 6 chiffres affiché par l’application.</p>
              <Field label="Code de vérification" error={error?.fields?.code}>
                <input
                  className={`${inputClass} font-mono tracking-widest`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </Field>
            </li>
          </ol>
          <FormError error={error} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !code.trim()} className={primaryButton}>
              Confirmer
            </button>
            <button type="button" onClick={() => go('idle')} className={secondaryButton}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {step === 'codes' && (
        <div className="space-y-3">
          {stepHeading('Vos codes de secours')}
          <p className="text-sm text-ink">
            Chaque code fonctionne une seule fois, si vous n’avez plus votre téléphone. Notez-les ou
            imprimez-les maintenant : ils ne seront plus affichés.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-control bg-mist p-3 font-mono text-sm text-ink">
            {recoveryCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => window.print()} className={secondaryButton}>
              Imprimer
            </button>
            <button type="button" onClick={finish} className={primaryButton}>
              J’ai noté mes codes
            </button>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <form onSubmit={disable} className="space-y-3" noValidate>
          {stepHeading('Désactiver la vérification en deux étapes')}
          <p className="text-sm text-ink-muted">Votre compte ne sera plus protégé que par le mot de passe.</p>
          {passwordField}
          <FormError error={error} />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy || !password}
              className="rounded-control bg-danger px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60"
            >
              Désactiver
            </button>
            <button type="button" onClick={() => go('idle')} className={secondaryButton}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {step === 'idle' && !status && <FormError error={error} />}
      <p role="status" aria-live="polite" className="text-sm text-success">
        {notice}
      </p>
    </div>
  );
}
