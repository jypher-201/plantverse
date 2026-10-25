const { body } = require('express-validator');

const readingRules = [
  body('device_key').isString().notEmpty().withMessage('device_key is required'),
  body('moisture_level')
    .isInt({ min: 0, max: 100 })
    .withMessage('moisture_level must be a whole number from 0 to 100')
    .toInt(),
  body('raw_value')
    .optional()
    .isInt({ min: 0, max: 4095 })
    .withMessage('raw_value must be a whole number from 0 to 4095')
    .toInt(),
];

module.exports = { readingRules };