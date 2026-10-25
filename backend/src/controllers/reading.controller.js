const { findPlantByDeviceKey } = require('../models/plant.model');
const { getLatestReading, insertReading } = require('../models/reading.model');
const { recordWatering } = require('../models/water.model');
const { findPlantByUserId } = require('../models/plant.model');
const { getReadingsSince } = require('../models/reading.model');

const WATER_JUMP = 15; // a rise of this many points between readings counts as watering

async function receive(req, res, next) {
  try {
    const { device_key, moisture_level, raw_value } = req.body;

    const plant = await findPlantByDeviceKey(device_key);
    if (!plant) {
      return res.status(401).json({ error: 'Unknown device key' });
    }

    // Read the previous value BEFORE inserting the new one, or we'd compare it to itself
    const previous = await getLatestReading(plant.id);

    await insertReading(plant.id, moisture_level, raw_value ?? null);

    if (previous && moisture_level - previous.moisture_level >= WATER_JUMP) {
      await recordWatering(plant.id, 'auto');
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const plant = await findPlantByUserId(req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'No plant yet' });
    }

    const hours = req.query.hours || 24;
    const readings = await getReadingsSince(plant.id, hours);
    res.json(readings);
  } catch (err) {
    next(err);
  }
}

module.exports = { receive, list };