CREATE TABLE IF NOT EXISTS plants (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  device_key      VARCHAR(40) UNIQUE NOT NULL,
  last_watered_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS readings (
  id             SERIAL PRIMARY KEY,
  plant_id       INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  moisture_level INTEGER NOT NULL CHECK (moisture_level BETWEEN 0 AND 100),
  raw_value      INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_events (
  id         SERIAL PRIMARY KEY,
  plant_id   INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  source     VARCHAR(10) NOT NULL CHECK (source IN ('auto', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_plant_time
  ON readings (plant_id, created_at DESC);