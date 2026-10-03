import { Suspense, lazy, useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import AgentLayout from './components/AgentLayout.jsx';
import ArrivalPage from './pages/ArrivalPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// F61 (appareils modestes) : seules les pages d'entrée (arrivée, accueil) sont dans le bundle
// initial ; les autres sont téléchargées à la première visite (un fichier JS par page).
const AuthScreen = lazy(() => import('./components/AuthScreen.jsx'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen.jsx'));
const MyMessages = lazy(() => import('./components/MyMessages.jsx'));
const OnboardingGuide = lazy(() => import('./components/OnboardingGuide.jsx'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage.jsx'));
const AgentPage = lazy(() => import('./pages/AgentPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AgentDemandesPage = lazy(() => import('./pages/AgentDemandesPage.jsx'));
const AgentDashboardPage = lazy(() => import('./pages/AgentDashboardPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'));
const ServicePage = lazy(() => import('./pages/ServicePage.jsx'));
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const SobrietyPage = lazy(() => import('./pages/SobrietyPage.jsx'));

function Loading({ className = 'text-ink-muted' }) {
  return (
    <p role="status" className={className}>
      Chargement...
    </p>
  );
}
import { api, getToken, setToken } from './api/client.js';
import { loginPath, safeRedirect } from './lib/redirect.js';
import { navigate, useLocation } from './lib/router.jsx';

// Page réservée aux connectés : redirection vers la connexion, retour prévu après.
function LoginRedirect({ to }) {
  useEffect(() => navigate(loginPath(to), { replace: true }), [to]);
  return null;
}

function Route({ session }) {
  const { pathname, searchParams } = useLocation();
  const { user, meta, setUser, logout, expire, accountDeleted } = session;

  if (pathname === '/') return <HomePage user={user} />;
  // Ajouter les routes métier ici (ex. /items, /items/:id).
  if (pathname === '/contact') return <ContactPage user={user} meta={meta} onExpired={expire} />;
  if (pathname === '/services') return <ServicesPage meta={meta} />;
  if (pathname === '/accessibilite') return <AccessibilityPage />;
  if (pathname === '/sobriete') return <SobrietyPage />;
  const serviceMatch = pathname.match(/^\/services\/([a-z0-9-]+)$/);
  if (serviceMatch) return <ServicePage slug={serviceMatch[1]} meta={meta} user={user} />;
  if (pathname === '/signaler') {
    if (!user) return <LoginRedirect to="/signaler" />;
    if (user.role !== 'citoyen') {
      return <NotFoundPage message="Le signalement est réservé aux habitants." />;
    }
    return <ReportPage meta={meta} />;
  }
  if (pathname === '/agent/tableau-de-bord') {
    if (!user || user.role === 'citoyen') {
      return <NotFoundPage message="Page réservée aux agents municipaux." />;
    }
    return <AgentDashboardPage meta={meta} onExpired={expire} />;
  }
  if (pathname === '/agent/demandes') {
    if (!user || user.role === 'citoyen') {
      return <NotFoundPage message="Page réservée aux agents municipaux." />;
    }
    return <AgentDemandesPage meta={meta} />;
  }
  if (pathname === '/connexion' || pathname === '/profil') {
    return (
      <div className="flex flex-col items-center gap-6">
        {user ? (
          <>
            <ProfileScreen user={user} onUpdated={setUser} onLogout={logout} onDeleted={accountDeleted} />
            <MyMessages meta={meta} />
          </>
        ) : (
          <AuthScreen
            onAuthenticated={(u) => {
              setUser(u);
              // Retour explicite vers la page d'origine (?redirect=), jamais `back`.
              navigate(safeRedirect(searchParams.get('redirect')), { replace: true });
            }}
          />
        )}
      </div>
    );
  }
  return <NotFoundPage />;
}

export default function App() {
  const [meta, setMeta] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [notice, setNotice] = useState(null);
  const { pathname, searchParams } = useLocation();

  useEffect(() => {
    // Listes fermées (constantes métier) servies par l'API.
    api('/meta')
      .then(setMeta)
      .catch(() => setMeta({}));

    if (!getToken()) return;
    // Token expiré ou révoqué : on l'oublie et on revient à l'état déconnecté.
    api('/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // /agent sans session : connexion, puis retour explicite vers l'espace agents.
  useEffect(() => {
    if (pathname === '/agent' && !loading && !user) navigate(loginPath('/agent'), { replace: true });
  }, [pathname, loading, user]);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Token déjà invalide côté serveur : la déconnexion locale suffit.
    } finally {
      setToken(null);
      setUser(null);
      navigate('/');
    }
  }

  // Compte supprimé côté serveur : session locale fermée, retour sur une page publique avec confirmation.
  function accountDeleted() {
    setToken(null);
    setUser(null);
    setNotice('Votre compte a été supprimé. Vos données personnelles ont été effacées.');
    navigate('/services');
  }

  // Token refusé par l'API (401) pendant une action : déconnexion locale.
  function expire() {
    setToken(null);
    setUser(null);
  }

  // Visiteur non connecté : parcours d'arrivée plein écran (accueil puis connexion).
  if (!loading && !user && (pathname === '/' || pathname === '/connexion')) {
    return pathname === '/' ? (
      <ArrivalPage />
    ) : (
      <Suspense fallback={<Loading className="min-h-dvh bg-space p-6 text-star-muted" />}>
        <LoginPage
          onAuthenticated={(u) => {
            setUser(u);
            navigate(safeRedirect(searchParams.get('redirect')), { replace: true });
          }}
        />
      </Suspense>
    );
  }

  // Back-office agents : layout distinct. Le rôle est vérifié par l'API (403 pour un citoyen).
  if (pathname === '/agent') {
    return (
      <AgentLayout user={user} onLogout={logout}>
        {loading || !user ? (
          <Loading />
        ) : (
          <Suspense fallback={<Loading />}>
            <AgentPage onExpired={expire} />
          </Suspense>
        )}
      </AgentLayout>
    );
  }

  return (
    <Layout user={user}>
      {notice && !user && (
        <p
          role="status"
          className="mb-4 flex items-start justify-between gap-3 rounded-card bg-mist p-4 text-sm text-ink"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 font-medium text-primary underline">
            Fermer
          </button>
        </p>
      )}
      {loading ? (
        <Loading />
      ) : (
        <Suspense fallback={<Loading />}>
          {/* D12 : guide de première connexion, pour les habitants uniquement. */}
          {user?.role === 'citoyen' && !user.onboardedAt && (
            <OnboardingGuide user={user} onDone={setUser} />
          )}
          <Route session={{ user, meta, setUser, logout, expire, accountDeleted }} />
        </Suspense>
      )}
    </Layout>
  );
}
