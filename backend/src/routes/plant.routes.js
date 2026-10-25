const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../validations/auth.validation');
const { plantRules } = require('../validations/plant.validation');
const { create, get } = require('../controllers/plant.controller');

/**
 * @swagger
 * /api/plant:
 *   post:
 *     summary: Create your plant and receive its device key
 *     tags: [Plant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fernando
 *     responses:
 *       201:
 *         description: Plant created; the response includes the device_key
 *       400:
 *         description: Validation error
 *       401:
 *         description: Access token required
 *       409:
 *         description: You already have a plant
 *   get:
 *     summary: Plant status with the mood computed on every request
 *     tags: [Plant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: name, score (0-100), state (Thriving to Critical), avgMoisture, online, lastReadingAt, lastWateredAt
 *       401:
 *         description: Access token required
 *       404:
 *         description: No plant yet
 */

router.post('/plant', authenticateToken, plantRules, validate, create);
router.get('/plant', authenticateToken, get);

module.exports = router;