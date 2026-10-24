const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../validations/auth.validation');
const { plantRules } = require('../validations/plant.validation');
const { create, get } = require('../controllers/plant.controller');

router.post('/plant', authenticateToken, plantRules, validate, create);
router.get('/plant', authenticateToken, get);

module.exports = router;