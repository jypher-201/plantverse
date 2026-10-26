import { useId } from 'react';
import './plant.css';

const DARK = '#2b1840';
const LINE = { stroke: DARK, strokeWidth: 3.5, strokeLinecap: 'round', fill: 'none' };

// Everything that changes with the mood lives in this one table
const MOODS = {
  thriving: {
    leafDeg: -20, headTilt: 0, petals: 6, headScale: 1, face: 'happy',
    leaf: ['#b6f5a1', '#58d26e', '#23a055'],
    petal: ['#ffe0f0', '#ff8cc3', '#e8559f'],
  },
  okay: {
    leafDeg: -6, headTilt: 0, petals: 6, headScale: 1, face: 'content',
    leaf: ['#bff0a0', '#6fcf6a', '#2f9a52'],
    petal: ['#ffe0f0', '#ff9acb', '#e8669f'],
  },
  thirsty: {
    leafDeg: 14, headTilt: 10, petals: 5, headScale: 0.96, face: 'worried', sweat: true,
    leaf: ['#e6f09a', '#b2cc5c', '#7a9f3e'],
    petal: ['#f9d3e6', '#ec9fc4', '#c97aa3'],
  },
  wilting: {
    leafDeg: 32, headTilt: 28, petals: 4, headScale: 0.9, face: 'sad', sweat: true,
    leaf: ['#f0e3a0', '#cdb856', '#8f8a3c'],
    petal: ['#e6d0db', '#c4a3b5', '#97798a'],
  },
  critical: {
    leafDeg: 45, headTilt: 48, petals: 3, headScale: 0.8, face: 'dizzy',
    leaf: ['#d9c6a0', '#aa9060', '#6f5a3a'],
    petal: ['#cfc2c9', '#a59aa2', '#7d7077'],
  },
};

const LEAF = 'M100 120 C108 96 140 90 160 100 C154 126 126 136 100 120 Z';
const VEIN = 'M104 119 C122 110 144 104 156 101';
const STAR = 'M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z';

function Eye({ cx, cy, squash, uid }) {
  const ry = squash ? 7 : 13;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="10" ry={ry} fill={`url(#${uid}eye)`} />
      <circle cx={cx - 3.5} cy={cy - (squash ? 2 : 5)} r="3.6" fill="#fff" />
      <circle cx={cx + 3.5} cy={cy + (squash ? 2 : 5)} r="1.8" fill="#fff" opacity="0.9" />
    </g>
  );
}

function XEye({ cx, cy }) {
  const d = `M${cx - 7} ${cy - 7} L${cx + 7} ${cy + 7} M${cx + 7} ${cy - 7} L${cx - 7} ${cy + 7}`;
  return <path d={d} stroke={DARK} strokeWidth="4" strokeLinecap="round" fill="none" />;
}

function Face({ kind, uid }) {
  return (
    <g>
      <ellipse cx="66" cy="213" rx="8" ry="5" fill="#ff4f9a" opacity="0.4" />
      <ellipse cx="134" cy="213" rx="8" ry="5" fill="#ff4f9a" opacity="0.4" />

      {kind === 'dizzy' ? (
        <>
          <XEye cx={80} cy={198} />
          <XEye cx={120} cy={198} />
        </>
      ) : (
        <g className="blink">
          <Eye cx={80} cy={198} squash={kind === 'sad'} uid={uid} />
          <Eye cx={120} cy={198} squash={kind === 'sad'} uid={uid} />
        </g>
      )}

      {(kind === 'worried' || kind === 'sad') && (
        <>
          <path d="M69 184 L90 179" {...LINE} />
          <path d="M131 184 L110 179" {...LINE} />
        </>
      )}

      {kind === 'happy' && (
        <>
          <path d="M84 214 Q100 238 116 214 Q100 220 84 214 Z" fill="#4a1d3f" />
          <ellipse cx="100" cy="222.5" rx="6.5" ry="3.2" fill="#ff7ea8" />
        </>
      )}
      {kind === 'content' && <path d="M88 216 Q100 227 112 216" {...LINE} />}
      {kind === 'worried' && <path d="M90 224 Q100 218 110 224" {...LINE} />}
      {kind === 'sad' && <path d="M88 226 Q100 213 112 226" {...LINE} />}
      {kind === 'dizzy' && <path d="M86 222 q5 -6 10 0 t10 0 t10 0" {...LINE} />}
    </g>
  );
}

// Two leaves, one mirrored. The inner group rotates with the mood; the outer one sways.
function LeafPair({ uid, deg, transform, delay }) {
  const leaf = (mirror) => (
    <g transform={mirror ? 'translate(200 0) scale(-1 1)' : undefined}>
      <g className="sway" style={{ animationDelay: delay }}>
        <g
          style={{
            transformOrigin: '100px 120px',
            transform: `rotate(${deg}deg)`,
            transition: 'transform 0.7s ease',
          }}
        >
          <path d={LEAF} fill={`url(#${uid}leaf)`} />
          <path d={VEIN} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </g>
  );

  return (
    <g transform={transform}>
      {leaf(false)}
      {leaf(true)}
    </g>
  );
}

// state: 'Thriving' | 'Okay' | 'Thirsty' | 'Wilting' | 'Critical' (the backend's names)
export default function PlantCharacter({ state = 'okay', size = 220, animated = true }) {
  const uid = useId().replace(/:/g, ''); // unique prefix so several plants on one page don't share gradients
  const key = String(state).toLowerCase();
  const m = MOODS[key] || MOODS.okay;

  return (
    <svg
      className={`plant${animated ? ' idle' : ''}`}
      viewBox="0 0 200 260"
      width={size}
      height={size * 1.3}
      role="img"
      aria-label={`${key} plant`}
    >
      <defs>
        <linearGradient id={`${uid}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc9e5" />
          <stop offset="0.5" stopColor="#ff8cc3" />
          <stop offset="1" stopColor="#e65aa0" />
        </linearGradient>
        <linearGradient id={`${uid}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3f1" />
          <stop offset="1" stopColor="#ff9ac8" />
        </linearGradient>
        <linearGradient id={`${uid}leaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.leaf[0]} />
          <stop offset="0.55" stopColor={m.leaf[1]} />
          <stop offset="1" stopColor={m.leaf[2]} />
        </linearGradient>
        <linearGradient id={`${uid}petal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.petal[0]} />
          <stop offset="0.55" stopColor={m.petal[1]} />
          <stop offset="1" stopColor={m.petal[2]} />
        </linearGradient>
        <radialGradient id={`${uid}center`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset="0.6" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#f29b1d" />
        </radialGradient>
        <radialGradient id={`${uid}eye`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#6a45b5" />
          <stop offset="1" stopColor={DARK} />
        </radialGradient>
        <linearGradient id={`${uid}drop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4f0ff" />
          <stop offset="1" stopColor="#5fc4f5" />
        </linearGradient>
        <filter id={`${uid}blur`} x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="100" cy="248" rx="48" ry="7" fill="#2b1a3d" opacity="0.18" filter={`url(#${uid}blur)`} />

      {/* pot */}
      <path
        d="M54 170 L146 170 Q150 170 148 176 L138 232 Q136 244 124 244 L76 244 Q64 244 62 232 L52 176 Q50 170 54 170 Z"
        fill={`url(#${uid}body)`}
      />
      <ellipse cx="88" cy="196" rx="28" ry="22" fill="#fff" opacity="0.14" />
      <path d="M60 180 Q57 208 65 232" stroke="#fff" strokeOpacity="0.4" strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="46" y="148" width="108" height="24" rx="12" fill={`url(#${uid}rim)`} />
      <rect x="50" y="164" width="100" height="6" rx="3" fill="#e0559c" opacity="0.25" />
      <rect x="58" y="152" width="84" height="5" rx="2.5" fill="#fff" opacity="0.55" />

      {/* soil */}
      <ellipse cx="100" cy="149" rx="45" ry="7" fill="#5a3350" />
      <ellipse cx="100" cy="147" rx="38" ry="4" fill="#7a4a68" opacity="0.6" />

      {/* stem */}
      <path d="M100 152 C96 132 104 108 100 90" stroke={m.leaf[2]} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M102 150 C99 132 106 110 102 92" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* leaves: small pair behind, big pair in front */}
      <LeafPair uid={uid} deg={m.leafDeg + 10} transform="translate(100 140) scale(0.72) translate(-100 -120)" delay="-1.2s" />
      <LeafPair uid={uid} deg={m.leafDeg} delay="0s" />

      <Face kind={m.face} uid={uid} />

      {/* flower head: tilts from the neck, loses petals as the mood drops */}
      <g
        style={{
          transformOrigin: '100px 90px',
          transform: `rotate(${m.headTilt}deg)`,
          transition: 'transform 0.7s ease',
        }}
      >
        <g transform={`translate(100 56) scale(${m.headScale}) translate(-100 -56)`}>
          {Array.from({ length: m.petals }, (_, i) => (
            <g key={i} transform={`rotate(${(360 / m.petals) * i} 100 56)`}>
              <ellipse cx="100" cy="37" rx="11" ry="19" fill={`url(#${uid}petal)`} />
              <ellipse cx="97" cy="31" rx="3.5" ry="8" fill="#fff" opacity="0.35" />
            </g>
          ))}
          <circle cx="100" cy="56" r="14" fill={`url(#${uid}center)`} />
          <ellipse cx="95" cy="51" rx="5" ry="3.2" fill="#fff" opacity="0.6" />
        </g>
      </g>

      {m.sweat && (
        <g transform="translate(140 186)">
          <path d="M0 -10 C6 -2 8 4 0 8 C-8 4 -6 -2 0 -10 Z" fill={`url(#${uid}drop)`} stroke="#fff" strokeOpacity="0.6" />
          <ellipse cx="-2" cy="1" rx="1.5" ry="2.6" fill="#fff" opacity="0.8" />
        </g>
      )}

      {key === 'thriving' &&
        [[38, 64, '0s'], [164, 96, '-0.8s'], [150, 30, '-1.5s']].map(([x, y, delay]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <path className="twinkle" d={STAR} fill="#ffe27a" stroke="#fff" strokeWidth="1" style={{ animationDelay: delay }} />
          </g>
        ))}
    </svg>
  );
}