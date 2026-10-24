require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Schema applied.');

    const cols = await pool.query(
      `SELECT table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name IN ('plants', 'readings', 'water_events')
       ORDER BY table_name, ordinal_position`
    );
    console.table(cols.rows);
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
})();