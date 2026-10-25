const pool = require('../config/db');

// Logs a watering AND updates last_watered_at, as one all-or-nothing unit.
async function recordWatering(plantId, source) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO water_events (plant_id, source) VALUES ($1, $2)',
      [plantId, source]
    );
    await client.query(
      'UPDATE plants SET last_watered_at = NOW() WHERE id = $1',
      [plantId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { recordWatering };