import { Children, cloneElement, isValidElement, useId } from 'react';

export const inputClass =
  'w-full rounded-control border border-line bg-surface px-3 py-3 text-base text-ink focus:border-primary focus:ring-2 focus:ring-primary/30';

// Label relié explicitement au champ (htmlFor/id) ; aide et erreur annoncées par
// le lecteur d'écran via aria-describedby, erreur signalée par aria-invalid.
export default function Field({ label, error, hint, children }) {
  const id = useId();
  const hintId = `${id}-aide`;
  const errorId = `${id}-erreur`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child, {
        id: child.props.id ?? id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : child;

  return (
    <div>
      <label htmlFor={child.props?.id ?? id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger">
          <span className="font-semibold">Erreur : </span>
          {error}
        </p>
      )}
    </div>
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
  return (
    <p role="alert" className="rounded-control bg-danger/10 p-3 text-sm text-danger">
      <span className="font-semibold">Erreur : </span>
      {error.message}
    </p>
  );
}
