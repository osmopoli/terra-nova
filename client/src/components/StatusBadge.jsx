import { labelOf } from '../lib/constants.js';

// Couleur de pastille par statut de message (le libellé vient de /api/meta et reste
// toujours affiché : la couleur ne porte jamais seule l'information).
const TONES = {
  en_cours: 'bg-warning/10 text-warning',
  traite: 'bg-success/10 text-success',
};

export default function StatusBadge({ statuses, value }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
        TONES[value] ?? 'bg-mist text-ink'
      }`}
    >
      {labelOf(statuses, value)}
    </span>
  );
}
