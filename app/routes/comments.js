const express = require('express');

const commentController = require('../controllers/comment.js');
const authMiddleware = require('../middlewares/auth.js');
const commentMiddleware = require('../middlewares/comment.js');
const globalMiddleware = require('../middlewares/global.js');

const router = express.Router();

router
  .get(
    '/:articleId',
    [commentMiddleware.checkParamArticleId],
    commentController.read,
  )
  .post(
    '/:articleId',
    [
      authMiddleware.verifyToken,
      commentMiddleware.checkParamArticleId,
      commentMiddleware.createCommentBodyValidation,
      globalMiddleware.isRequestBodyAnObject,
    ],
    commentController.create,
  )
  .put(
    '/:commentId',
    [
      authMiddleware.verifyToken,
      commentMiddleware.isAuthorized,
      commentMiddleware.checkParamCommentId,
      globalMiddleware.isRequestBodyAnObject,
      commentMiddleware.updateCommentBodyValidation,
    ],
    commentController.update,
  )
  .delete(
    '/:commentId',
    [
      authMiddleware.verifyToken,
      authMiddleware.isAdmin,
      commentMiddleware.checkParamCommentId,
    ],
    commentController.destroy,
  );

module.exports = router;
