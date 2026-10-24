const { body } = require('express-validator');

const plantRules = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Plant name is required (max 100 characters)'),
];

module.exports = { plantRules };