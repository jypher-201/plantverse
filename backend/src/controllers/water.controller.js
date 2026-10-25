const { findPlantByUserId } = require('../models/plant.model');
const { recordWatering, getWaterHistory } = require('../models/water.model');

async function water(req, res, next) {
  try {
    const plant = await findPlantByUserId(req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'No plant yet' });
    }

    await recordWatering(plant.id, 'manual');
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const plant = await findPlantByUserId(req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'No plant yet' });
    }

    const events = await getWaterHistory(plant.id);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

module.exports = { water, history };