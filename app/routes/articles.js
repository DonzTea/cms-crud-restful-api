const express = require('express');

const articleController = require('../controllers/article.js');
const authMiddleware = require('../middlewares/auth.js');
const globalMiddleware = require('../middlewares/global.js');
const articleMiddleware = require('../middlewares/article.js');

const router = express.Router();

router
  .get('/', [globalMiddleware.paginationQuery], articleController.readArticles)
  .get(
    '/:article_id',
    [articleMiddleware.isParamArticleIdExists],
    articleController.readArticle,
  )
  .post(
    '/',
    [
      authMiddleware.verifyToken,
      authMiddleware.isUser,
      globalMiddleware.isRequestBodyAnObject,
      articleMiddleware.bodyRequired,
    ],
    articleController.createArticle,
  )
  .put(
    '/:article_id',
    [
      authMiddleware.verifyToken,
      authMiddleware.isArticleOwner,
      globalMiddleware.isRequestBodyAnObject,
      articleMiddleware.isParamArticleIdExists,
      articleMiddleware.bodyOptional,
    ],
    articleController.updateArticle,
  )
  .delete(
    '/:article_id',
    [
      authMiddleware.verifyToken,
      authMiddleware.isArticleOwner,
      articleMiddleware.isParamArticleIdExists,
    ],
    articleController.deleteArticle,
  )
  .get(
    '/:article_id/comments',
    [
      authMiddleware.verifyToken,
      authMiddleware.isUser,
      articleMiddleware.isParamArticleIdExists,
      globalMiddleware.paginationQuery,
    ],
    articleController.readComments,
  );

module.exports = router;
