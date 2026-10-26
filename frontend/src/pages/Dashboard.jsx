import { useEffect, useState } from 'react';
import { api } from '../api';

// Temporary: shows the raw plant data until we build the real dashboard
export default function Dashboard({ onLogout }) {
  const [text, setText] = useState('loading...');

  useEffect(() => {
    api('/api/plant')
      .then((data) => setText(JSON.stringify(data, null, 2)))
      .catch((err) => setText(`${err.status}: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>PlantVerse</h1>
      <button onClick={onLogout}>Log out</button>
      <pre>{text}</pre>
    </div>
  );
}