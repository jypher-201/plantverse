const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { water, history } = require('../controllers/water.controller');

/**
 * @swagger
 * /api/water:
 *   post:
 *     summary: Record a manual watering ("I watered it")
 *     tags: [Watering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Watering recorded
 *       401:
 *         description: Access token required
 *       404:
 *         description: No plant yet
 * /api/water-history:
 *   get:
 *     summary: Watering log, newest first (auto and manual)
 *     tags: [Watering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of id, source, created_at
 *       401:
 *         description: Access token required
 *       404:
 *         description: No plant yet
 */

router.post('/water', authenticateToken, water);
router.get('/water-history', authenticateToken, history);

module.exports = router;