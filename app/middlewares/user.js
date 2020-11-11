const { body, param } = require('express-validator');
const asyncHandler = require('express-async-handler');

const roles = require('../config/config.js').ROLES;
const { validate } = require('../utils/middleware.js');
const arrayUtil = require('../utils/array.js');

const User = require('../config/db.js').user;

const createUserBodyValidation = validate([
  body('name')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
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
  body('roles').optional().isArray().withMessage('is not an array'),
  body('roles.*')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isIn(roles)
    .withMessage(
      `is expected to be ${arrayUtil.formatToReadableString(roles, 'or')}`,
    ),
]);

const updateUserBodyValidation = validate([
  body('name')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('username')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isAlphanumeric()
    .withMessage('is containing illegal character')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('is not an email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
  body('roles').optional().isArray().withMessage('is not an array'),
  body('roles.*')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isIn(roles)
    .withMessage(
      `is expected to be ${arrayUtil.formatToReadableString(roles, 'or')}`,
    ),
]);

const checkParamIdExistence = validate([
  param('id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail(),
]);

const checkDuplicateUsernameOrEmail = asyncHandler(async (req, res, next) => {
  try {
    const errors = [];

    if (req.body.username) {
      // * check if username is already taken
      const userWithSameUsername = await User.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (userWithSameUsername) {
        errors.push('Fail -> Username is already taken!');
      }
    }

    if (req.body.email) {
      // * check if email is already in use
      const userWithSameEmail = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (userWithSameEmail) {
        errors.push('Fail -> Email is already in use!');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const isRolesValid = asyncHandler(async (req, res, next) => {
  if (req.body.roles && req.body.roles.length > 0) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!roles.includes(req.body.roles[i].toUpperCase())) {
        return res
          .status(400)
          .send('Fail -> Does not exist Role = ' + req.body.roles[i]);
      }
    }
  }
  next();
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      const roles = await user
        .getRoles()
        .then((roles) => roles.map((role) => role.name));

      if (roles.includes('ADMIN')) {
        return next();
      }
    }

    return res.status(403).json({ error: 'you are not admin, access denied' });
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = {
  createUserBodyValidation,
  updateUserBodyValidation,
  checkParamIdExistence,
  checkDuplicateUsernameOrEmail,
  isRolesValid,
  isAdmin,
};
