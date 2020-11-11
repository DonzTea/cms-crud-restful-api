const express = require('express');

const commentController = require('../controllers/comment.js');
const authMiddleware = require('../middlewares/auth.js');
const commentMiddleware = require('../middlewares/comment.js');

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
    ],
    commentController.create,
  )
  .put(
    '/:commentId',
    [
      authMiddleware.verifyToken,
      commentMiddleware.isAuthorized,
      commentMiddleware.checkParamCommentId,
      commentMiddleware.updateCommentBodyValidation,
    ],
    commentController.update,
  )
  .delete(
    '/:commentId',
    [
      authMiddleware.verifyToken,
      commentMiddleware.isAuthorized,
      commentMiddleware.checkParamCommentId,
    ],
    commentController.destroy,
  );

module.exports = router;
