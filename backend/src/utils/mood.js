const DECAY_SPEED = Number(process.env.DECAY_SPEED || 1); // 60 makes 1 minute act like 1 hour (for demos)
const OFFLINE_AFTER_MIN = 15; // no readings for this long = sensor offline

function stateFromScore(score) {
  if (score >= 80) return 'Thriving';
  if (score >= 60) return 'Okay';
  if (score >= 40) return 'Thirsty';
  if (score >= 20) return 'Wilting';
  return 'Critical';
}

// recentReadings: newest first, up to 10 rows [{ moisture_level, created_at }]
// lastWateredAt: a Date or null
function calculateMood(recentReadings, lastWateredAt, now = Date.now()) {
  if (!recentReadings.length) {
    return { score: 0, state: 'Critical', avgMoisture: null, online: false };
  }

  // 1. Weighted rolling average (weights 1, 1/2, 1/3, ...)
  let weighted = 0;
  let weightSum = 0;
  recentReadings.forEach((r, i) => {
    const w = 1 / (i + 1);
    weighted += r.moisture_level * w;
    weightSum += w;
  });
  const avg = weighted / weightSum;

  // 2. Dry penalty: longer since watering while the soil is dry = bigger penalty (max 30)
  const hoursSinceWatered = lastWateredAt
    ? ((now - new Date(lastWateredAt).getTime()) / 3600000) * DECAY_SPEED
    : 48;
  const dryPenalty = avg < 50 ? Math.min(30, hoursSinceWatered * 1.5) : 0;

  // 3. Staleness penalty: no new readings makes the plant wilt (max 20)
  const lastAt = new Date(recentReadings[0].created_at).getTime();
  const minsSinceReading = ((now - lastAt) / 60000) * DECAY_SPEED;
  const stalePenalty = Math.min(20, Math.max(0, minsSinceReading - OFFLINE_AFTER_MIN) * 0.5);

  const score = Math.max(0, Math.min(100, Math.round(avg - dryPenalty - stalePenalty)));

  return {
    score,
    state: stateFromScore(score),
    avgMoisture: Math.round(avg),
    online: minsSinceReading <= OFFLINE_AFTER_MIN,
  };
}

module.exports = { calculateMood, stateFromScore };