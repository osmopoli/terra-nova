export const inputClass =
  'w-full rounded-control border border-ink-muted/40 bg-surface px-3 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}

/** Liste déroulante alimentée par GET /api/meta (options { value, label }). */
export function OptionSelect({ options = [], placeholder = 'Choisissez', ...props }) {
  return (
    <select className={inputClass} {...props}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Message d'erreur global (ex. identifiants incorrects), quand aucun champ n'est en cause. */
export function FormError({ error }) {
  if (!error || Object.keys(error.fields ?? {}).length > 0) return null;
  return <p className="rounded-control bg-danger/10 p-3 text-sm text-danger">{error.message}</p>;
}
