const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../validations/auth.validation');
const { readingRules, historyRules } = require('../validations/reading.validation');
const { receive, list } = require('../controllers/reading.controller');

router.post('/readings', readingRules, validate, receive);
router.get('/readings', authenticateToken, historyRules, validate, list);

module.exports = router;