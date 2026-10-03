import { serviceUi } from '../lib/contentLanguage.js';

/** Choix de la langue des contenus des services (F27) ; chaque langue est écrite dans sa propre langue. */
export default function LanguageSwitcher({ options = [], value, onChange }) {
  if (options.length < 2) return null;
  return (
    <div role="group" aria-label={serviceUi(value).language} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.value}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className="rounded-control border border-primary px-3 py-1.5 text-sm font-semibold text-primary aria-pressed:bg-primary aria-pressed:text-white"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
