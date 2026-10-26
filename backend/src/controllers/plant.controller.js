const crypto = require('crypto');
const { findPlantByUserId, createPlant } = require('../models/plant.model');
const { getRecentReadings } = require('../models/reading.model');
const { calculateMood } = require('../utils/mood');

async function create(req, res, next) {
  try {
    const existing = await findPlantByUserId(req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'You already have a plant' });
    }

    const deviceKey = 'PV-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const plant = await createPlant(req.user.id, req.body.name, deviceKey);

    res.status(201).json(plant);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already have a plant' });
    }
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const plant = await findPlantByUserId(req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'No plant yet' });
    }

    const recent = await getRecentReadings(plant.id);
    const mood = calculateMood(recent, plant.last_watered_at);

    res.json({
      name: plant.name,
      deviceKey: plant.device_key,
      ...mood,
      lastReadingAt: recent[0]?.created_at ?? null,
      lastWateredAt: plant.last_watered_at,
      createdAt: plant.created_at,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get };