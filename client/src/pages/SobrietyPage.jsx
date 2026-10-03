import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { APP_NAME } from '../lib/constants.js';
import { useAsync } from '../lib/useAsync.js';
import ListState from '../components/ListState.jsx';
import {
  RESOURCE_KINDS,
  formatGrams,
  formatKb,
  formatMs,
  gradeTone,
  summarizeVisit,
} from '../lib/sobriety.js';

const TONES = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

function Grade({ grade, large = false }) {
  const { word, tone } = gradeTone(grade);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 font-semibold ${TONES[tone]}`}>
      <span aria-hidden="true" className={`font-display font-bold ${large ? 'text-3xl' : 'text-base'}`}>
        {grade}
      </span>
      <span className={large ? 'text-sm' : 'text-xs'}>
        <span className="sr-only">Note {grade}, </span>
        {word}
      </span>
    </span>
  );
}

function KeyFigure({ value, label }) {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">{value}</dd>
    </div>
  );
}

/** Choix sobres réellement en place : chaque phrase est vérifiable dans le code ou dans les mesures. */
function appliedChoices(data) {
  const home = data.pages[0];
  const shell = home.resources;
  const script = shell.find((r) => r.type === 'js');
  const style = shell.find((r) => r.type === 'css' && r.url.startsWith('/'));
  const hosts = [...new Set(shell.filter((r) => /^https?:/.test(r.url)).map((r) => new URL(r.url).hostname))];
  const icons = data.images.filter((i) => /\/icon[^/]*\.svg$/.test(i.url));
  const choices = [
    `Une seule application : la coquille (page HTML, un script, une feuille de style) se charge une fois. Changer de page ne télécharge ensuite que les données (et le visuel des pages d’arrivée et de connexion).`,
    'Pas de framework d’interface lourd ni de bibliothèque d’icônes : React seul, un mini-routeur maison et des pictogrammes SVG écrits dans le code.',
  ];
  if (style) {
    choices.push(
      `Styles générés à la demande : seules les classes utilisées sont gardées, soit ${formatKb(style.transferred)} de feuille de style compressée.`,
    );
  }
  if (script) {
    choices.push(
      `Fichiers texte compressés en Brotli par le serveur de production : le script principal passe de ${formatKb(script.bytes)} à ${formatKb(script.transferred)} transférés.`,
    );
  }
  choices.push(
    hosts.length
      ? `Aucun traceur, aucune publicité, aucun script d’un autre site. Seule ressource externe : ${hosts.join(', ')} (polices, affichées avec la police du système en attendant leur chargement).`
      : 'Aucun traceur, aucune publicité, aucune ressource d’un autre site.',
  );
  if (icons.length) {
    choices.push(
      `Icônes de l’application en SVG : ${icons.map((i) => formatKb(i.bytes)).join(' et ')}.`,
    );
  }
  choices.push(
    'Une recherche ou un filtre relancé annule la requête précédente : aucune donnée téléchargée pour rien.',
    'Si votre appareil demande de réduire les animations, la plateforme les désactive.',
  );
  return choices;
}

function VisitMeasures() {
  const [visit, setVisit] = useState(null);
  const [ready, setReady] = useState(false);
  const measure = useCallback(() => {
    setVisit(summarizeVisit(typeof performance === 'undefined' ? undefined : performance));
    setReady(true);
  }, []);

  useEffect(() => {
    // Les durées utilisent loadEventEnd : on attend la fin du chargement de la page, puis chaque
    // nouveau fichier (données d'API chargées ensuite) met la mesure à jour.
    let observer;
    const start = () => {
      measure();
      if (typeof PerformanceObserver !== 'undefined') {
        observer = new PerformanceObserver(measure);
        observer.observe({ type: 'resource' });
      }
    };
    let id;
    if (document.readyState === 'complete') id = setTimeout(start, 0);
    else window.addEventListener('load', start, { once: true });
    return () => {
      clearTimeout(id);
      window.removeEventListener('load', start);
      observer?.disconnect();
    };
  }, [measure]);

  return (
    <section aria-labelledby="visite" className="mt-10 rounded-card bg-mist p-5 sm:p-8">
      <h2 id="visite" className="font-display text-2xl font-bold text-ink">
        Mesuré sur votre visite
      </h2>
      <p className="mt-2 text-ink">
        Ces chiffres viennent de votre navigateur : tout ce que {APP_NAME} a téléchargé depuis son
        ouverture dans cet onglet.
      </p>
      {!ready ? (
        <p role="status" className="mt-4 text-ink-muted">
          Mesure en cours...
        </p>
      ) : !visit ? (
        <p className="mt-4 text-ink">Votre navigateur ne fournit pas ces mesures.</p>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KeyFigure label="Données transférées" value={formatKb(visit.transferred)} />
            <KeyFigure label="Fichiers chargés" value={visit.requests} />
            <KeyFigure label="CO2 estimé" value={formatGrams(visit.co2Grams)} />
            <KeyFigure label="Page lisible après" value={visit.domReady ? formatMs(visit.domReady) : '—'} />
          </dl>
          <div className="relative mt-4 overflow-x-auto rounded-card bg-surface shadow-card" tabIndex={0} role="region" aria-labelledby="detail-visite">
            <table className="w-full text-left text-sm">
              <caption id="detail-visite" className="px-4 pt-3 text-left font-semibold text-ink">
                Détail par nature de fichier
              </caption>
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th scope="col" className="px-4 py-2 font-semibold">Nature</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Fichiers</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Transféré</th>
                </tr>
              </thead>
              <tbody>
                {RESOURCE_KINDS.filter(({ key }) => visit.byKind[key].requests > 0).map(({ key, label }) => (
                  <tr key={key} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-2 font-normal text-ink">{label}</th>
                    <td className="px-4 py-2 text-right tabular-nums">{visit.byKind[key].requests}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatKb(visit.byKind[key].transferred)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink marker:text-primary">
            {visit.cached > 0 && (
              <li>
                {visit.cached} fichier{visit.cached > 1 ? 's' : ''} repris de la mémoire de votre
                navigateur, sans nouveau téléchargement.
              </li>
            )}
            {visit.unmeasured > 0 && (
              <li>
                {visit.unmeasured} fichier{visit.unmeasured > 1 ? 's' : ''} d’un autre site dont la taille
                n’est pas communiquée au navigateur : non compté{visit.unmeasured > 1 ? 's' : ''}.
              </li>
            )}
            <li>Une page déjà visitée est plus légère : rechargez pour comparer.</li>
          </ul>
          <button
            type="button"
            onClick={measure}
            className="mt-4 rounded-control border border-line-strong bg-surface px-4 py-2 font-semibold text-ink hover:bg-canvas"
          >
            Mesurer à nouveau
          </button>
        </>
      )}
    </section>
  );
}

/** F57 : poids, requêtes, CO2 estimé et note des pages principales, plus les mesures de la visite. */
export default function SobrietyPage() {
  const state = useAsync(() => api('/sobriete'), []);
  const data = state.data;
  const home = data?.pages?.[0];
  const maxWeight = data ? Math.max(...data.pages.map((p) => p.transferred)) : 1;

  return (
    <article className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Sobriété numérique</h1>
      <p className="mt-3 text-lg text-ink-muted">
        Chaque visite consomme de l’énergie : sur les serveurs, le réseau et votre appareil. Voici ce que
        pèse {APP_NAME}, ce que cela représente en CO2, et ce qui la garde légère.
      </p>

      <ListState state={state} isEmpty={!home} loadingLabel="Chargement des mesures..." empty={{ title: 'Mesures indisponibles' }}>
        {home && (
          <>
            <section aria-labelledby="chiffres" className="mt-8">
              <h2 id="chiffres" className="font-display text-2xl font-bold text-ink">
                L’accueil en 4 chiffres
              </h2>
              <p className="mt-1 text-ink-muted">Première visite, rien en mémoire dans le navigateur.</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KeyFigure label="Données transférées" value={formatKb(home.transferred)} />
                <KeyFigure label="Fichiers demandés" value={home.requests} />
                <KeyFigure label="CO2 estimé par visite" value={formatGrams(home.co2Grams)} />
                <div className="rounded-card bg-surface p-4 shadow-card">
                  <dt className="text-sm text-ink-muted">Note de A à G</dt>
                  <dd className="mt-1">
                    <Grade grade={home.grade} large />
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="pages" className="mt-10">
              <h2 id="pages" className="font-display text-2xl font-bold text-ink">
                Les pages principales
              </h2>
              <div className="relative mt-4 overflow-x-auto rounded-card bg-surface shadow-card" tabIndex={0} role="region" aria-labelledby="pages-legende">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <caption id="pages-legende" className="px-4 pt-3 text-left text-ink-muted">
                    Premier chargement de chaque page, estimation.
                  </caption>
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th scope="col" className="px-4 py-2 font-semibold">Page</th>
                      <th scope="col" className="px-4 py-2 font-semibold">Poids</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">Requêtes</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">CO2</th>
                      <th scope="col" className="px-4 py-2 font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map((page) => (
                      <tr key={page.path} className="border-b border-line last:border-0">
                        <th scope="row" className="px-4 py-2 font-semibold text-ink">{page.label}</th>
                        <td className="px-4 py-2">
                          <span className="tabular-nums">{formatKb(page.transferred)}</span>
                          <span aria-hidden="true" className="mt-1 block h-1.5 w-24 rounded-full bg-mist">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${Math.max(4, Math.round((page.transferred / maxWeight) * 100))}%` }}
                            />
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{page.requests}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{formatGrams(page.co2Grams)}</td>
                        <td className="px-4 py-2">
                          <Grade grade={page.grade} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-ink">
                Moyenne : {formatKb(data.summary.transferred)}, {data.summary.requests} requêtes,{' '}
                {formatGrams(data.summary.co2Grams)} de CO2 par visite, note {data.summary.grade}. Une fois
                l’application ouverte, passer d’une page à l’autre ne coûte que{' '}
                {formatKb(Math.max(...data.pages.map((p) => p.navigationTransferred)))} au plus.
              </p>
            </section>
          </>
        )}
      </ListState>

      <VisitMeasures />

      {home && (
        <>
          <section aria-labelledby="choix" className="mt-10">
            <h2 id="choix" className="font-display text-2xl font-bold text-ink">
              Ce qui garde la plateforme légère
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink marker:text-primary">
              {appliedChoices(data).map((choice) => (
                <li key={choice}>{choice}</li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-lg font-bold text-ink">Images servies</h3>
            <ul className="mt-2 divide-y divide-line rounded-card bg-surface text-sm shadow-card">
              {data.images.map((image) => (
                <li key={image.url} className="flex flex-wrap justify-between gap-2 px-4 py-2">
                  <span className="break-all text-ink">{image.url.split('/').pop()}</span>
                  <span className="tabular-nums text-ink-muted">
                    {image.format.toUpperCase()}, {formatKb(image.bytes)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <details className="mt-10 rounded-card bg-surface p-5 shadow-card">
            <summary className="cursor-pointer font-semibold text-ink">Comment c’est calculé</summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink marker:text-primary">
              {Object.entries(data.method).map(([key, text]) => (
                <li key={key}>{text}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              Calculé à partir des fichiers du site le{' '}
              {new Date(data.generatedAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}.
            </p>
          </details>
        </>
      )}
    </article>
  );
}
