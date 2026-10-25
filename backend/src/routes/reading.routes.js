const express = require('express');
const router = express.Router();
const { validate } = require('../validations/auth.validation');
const { readingRules } = require('../validations/reading.validation');
const { receive } = require('../controllers/reading.controller');

router.post('/readings', readingRules, validate, receive);

module.exports = router;