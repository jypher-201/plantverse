import { useCallback, useEffect, useState } from 'react';
import { api, setAccessToken, refreshAccessToken } from './api';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import ServerDown from './components/ServerDown';

export default function App() {
  const [session, setSession] = useState('loading'); // 'loading' | 'out' | 'in' | 'offline'
  const [offlineMessage, setOfflineMessage] = useState('');
  const [attempt, setAttempt] = useState(0); // bump this to run the startup check again
  const [screen, setScreen] = useState('landing'); // while logged out: 'landing' | 'auth'
  const [authMode, setAuthMode] = useState('login');

  // On page load, try to restore the session from the refresh cookie
  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then((ok) => { if (!cancelled) setSession(ok ? 'in' : 'out'); })
      .catch((err) => {
        if (cancelled) return;
        setOfflineMessage(err.message);
        setSession('offline');
      });

    return () => { cancelled = true; };
  }, [attempt]);

  function retry() {
    setSession('loading');
    setAttempt((a) => a + 1);
  }

  const handleLogout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setScreen('landing');
    setSession('out');
  }, []);

  if (session === 'loading') return <p style={{ padding: 24 }}>Loading...</p>;
  if (session === 'offline') return <ServerDown message={offlineMessage} onRetry={retry} />;

  if (session === 'out') {
    if (screen === 'landing') {
      return <Landing onStart={(mode) => { setAuthMode(mode); setScreen('auth'); }} />;
    }
    return (
      <Auth
        initialMode={authMode}
        onLoggedIn={() => setSession('in')}
        onBack={() => setScreen('landing')}
      />
    );
  }

  return <Home onLogout={handleLogout} />;
}