import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import AgentLayout from './components/AgentLayout.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import MyMessages from './components/MyMessages.jsx';
import OnboardingGuide from './components/OnboardingGuide.jsx';
import AccessibilityPage from './pages/AccessibilityPage.jsx';
import AgentPage from './pages/AgentPage.jsx';
import ArrivalPage from './pages/ArrivalPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AgentDemandesPage from './pages/AgentDemandesPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ServicePage from './pages/ServicePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import SobrietyPage from './pages/SobrietyPage.jsx';
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
      <LoginPage
        onAuthenticated={(u) => {
          setUser(u);
          navigate(safeRedirect(searchParams.get('redirect')), { replace: true });
        }}
      />
    );
  }

  // Back-office agents : layout distinct. Le rôle est vérifié par l'API (403 pour un citoyen).
  if (pathname === '/agent') {
    return (
      <AgentLayout user={user} onLogout={logout}>
        {loading || !user ? (
          <p className="text-ink-muted">Chargement...</p>
        ) : (
          <AgentPage onExpired={expire} />
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
        <p role="status" className="text-ink-muted">
          Chargement...
        </p>
      ) : (
        <>
          {/* D12 : guide de première connexion, pour les habitants uniquement. */}
          {user?.role === 'citoyen' && !user.onboardedAt && (
            <OnboardingGuide user={user} onDone={setUser} />
          )}
          <Route session={{ user, meta, setUser, logout, expire, accountDeleted }} />
        </>
      )}
    </Layout>
  );
}
