const { body } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const config = require('../config/config.js');
const User = require('../config/db.js').user;
const { validate } = require('../utils/middleware.js');
const arrayUtil = require('../utils/array.js');

const signupBodyValidation = validate([
  body('name')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string'),
  body('username')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isAlphanumeric()
    .withMessage('is containing illegal character')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('email')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isEmail()
    .withMessage('is not an email')
    .normalizeEmail(),
  body('password')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
  body('passwordConfirmation')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return value;
    }),
  body('roles').optional().isArray().withMessage('is not an array'),
  body('roles.*')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isIn(config.ROLES)
    .withMessage(
      `is expected to be ${arrayUtil.formatToReadableString(
        config.ROLES,
        'or',
      )}`,
    ),
]);

const signinBodyValidation = validate([
  body('username')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isAlphanumeric()
    .withMessage('is containing illegal character')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('password')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
]);

const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (!token) {
      return res.status(403).json({
        auth: false,
        message: 'No token provided.',
      });
    }

    if (token.startsWith('Bearer ')) {
      // remove Bearer from string
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, config.secret);

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      auth: false,
      message: 'Fail to authentication. Error -> ' + error,
    });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name.toUpperCase() === 'ADMIN') {
        return next();
      }
    }

    return res.status(403).json({ message: 'Require Admin Role!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isPmOrAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (
        roles[i].name.toUpperCase() === 'PM' ||
        roles[i].name.toUpperCase() === 'ADMIN'
      ) {
        return next();
      }
    }

    return res.status(403).json({ message: 'Require PM or Admin Roles!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  signupBodyValidation,
  signinBodyValidation,
  verifyToken,
  isAdmin,
  isPmOrAdmin,
};
