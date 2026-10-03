import { breadcrumbTrail } from '../lib/breadcrumbs.js';
import { Link, useLocation } from '../lib/router.jsx';

// Repère de navigation des pages internes : chaque niveau précédent est cliquable.
export default function Breadcrumb() {
  const { pathname } = useLocation();
  const trail = breadcrumbTrail(pathname);
  if (trail.length < 2) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={crumb.to} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              {isLast ? (
                <span aria-current="page" className="font-bold text-ink">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="rounded-control text-primary underline underline-offset-4 hover:text-primary-strong"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
