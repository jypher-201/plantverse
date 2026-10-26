import PlantCharacter from './PlantCharacter';
import '../pages/landing.css';
import '../pages/auth.css';

export default function ServerDown({ message, onRetry }) {
  return (
    <div className="landing auth-page">
      <div className="auth-card glass">
        <PlantCharacter state="thirsty" size={120} />
        <h1>Can't reach the server</h1>
        <p className="auth-sub">
          {message || 'Check that the backend is running and your network works.'}
        </p>
        <button className="btn btn-block" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}