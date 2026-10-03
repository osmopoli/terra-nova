import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import HomePage from './pages/HomePage.jsx';
import MyRequestsPage, { MyRequestPage } from './pages/MyRequestsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
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
  const { user, meta, setUser, logout } = session;

  if (pathname === '/') return <HomePage user={user} />;
  // Ajouter les routes métier ici (ex. /items, /items/:id).
  if (pathname.startsWith('/mes-demarches')) {
    if (!user) return <LoginRedirect to={pathname} />;
    if (user.role !== 'citoyen') {
      return <NotFoundPage message="Le suivi des démarches est réservé aux habitants." />;
    }
    const match = pathname.match(/^\/mes-demarches\/(\d+)$/);
    if (match) return <MyRequestPage id={match[1]} meta={meta} />;
    if (pathname === '/mes-demarches') return <MyRequestsPage meta={meta} />;
  }
  if (pathname === '/connexion' || pathname === '/profil') {
    return (
      <div className="flex justify-center">
        {user ? (
          <ProfileScreen user={user} onUpdated={setUser} onLogout={logout} />
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

  // Token refusé par l'API (401) pendant une action : déconnexion locale.
  function expire() {
    setToken(null);
    setUser(null);
  }

  return (
    <Layout user={user}>
      {loading ? (
        <p className="text-ink-muted">Chargement...</p>
      ) : (
        <Route session={{ user, meta, setUser, logout, expire }} />
      )}
    </Layout>
  );
}
