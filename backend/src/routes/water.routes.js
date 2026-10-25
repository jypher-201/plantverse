const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { water, history } = require('../controllers/water.controller');

router.post('/water', authenticateToken, water);
router.get('/water-history', authenticateToken, history);

module.exports = router;