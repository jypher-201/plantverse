const pool = require('../config/db');

async function getLatestReading(plantId) {
  const result = await pool.query(
    `SELECT moisture_level, created_at FROM readings
     WHERE plant_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [plantId]
  );
  return result.rows[0];
}

async function insertReading(plantId, moistureLevel, rawValue) {
  await pool.query(
    'INSERT INTO readings (plant_id, moisture_level, raw_value) VALUES ($1, $2, $3)',
    [plantId, moistureLevel, rawValue]
  );
}

module.exports = { getLatestReading, insertReading };