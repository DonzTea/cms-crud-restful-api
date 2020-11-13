const { body } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const { validate } = require('../utils/middleware.js');
const config = require('../config/config.js');
const db = require('../config/db.js');
const User = db.user;
const Article = db.article;
const Comment = db.comment;

const signupBodyRequired = validate([
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
]);

const signinBodyRequired = validate([
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
    let token = req.headers['authorization'];
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
    return res.status(401).json({
      auth: false,
      message: error,
    });
  }
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

    return res.status(403).json({
      message: 'You are not admin, access denied',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isUser = asyncHandler(async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      const roles = await user
        .getRoles()
        .then((roles) => roles.map((role) => role.name));

      if (roles.includes('USER')) {
        return next();
      }
    }

    return res.status(403).json({
      message: 'You are not user, access denied',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isProfileOwner = asyncHandler(async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.user_id;

    if (currentUserId !== targetUserId) {
      return res.status(403).json({
        message: 'You are not profile owner, access denied',
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isArticleOwner = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req;
    const articleId = req.params.article_id;
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({
        message: `Article with id equals to ${articleId} not found`,
      });
    }

    const owner = await article.getUser();
    if (owner.id !== userId) {
      return res.status(403).json({
        message: 'You are not article owner, access denied',
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isCommentOwner = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req;
    const commentId = req.params.comment_id;
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        message: `Comment with id equals to ${commentId} not found`,
      });
    }

    const owner = await comment.getUser();
    if (owner.id !== userId) {
      return res.status(403).json({
        message: 'You are not comment owner, access denied',
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  signupBodyRequired,
  signinBodyRequired,
  verifyToken,
  isAdmin,
  isUser,
  isProfileOwner,
  isArticleOwner,
  isCommentOwner,
};
