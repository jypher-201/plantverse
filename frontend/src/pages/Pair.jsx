import { useState } from 'react';
import { api } from '../api';
import PlantCharacter from '../components/PlantCharacter';
import './landing.css';
import './auth.css';

export default function Pair({ onDone, onLogout }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [plant, setPlant] = useState(null); // filled in once the plant is created
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api('/api/plant', { method: 'POST', body: { name: name.trim() } });
      setPlant(data);
    } catch (err) {
      if (err.status === 409) {
        onDone(); // they already have a plant, so just continue
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(plant.device_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy automatically. Click the key to select it, then copy it.');
    }
  }

  // Step 2 of pairing: show the device key
  if (plant) {
    return (
      <div className="landing auth-page">
        <div className="auth-card glass">
          <PlantCharacter state="okay" size={120} />
          <h1>Meet {plant.name}!</h1>
          <p className="auth-sub">Your plant is ready. One more thing before the sensor can talk to it.</p>

          <div className="key-box">{plant.device_key}</div>
          <p className="hint">
            This is your device key, the ESP32's password. We will paste it into the sensor's code
            later. You can always find it again on your dashboard.
          </p>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <div className="btn-stack">
            <button className="btn btn-ghost btn-block" onClick={copyKey}>
              {copied ? 'Copied!' : 'Copy key'}
            </button>
            <button className="btn btn-block" onClick={onDone}>Go to my dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 of pairing: name the plant
  return (
    <div className="landing auth-page">
      <button type="button" className="btn btn-ghost back" onClick={onLogout}>Log out</button>

      <form className="auth-card glass" onSubmit={handleSubmit}>
        <PlantCharacter state="okay" size={120} />
        <h1>Name your plant</h1>
        <p className="auth-sub">This is the name you will see on your dashboard.</p>

        <label>
          Plant name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Fernando"
            required
          />
        </label>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="btn btn-block" type="submit" disabled={busy || !name.trim()}>
          {busy ? 'Planting...' : 'Plant it'}
        </button>
      </form>
    </div>
  );
}