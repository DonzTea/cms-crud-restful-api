const { body } = require('express-validator');
const asyncHandler = require('express-async-handler');

const roles = require('../config/config.js').ROLES;
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
    .isIn(roles)
    .withMessage(
      `is expected to be ${arrayUtil.formatToReadableString(roles, 'or')}`,
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

const isAuthorizedForUpdate = (req, res, next) => {
  const userIdPayload = req.userId;
  const { id } = req.params;

  if (
    userIdPayload === id ||
    (req.body.roles &&
      req.body.roles.length > 0 &&
      req.body.roles.includes('ADMIN'))
  ) {
    next();
  }

  res.sendStatus(403);
};

const isAuthorizedForDelete = asyncHandler(async (req, res, next) => {
  const userIdPayload = req.userId;
  const { id } = req.params;

  if (userIdPayload === id) {
    return next();
  }

  try {
    const user = await User.findOne({ where: { id: userIdPayload } });
    const roles = await user
      .getRoles()
      .then((roles) => roles.map((role) => role.name));
    if (roles && roles.length > 0 && roles.includes('ADMIN')) {
      return next();
    }

    res.sendStatus(403);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = {
  signupBodyValidation,
  signinBodyValidation,
  isAuthorizedForUpdate,
  isAuthorizedForDelete,
};
