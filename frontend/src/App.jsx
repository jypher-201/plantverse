import { useEffect, useState } from 'react';
import { api } from './api';

export default function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    api('/health')
      .then((data) => setStatus(data.status))
      .catch((err) => setStatus('error: ' + err.message));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>PlantVerse</h1>
      <p>API status: {status}</p>
    </div>
  );
}