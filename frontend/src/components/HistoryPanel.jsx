import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api';

const RANGES = [
  { hours: 1, label: '1 h' },
  { hours: 6, label: '6 h' },
  { hours: 24, label: '24 h' },
];
const MAX_POINTS = 150;

// A reading every 10 seconds is thousands of points a day; a chart only needs about 150
function thin(rows, max = MAX_POINTS) {
  if (rows.length <= max) return rows;
  const step = Math.ceil(rows.length / max);
  const out = rows.filter((_, i) => i % step === 0);
  const last = rows[rows.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

const fmtTime = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtFull = (ms) =>
  new Date(ms).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export default function HistoryPanel() {
  const [tab, setTab] = useState('chart'); // 'chart' | 'log'
  const [hours, setHours] = useState(1);
  const [readings, setReadings] = useState([]);
  const [events, setEvents] = useState([]);

  // Fetch both lists now and every 5 seconds; restart when the range changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [r, w] = await Promise.all([
          api(`/api/readings?hours=${hours}`),
          api('/api/water-history'),
        ]);
        if (cancelled) return;
        setReadings(r);
        setEvents(w);
      } catch {
        // keep showing the last data; the dashboard already shows a connection banner
      }
    }

    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hours]);

  const data = thin(readings).map((r) => ({
    t: new Date(r.created_at).getTime(),
    v: r.moisture_level,
  }));

  // Only draw watering lines that fall inside the time span of the chart
  const from = data.length ? data[0].t : 0;
  const to = data.length ? data[data.length - 1].t : 0;
  const waterTimes = events
    .map((e) => new Date(e.created_at).getTime())
    .filter((t) => t >= from && t <= to);

  return (
    <div className="glass panel">
      <div className="panel-head">
        <div className="tabs">
          <button className={`tab${tab === 'chart' ? ' on' : ''}`} onClick={() => setTab('chart')}>
            Moisture
          </button>
          <button className={`tab${tab === 'log' ? ' on' : ''}`} onClick={() => setTab('log')}>
            Watering log
          </button>
        </div>

        {tab === 'chart' && (
          <div className="tabs">
            {RANGES.map((r) => (
              <button
                key={r.hours}
                className={`tab${hours === r.hours ? ' on' : ''}`}
                onClick={() => setHours(r.hours)}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'chart' ? (
        data.length < 2 ? (
          <p className="empty-note">
            {data.length === 0
              ? `No readings in the last ${hours} h yet.`
              : 'Waiting for more readings to draw the line...'}
          </p>
        ) : (
          <>
            <div className="chart-box">
              <div className="chart-fill">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="moistFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5fa2" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#ff5fa2" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,26,61,0.1)" />
                    <XAxis
                      dataKey="t"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={fmtTime}
                      tick={{ fontSize: 12 }}
                      minTickGap={40}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 12 }}
                      unit="%"
                      width={44}
                    />
                    <Tooltip
                      labelFormatter={fmtFull}
                      formatter={(v) => [`${v}%`, 'Moisture']}
                    />
                    <ReferenceLine y={50} stroke="#e0368a" strokeDasharray="5 5" />
                    {waterTimes.map((t) => (
                      <ReferenceLine key={t} x={t} stroke="#2bc46a" strokeWidth={2} />
                    ))}
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#e0368a"
                      strokeWidth={3}
                      fill="url(#moistFill)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="caption">Dashed line: below 50% the soil counts as dry. Green lines: watering.</p>
          </>
        )
      ) : (
        <ul className="log">
          {events.length === 0 && <li className="empty-note">No watering yet.</li>}
          {events.map((e) => (
            <li key={e.id}>
              <span className={`src ${e.source}`}>
                {e.source === 'auto' ? 'Auto-detected' : 'Manual'}
              </span>
              <span>
                {new Date(e.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}