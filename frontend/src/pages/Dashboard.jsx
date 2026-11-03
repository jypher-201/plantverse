import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import PlantCharacter from '../components/PlantCharacter';
import ServerDown from '../components/ServerDown';
import './landing.css';
import './auth.css';
import './dashboard.css';

const BAR = {
  Thriving: '#2bc46a',
  Okay: '#7bd96a',
  Thirsty: '#e6c84a',
  Wilting: '#f29a4a',
  Critical: '#e0368a',
};

function timeAgo(iso) {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export default function Dashboard({ onLogout }) {
  const [plant, setPlant] = useState(null);
  const [error, setError] = useState('');
  const [watering, setWatering] = useState(false);
  const [copied, setCopied] = useState(false);

  // One function used by the timer and by the water button
  const load = useCallback(async () => {
    try {
      const data = await api('/api/plant');
      setPlant(data);
      setError('');
    } catch (err) {
      if (err.status === 401 || err.status === 403) onLogout(); // session is no longer valid
      else setError(err.message);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id); // stop the timer when this screen goes away
  }, [load]);

  async function handleWater() {
    setWatering(true);
    try {
      await api('/api/water', { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWatering(false);
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(plant.deviceKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // the key box is selectable, so copying by hand still works
    }
  }

  if (!plant) {
    if (error) return <ServerDown message={error} onRetry={load} />;
    return <p style={{ padding: 24 }}>Loading your plant...</p>;
  }

  const waiting = !plant.lastReadingAt;
  const shownState = waiting ? 'Okay' : plant.state;
  const statusClass = waiting ? 'wait' : plant.online ? 'on' : 'off';
  const statusText = waiting ? 'Not connected yet' : plant.online ? 'Online' : 'Offline';

  return (
    <div className="landing">
      <header className="nav">
        <span className="logo">PlantVerse</span>
        <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
      </header>

      <main className="dash">
        {error && (
          <div className="banner" role="alert">
            Connection problem. Showing the last data we received.
          </div>
        )}

        <section className="glass plant-card">
          <div className="glow" />
          <h1>{plant.name}</h1>
          <PlantCharacter state={shownState} size={240} />
          <div className="badge">{waiting ? 'Waiting for data' : plant.state}</div>

          {waiting ? (
            <p className="waiting">Waiting for the first reading from your sensor...</p>
          ) : (
            <div className="score">
              <div className="score-top">
                <span>Mood score</span>
                <strong>{plant.score}/100</strong>
              </div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${plant.score}%`, background: BAR[plant.state] }}
                />
              </div>
            </div>
          )}

          <button className="btn btn-big water" onClick={handleWater} disabled={watering}>
            {watering ? 'Watering...' : 'I watered it'}
          </button>
          <small className="note">Your plant's mood recovers when the sensor feels wet soil.</small>
        </section>

        <section className="side">
          <div className="glass info">
            <h2>Sensor</h2>
            <dl>
              <div>
                <dt>Status</dt>
                <dd><span className={`pill ${statusClass}`}>{statusText}</span></dd>
              </div>
              <div>
                <dt>Soil moisture</dt>
                <dd>{plant.avgMoisture === null ? '-' : `${plant.avgMoisture}%`}</dd>
              </div>
              <div>
                <dt>Last reading</dt>
                <dd>{timeAgo(plant.lastReadingAt)}</dd>
              </div>
              <div>
                <dt>Last watered</dt>
                <dd>{timeAgo(plant.lastWateredAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="glass info">
            <h2>Device key</h2>
            <div className="key-box">{plant.deviceKey}</div>
            <p className="hint">The ESP32 sends this key with every reading. Keep it private.</p>
            <button className="btn btn-ghost" onClick={copyKey}>{copied ? 'Copied!' : 'Copy key'}</button>
          </div>
        </section>
      </main>
    </div>
  );
}