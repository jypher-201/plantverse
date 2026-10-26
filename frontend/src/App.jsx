import { useEffect, useState } from 'react';
import { api, setAccessToken, refreshAccessToken } from './api';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

// Temporary: shows what GET /api/plant returns, until we build the real dashboard
function PlantCheck() {
  const [text, setText] = useState('loading...');

  useEffect(() => {
    api('/api/plant')
      .then((data) => setText(JSON.stringify(data, null, 2)))
      .catch((err) => setText(`${err.status}: ${err.message}`));
  }, []);

  return <pre>{text}</pre>;
}

export default function App() {
  const [session, setSession] = useState('loading'); // 'loading' | 'out' | 'in'
  const [screen, setScreen] = useState('landing'); // while logged out: 'landing' | 'auth'
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    refreshAccessToken().then((ok) => setSession(ok ? 'in' : 'out'));
  }, []);

  async function handleLogout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setScreen('landing');
    setSession('out');
  }

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

  return (
    <div style={{ padding: 24 }}>
      <h1>PlantVerse</h1>
      <button onClick={handleLogout}>Log out</button>
      <PlantCheck />
    </div>
  );
}