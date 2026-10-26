import { useEffect, useState } from 'react';
import { api } from '../api';
import PlantCharacter from '../components/PlantCharacter';
import Pair from './Pair';
import Dashboard from './Dashboard';
import './landing.css';
import './auth.css';

export default function Home({ onLogout }) {
  const [view, setView] = useState('loading'); // 'loading' | 'pair' | 'ready' | 'error'
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0); // bump this to run the check again

  useEffect(() => {
    let cancelled = false;

    api('/api/plant')
      .then(() => { if (!cancelled) setView('ready'); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) setView('pair'); // logged in, but no plant yet
        else if (err.status === 401 || err.status === 403) onLogout(); // session is no longer valid
        else { setMessage(err.message); setView('error'); }
      });

    return () => { cancelled = true; };
  }, [attempt, onLogout]);

  function retry() {
    setView('loading');
    setAttempt((a) => a + 1);
  }

  if (view === 'pair') return <Pair onDone={() => setView('ready')} onLogout={onLogout} />;
  if (view === 'ready') return <Dashboard onLogout={onLogout} />;

  return (
    <div className="landing auth-page">
      <div className="auth-card glass">
        <PlantCharacter state={view === 'error' ? 'thirsty' : 'okay'} size={120} />
        {view === 'error' ? (
          <>
            <h1>Can't reach the server</h1>
            <p className="auth-sub">{message}</p>
            <button className="btn btn-block" onClick={retry}>Try again</button>
          </>
        ) : (
          <p className="auth-sub">Looking for your plant...</p>
        )}
      </div>
    </div>
  );
}