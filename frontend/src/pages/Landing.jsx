import { useState } from 'react';
import PlantCharacter from '../components/PlantCharacter';
import './landing.css';

// Same thresholds the backend uses to turn a score into a mood
function stateFor(score) {
  if (score >= 80) return 'Thriving';
  if (score >= 60) return 'Okay';
  if (score >= 40) return 'Thirsty';
  if (score >= 20) return 'Wilting';
  return 'Critical';
}

const STEPS = [
  { title: 'It listens', text: 'A tiny ESP32 sensor in the soil measures how wet it is.' },
  { title: 'It thinks', text: 'The server turns the readings into a score and a mood.' },
  { title: 'It shows', text: 'Your plant smiles, droops or asks for water on the dashboard.' },
];

const MOODS = [
  { state: 'Thriving', range: '80 and up', score: 90 },
  { state: 'Okay', range: '60 to 79', score: 70 },
  { state: 'Thirsty', range: '40 to 59', score: 50 },
  { state: 'Wilting', range: '20 to 39', score: 30 },
  { state: 'Critical', range: 'under 20', score: 10 },
];

export default function Landing({ onStart }) {
  const [score, setScore] = useState(85);
  const state = stateFor(score);

  return (
    <div className="landing">
      <header className="nav">
        <span className="logo">PlantVerse</span>
        <div className="nav-buttons">
          <button className="btn btn-ghost" onClick={() => onStart('login')}>Log in</button>
          <button className="btn" onClick={() => onStart('register')}>Sign up</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>
            Your plant, but it has <span className="grad">feelings</span>
          </h1>
          <p>
            A tiny soil sensor listens to your plant. PlantVerse turns what it hears into a
            mood you can see, so you always know when it is thirsty.
          </p>
          <button className="btn btn-big" onClick={() => onStart('register')}>Start growing</button>
        </div>

        <div className="stage glass">
          <div className="glow" />
          <PlantCharacter state={state} size={230} />
          <div className="badge">{state}</div>
          <div className="slider-wrap">
            <label htmlFor="score">Plant score: <strong>{score}</strong></label>
            <input
              id="score"
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
            <small>Drag it and watch the mood change. In the real app, your sensor does this.</small>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <p className="section-sub">Three steps from soil to smile.</p>
        <div className="grid steps">
          {STEPS.map((s, i) => (
            <div className="card glass" key={s.title}>
              <div className="num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Meet the five moods</h2>
        <p className="section-sub">Tap one to see it up close.</p>
        <div className="grid moods">
          {MOODS.map((m) => (
            <button
              type="button"
              key={m.state}
              className={`mood-card glass${m.state === state ? ' active' : ''}`}
              onClick={() => setScore(m.score)}
            >
              <PlantCharacter state={m.state} size={110} animated={m.state === state} />
              <strong>{m.state}</strong>
              <span>{m.range}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="footer">Made for CS403 · Group 3 · ESP32 + Express + React</footer>
    </div>
  );
}