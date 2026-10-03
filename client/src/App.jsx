import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import MyMessages from './components/MyMessages.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import ArrivalPage from './pages/ArrivalPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { api, getToken, setToken } from './api/client.js';
import { loginPath, safeRedirect } from './lib/redirect.js';
import { navigate, useLocation } from './lib/router.jsx';

function RedirectToLogin({ to }) {
  useEffect(() => navigate(loginPath(to), { replace: true }), [to]);
  return null;
}

function Route({ session }) {
  const { pathname, searchParams } = useLocation();
  const { user, meta, setUser, logout, expire } = session;

  if (pathname === '/') return <HomePage user={user} />;
  // Ajouter les routes métier ici (ex. /items, /items/:id).
  if (pathname === '/admin/comptes') {
    // Réservé aux administrateurs (l'API renvoie 403 sinon) : page introuvable pour les autres.
    if (!user) return <RedirectToLogin to={pathname} />;
    if (user.role !== 'admin') return <NotFoundPage />;
    return <AdminUsersPage user={user} meta={meta} onExpired={expire} />;
  }
  if (pathname === '/contact') return <ContactPage user={user} meta={meta} onExpired={expire} />;
  if (pathname === '/connexion' || pathname === '/profil') {
    return (
      <div className="flex flex-col items-center gap-6">
        {user ? (
          <>
            <ProfileScreen user={user} onUpdated={setUser} onLogout={logout} />
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
