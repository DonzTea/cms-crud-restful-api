const { body, param } = require('express-validator');
const asyncHandler = require('express-async-handler');

const { validate } = require('../utils/middleware.js');
const db = require('../config/db.js');

const User = db.user;
const Comment = db.comment;

const createCommentBodyValidation = validate([
  body('content')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string'),
]);

const updateCommentBodyValidation = validate([
  body('content').optional().isString().trim().withMessage('is not a string'),
]);

const checkParamArticleId = validate([
  param('articleId')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail(),
]);

const checkParamCommentId = validate([
  param('commentId')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail(),
]);

const isAuthorized = asyncHandler(async (req, res, next) => {
  try {
    const userIdPayload = req.userId;

    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    const owner = await comment.getUser();

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

module.exports = {
  createCommentBodyValidation,
  updateCommentBodyValidation,
  checkParamArticleId,
  checkParamCommentId,
  isAuthorized,
};
