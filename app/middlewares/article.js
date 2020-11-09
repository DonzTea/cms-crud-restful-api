const { body, param } = require('express-validator');

const { validate } = require('../utils/middleware.js');

const createArticleBodyValidation = validate([
  body('title')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
  body('content')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
]);

const updateArticleBodyValidation = validate([
  body('title')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
  body('content')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
]);

module.exports = {
  createArticleBodyValidation,
  updateArticleBodyValidation,
};
