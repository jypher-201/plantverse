const pool = require('../config/db');

async function findPlantByUserId(userId) {
  const result = await pool.query('SELECT * FROM plants WHERE user_id = $1', [userId]);
  return result.rows[0];
}

async function createPlant(userId, name, deviceKey) {
  const result = await pool.query(
    `INSERT INTO plants (user_id, name, device_key)
     VALUES ($1, $2, $3)
     RETURNING id, name, device_key, last_watered_at, created_at`,
    [userId, name, deviceKey]
  );
  return result.rows[0];
}

module.exports = { findPlantByUserId, createPlant };