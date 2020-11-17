const express = require('express');

const authMiddleware = require('../middlewares/auth.js');
const globalMiddleware = require('../middlewares/global.js');
const userMiddleware = require('../middlewares/user.js');
const articleMiddleware = require('../middlewares/article.js');
const commentMiddleware = require('../middlewares/comment.js');
const userController = require('../controllers/user.js');

const router = express.Router();

// only user role allowed
router.use([authMiddleware.verifyToken, authMiddleware.isUser]);

router
  .get('/', userController.readProfile)
  .put(
    '/',
    [
      userMiddleware.uploadAvatar,
      userMiddleware.validateAvatarFile,
      userMiddleware.validateAvatarMimetype,
      globalMiddleware.isRequestBodyAnObject,
      userMiddleware.bodyOptional,
      userMiddleware.checkDuplicateAccount,
    ],
    userController.updateProfile,
  )
  .get(
    '/:user_id/articles',
    [userMiddleware.isParamUserIdExists],
    userController.readUserArticles,
  )
  .get(
    '/:user_id/comments',
    [authMiddleware.isProfileOwner, userMiddleware.isParamUserIdExists],
    userController.readUserComments,
  )
  .post(
    '/comments/:article_id',
    [
      articleMiddleware.isParamArticleIdExists,
      globalMiddleware.isRequestBodyAnObject,
      commentMiddleware.bodyRequired,
    ],
    userController.createComment,
  )
  .delete(
    '/comments/:comment_id',
    [authMiddleware.isCommentOwner, commentMiddleware.isParamCommentIdExists],
    userController.deleteComment,
  );

module.exports = router;
