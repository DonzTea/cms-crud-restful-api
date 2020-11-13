const { body, param } = require('express-validator');
const asyncHandler = require('express-async-handler');

const { validate } = require('../utils/middleware.js');
const db = require('../config/db.js');

const User = db.user;
const Article = db.article;

const bodyRequired = validate([
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

const bodyOptional = validate([
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

const isAuthorized = asyncHandler(async (req, res, next) => {
  try {
    const userIdPayload = req.userId;

    const { id } = req.params;
    const article = await Article.findByPk(id);
    const owner = await article.getUser();

    if (userIdPayload === owner.id) {
      return next();
    }

    const user = await User.findOne({ where: { id: userIdPayload } });
    const roles = await user
      .getRoles()
      .then((roles) => roles.map((role) => role.name));
    if (roles && roles.length > 0 && roles.includes('ADMIN')) {
      return next();
    }

    return res.status(403).json({
      message: 'You are not authorized, access denied',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isParamArticleIdExists = validate([
  param('article_id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail(),
]);

module.exports = {
  bodyRequired,
  bodyOptional,
  isAuthorized,
  isParamArticleIdExists,
};
