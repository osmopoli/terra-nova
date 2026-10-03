import { useState } from 'react';
import { api } from '../api/client.js';
import Field, { FormError, OptionSelect, inputClass } from '../components/Field.jsx';
import { labelOf } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { dateStyle: 'long' });
const EMPTY = { title: '', summary: '', body: '', category: 'annonce', important: false };

export function ImportantBadge() {
  return (
    <span className="rounded-control bg-danger px-2 py-0.5 text-xs font-bold uppercase text-white">
      Important
    </span>
  );
}

/** Formulaire de publication réservé aux agents et administrateurs (case « annonce importante »). */
function PublishForm({ meta, onPublished }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api('/news', { method: 'POST', body: form });
      setForm(EMPTY);
      onPublished();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <details className="rounded-card bg-surface p-4 shadow-card">
      <summary className="cursor-pointer font-bold">Publier une actualité</summary>
      <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
        <Field label="Titre" error={error?.fields?.title}>
          <input className={inputClass} value={form.title} onChange={update('title')} />
        </Field>
        <Field label="Résumé" error={error?.fields?.summary}>
          <input className={inputClass} value={form.summary} onChange={update('summary')} />
        </Field>
        <Field label="Contenu" error={error?.fields?.body}>
          <textarea className={inputClass} rows={5} value={form.body} onChange={update('body')} />
        </Field>
        <Field label="Catégorie" error={error?.fields?.category}>
          <OptionSelect options={meta.newsCategories} value={form.category} onChange={update('category')} />
        </Field>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.important}
            onChange={(e) => setForm({ ...form, important: e.target.checked })}
          />
          <span>
            <span className="font-medium">Annonce importante</span>
            <span className="block text-ink-muted">Les habitants connectés en sont prévenus immédiatement.</span>
          </span>
        </label>
        <FormError error={error} />
        <button
          type="submit"
          className="rounded-control bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-strong"
        >
          Publier
        </button>
      </form>
    </details>
  );
}

/** Actualités de la ville (D06), avec les annonces importantes signalées (F30). */
export default function NewsPage({ user, meta }) {
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState(0);
  const list = useAsync(
    () => api(`/news${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    [category, version],
  );
  const canPublish = user && user.role !== 'citoyen';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Actualités</h1>
          <p className="mt-1 text-ink-muted">Annonces municipales, changements de service, informations pratiques.</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Catégorie</span>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Toutes</option>
            {(meta.newsCategories ?? []).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {canPublish && <PublishForm meta={meta} onPublished={() => setVersion((v) => v + 1)} />}

      {list.status === 'loading' && <p className="text-ink-muted">Chargement...</p>}
      {list.status === 'error' && <p className="text-danger">{list.error.message}</p>}
      {list.status === 'success' && list.data.data.length === 0 && (
        <p className="text-ink-muted">Aucune actualité dans cette catégorie.</p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {list.data?.data.map((post) => (
          <li key={post.id}>
            <article
              className={`h-full rounded-card bg-surface p-5 shadow-card ${post.important ? 'border-l-4 border-danger' : ''}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-muted">
                {post.important && <ImportantBadge />}
                <span>{labelOf(meta.newsCategories, post.category)}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
              <h2 className="mt-2 font-display text-lg font-bold">
                <Link to={`/actualites/${post.id}`} className="underline-offset-4 hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-1 text-ink-muted">{post.summary}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewsDetailPage({ id, meta }) {
  const post = useAsync(() => api(`/news/${id}`), [id]);
  if (post.status === 'loading') return <p className="text-ink-muted">Chargement...</p>;
  if (post.status === 'error') return <p className="text-danger">{post.error.message}</p>;
  const p = post.data;
  return (
    <article className="mx-auto max-w-2xl rounded-card bg-surface p-6 shadow-card">
      <Link to="/actualites" className="text-sm font-semibold text-primary">
        Toutes les actualités
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-muted">
        {p.important && <ImportantBadge />}
        <span>{labelOf(meta.newsCategories, p.category)}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold">{p.title}</h1>
      <p className="mt-3 text-lg text-ink-muted">{p.summary}</p>
      <div className="mt-6 whitespace-pre-line leading-relaxed">{p.body}</div>
      {p.authorName && <p className="mt-6 text-sm text-ink-muted">Publié par {p.authorName}</p>}
    </article>
  );
}
