const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../validations/auth.validation');
const { readingRules, historyRules } = require('../validations/reading.validation');
const { receive, list } = require('../controllers/reading.controller');

/**
 * @swagger
 * /api/readings:
 *   post:
 *     summary: ESP32 sends a moisture reading (no login; the device key identifies the plant)
 *     tags: [Readings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device_key, moisture_level]
 *             properties:
 *               device_key:
 *                 type: string
 *                 example: PV-83DA81346807
 *               moisture_level:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 63
 *               raw_value:
 *                 type: integer
 *                 example: 2210
 *     responses:
 *       200:
 *         description: Reading stored (a jump of 15+ points also logs an automatic watering)
 *       400:
 *         description: Invalid value
 *       401:
 *         description: Unknown device key
 *   get:
 *     summary: Readings for the moisture chart, oldest first
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 72
 *           default: 24
 *     responses:
 *       200:
 *         description: List of moisture_level and created_at
 *       400:
 *         description: hours out of range
 *       401:
 *         description: Access token required
 */

router.post('/readings', readingRules, validate, receive);
router.get('/readings', authenticateToken, historyRules, validate, list);

module.exports = router;