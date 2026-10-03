import { useId, useState } from 'react';
import { inputClass } from '../components/Field.jsx';
import { GLOSSARY, searchGlossary } from '../lib/glossary.js';
import { Link } from '../lib/router.jsx';

// Glossaire (D13) : les mots administratifs de la plateforme, expliqués simplement.
export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const searchId = useId();
  const entries = searchGlossary(query);

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Glossaire</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Les mots de la mairie, expliqués simplement. Sur les autres pages, les mots soulignés en
        pointillés s'expliquent aussi quand vous passez dessus ou les touchez.
      </p>

      <div className="mt-6 max-w-md">
        <label htmlFor={searchId} className="mb-1 block text-sm font-medium text-ink">
          Chercher un mot
        </label>
        <input
          id={searchId}
          type="search"
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Par exemple : état civil"
          autoComplete="off"
        />
      </div>

      <p role="status" className="mt-4 text-sm text-ink-muted">
        {entries.length === GLOSSARY.length
          ? `${entries.length} mots expliqués`
          : `${entries.length} résultat${entries.length > 1 ? 's' : ''}`}
      </p>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-card bg-surface p-5 shadow-card">
          <p className="font-semibold text-ink">Aucun mot ne correspond à « {query.trim()} ».</p>
          <p className="mt-1 text-ink-muted">
            Essayez un autre mot, ou <Link to="/contact">posez votre question à la mairie</Link>.
          </p>
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              id={entry.id}
              className="scroll-mt-6 rounded-card border border-line bg-surface p-5 shadow-card"
            >
              <dt className="font-display text-lg font-bold text-ink">{entry.term}</dt>
              <dd className="mt-1 text-ink-muted">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
