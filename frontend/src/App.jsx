import { useCallback, useEffect, useState } from 'react';
import { api, setAccessToken, refreshAccessToken } from './api';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';

export default function App() {
  const [session, setSession] = useState('loading'); // 'loading' | 'out' | 'in'
  const [screen, setScreen] = useState('landing'); // while logged out: 'landing' | 'auth'
  const [authMode, setAuthMode] = useState('login');

  // On page load, try to restore the session from the refresh cookie
  useEffect(() => {
    refreshAccessToken().then((ok) => setSession(ok ? 'in' : 'out'));
  }, []);

  const handleLogout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setScreen('landing');
    setSession('out');
  }, []);

  if (session === 'loading') return <p style={{ padding: 24 }}>Loading...</p>;

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