import { api } from '../api/client.js';
import { APP_NAME } from '../lib/constants.js';
import { Link } from '../lib/router.jsx';
import { useAsync } from '../lib/useAsync.js';
import { useLightMode } from '../lib/lightMode.js';
import Term from '../components/Term.jsx';

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

// Accès directs, du plus fréquent au plus rare ; chaque tuile dit ce qu'on y fait.
function actionsFor(user) {
  const citizen = !user || user.role === 'citoyen';
  return [
    { to: '/services', title: 'Trouver un service', text: 'Horaires, contacts et démarches de la mairie.' },
    citizen && { to: '/mes-demarches', title: 'Suivre mes démarches', text: 'L’état de chaque demande envoyée.' },
    citizen && { to: '/signaler', title: 'Signaler un problème', text: 'Lampadaire, voirie, propreté : dites où.' },
    { to: '/contact', title: 'Contacter la mairie', text: 'Une question ? Écrivez aux services.' },
    !citizen && { to: '/agent', title: 'Espace agents', text: 'Demandes des habitants et suivi de la plateforme.' },
  ].filter(Boolean);
}

/** D07 : accueil de l'habitant connecté, hiérarchisé (où je suis, que faire, quoi de neuf). */
export default function HomePage({ user }) {
  const highlights = useAsync(() => api('/services/highlights'), []);
  const news = useAsync(() => api('/news?perPage=3'), []);
  const firstName = user?.fullName?.split(' ')[0];
  const posts = news.data?.data ?? [];
  // Version légère (F62) : mêmes accès et informations, en listes de liens sur une colonne.
  const light = useLightMode();

  return (
    <div className="space-y-10">
      <section aria-labelledby="accueil-titre">
        {firstName && <p className="font-semibold text-primary">Bonjour {firstName}</p>}
        <h1 id="accueil-titre" className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          {APP_NAME}, vos services municipaux en ligne
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">Que souhaitez-vous faire aujourd’hui ?</p>

        <ul
          className={
            light ? 'mt-4 divide-y divide-line border-y border-line' : 'mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'
          }
        >
          {actionsFor(user).map((action, i) => (
            <li key={action.to}>
              <Link
                to={action.to}
                className={`flex h-full flex-col ${
                  light
                    ? 'py-3 text-ink'
                    : i === 0
                      ? 'rounded-card bg-primary p-5 text-on-primary shadow-card hover:bg-primary-strong'
                      : 'rounded-card bg-surface p-5 text-ink shadow-card hover:ring-2 hover:ring-primary/40'
                }`}
              >
                <span className={`font-display text-lg font-bold ${light ? 'text-primary underline' : ''}`}>
                  {action.title}
                </span>
                <span className={`mt-1 text-sm ${i === 0 && !light ? '' : 'text-ink-muted'}`}>{action.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className={light ? 'space-y-8' : 'grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'}>
        {highlights.data?.length > 0 && (
          <section aria-labelledby="accueil-demarches">
            <h2 id="accueil-demarches" className="font-display text-xl font-bold">
              <Term id="demarche">Démarches</Term> les plus demandées
            </h2>
            <ul className="mt-3 divide-y divide-mist rounded-card bg-surface shadow-card">
              {highlights.data.map((h) => (
                <li key={h.slug}>
                  <Link
                    to={`/services/${h.slug}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-mist"
                  >
                    <span>
                      <span className="block font-semibold">{h.firstProcedure ?? h.name}</span>
                      <span className="block text-sm text-ink-muted">{h.name}</span>
                    </span>
                    <span aria-hidden="true" className="text-primary">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {posts.length > 0 && (
          <section aria-labelledby="accueil-actualites">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="accueil-actualites" className="font-display text-xl font-bold">
                Dernières actualités
              </h2>
              <Link to="/actualites" className="text-sm font-semibold text-primary hover:underline">
                Toutes les actualités
              </Link>
            </div>
            <ul className="mt-3 space-y-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/actualites/${post.id}`}
                    className={`block rounded-card bg-surface p-4 shadow-card hover:ring-2 hover:ring-primary/40 ${
                      post.important ? 'border-l-4 border-danger' : ''
                    }`}
                  >
                    <time dateTime={post.publishedAt} className="text-xs font-semibold text-ink-muted">
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="mt-1 block font-semibold">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="rounded-card bg-mist p-4 text-sm">
        <span className="font-bold">Urgence :</span> SAMU 15 · Police 17 · Pompiers 18 · Numéro
        européen 112. La plateforme ne remplace pas les secours.
      </aside>
    </div>
  );
}
