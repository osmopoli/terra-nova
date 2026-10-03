import { useState } from 'react';
import { applyLightMode, dismissAutoNotice, shouldShowAutoNotice, useLightMode } from '../lib/lightMode.js';

// Message unique quand la version légère s'est activée seule (connexion lente ou économie de données).
export function LightModeNotice({ className = '' }) {
  const enabled = useLightMode();
  const [visible, setVisible] = useState(shouldShowAutoNotice);
  if (!enabled || !visible) return null;
  return (
    <p role="status" className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-current p-3 text-sm ${className}`}>
      <span className="flex-1">
        Votre connexion semble lente : la version légère est activée (moins d’images et d’animations).
      </span>
      <span className="flex gap-3">
        <button type="button" onClick={() => applyLightMode(false)} className="font-bold underline">
          Revenir à la version complète
        </button>
        <button
          type="button"
          onClick={() => {
            dismissAutoNotice();
            setVisible(false);
          }}
          className="font-bold underline"
        >
          Garder
        </button>
      </span>
    </p>
  );
}

// Indicateur discret du pied de page, avec retour en un clic.
export function LightModeFooter({ className = '' }) {
  const enabled = useLightMode();
  if (!enabled) return null;
  return (
    <p className={className}>
      Version légère activée —{' '}
      <button type="button" onClick={() => applyLightMode(false)} className="font-semibold underline">
        Revenir à la version complète
      </button>
    </p>
  );
}
