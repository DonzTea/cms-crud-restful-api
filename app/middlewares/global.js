const { validate } = require('../utils/middleware.js');
const { query } = require('express-validator');

const isRequestBodyAnObject = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    if (typeof req.body === 'object') {
      return next();
    }

    return res
      .status(400)
      .json({ message: 'Request body is expected to be an object' });
  }
  next();
};

const paginationQuery = validate([
  query('page')
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage('is expected to be an integer number greater than 0'),
  query('paginate')
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage('is expected to be an integer number greater than 0'),
]);

module.exports = {
  isRequestBodyAnObject,
  paginationQuery
};
