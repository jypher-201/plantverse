import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import PlantCharacter from '../components/PlantCharacter';
import ServerDown from '../components/ServerDown';
import HistoryPanel from '../components/HistoryPanel';
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
    <div className="landing dash-page">
      <header className="nav">
        <span className="logo">PlantVerse</span>
        <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
      </header>

      {error && (
        <div className="banner" role="alert">
          Connection problem. Showing the last data we received.
        </div>
      )}

      <main className="dash">
        <section className="glass plant-card">
          <h1>{plant.name}</h1>

          <div className="plant-stage">
            <div className="glow" />
            <PlantCharacter state={shownState} size={240} />
          </div>

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
          <div className="tiles">
            <div className="tile glass">
              <span>Status</span>
              <strong><span className={`pill ${statusClass}`}>{statusText}</span></strong>
            </div>
            <div className="tile glass">
              <span>Soil moisture</span>
              <strong>{plant.avgMoisture === null ? '-' : `${plant.avgMoisture}%`}</strong>
            </div>
            <div className="tile glass">
              <span>Last reading</span>
              <strong>{timeAgo(plant.lastReadingAt)}</strong>
            </div>
            <div className="tile glass">
              <span>Last watered</span>
              <strong>{timeAgo(plant.lastWateredAt)}</strong>
            </div>
          </div>

          <HistoryPanel />

          <div className="glass info">
            <div className="info-head">
              <h2>Device key</h2>
              <button className="btn btn-ghost small" onClick={copyKey}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <div className="key-box">{plant.deviceKey}</div>
          </div>
        </section>
      </main>
    </div>
  );
}