import { LANGUAGES, setLang, useI18n } from '../lib/i18n.js';

// Sélecteur de langue de l'interface (header). `dark` : variante pour le parcours d'arrivée.
export default function LanguageSwitcher({ dark = false }) {
  const { lang, t } = useI18n();
  const active = dark ? 'bg-glow/25 text-star' : 'bg-primary text-white';
  const idle = dark ? 'text-star-muted hover:text-star' : 'text-ink-muted hover:text-ink';

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={`flex shrink-0 rounded-control border p-0.5 text-sm font-bold ${
        dark ? 'border-glow/40' : 'border-ink-muted/40'
      }`}
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-label={l.label}
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          className={`min-h-9 min-w-10 rounded-control px-2 ${lang === l.code ? active : idle}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
