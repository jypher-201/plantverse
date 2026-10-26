import { useState } from 'react';
import { api, setAccessToken } from '../api';
import PlantCharacter from '../components/PlantCharacter';
import './landing.css';
import './auth.css';

export default function Auth({ onLoggedIn, onBack, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await api('/auth/register', { method: 'POST', body: { email, password } });
      }
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      setAccessToken(data.accessToken);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="landing auth-page">
      <button type="button" className="btn btn-ghost back" onClick={onBack}>← Back</button>

      <form className="auth-card glass" onSubmit={handleSubmit}>
        <PlantCharacter state={error ? 'thirsty' : 'okay'} size={120} />
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-sub">
          {mode === 'login' ? 'Your plant has been waiting.' : 'Then we will set up your plant.'}
        </p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </label>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register'}
        </button>

        <p className="switch">
          {mode === 'login' ? 'No account yet? ' : 'Already registered? '}
          <button type="button" className="link" onClick={switchMode}>
            {mode === 'login' ? 'Create one' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}