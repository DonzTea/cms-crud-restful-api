const express = require('express');

const articleController = require('../controllers/article.js');
const authMiddleware = require('../middlewares/auth.js');
const globalMiddleware = require('../middlewares/global.js');
const articleMiddleware = require('../middlewares/article.js');

const router = express.Router();

router
  .get('/', articleController.read)
  .post(
    '/',
    [
      authMiddleware.verifyToken,
      globalMiddleware.isRequestBodyAnObject,
      articleMiddleware.createArticleBodyValidation,
    ],
    articleController.create,
  )
  .put(
    '/:id',
    [
      authMiddleware.verifyToken,
      articleMiddleware.isAuthorized,
      globalMiddleware.isRequestBodyAnObject,
      articleMiddleware.checkParamIdExistence,
      articleMiddleware.updateArticleBodyValidation,
    ],
    articleController.update,
  )
  .delete(
    '/:id',
    [
      authMiddleware.verifyToken,
      articleMiddleware.isAuthorized,
      articleMiddleware.checkParamIdExistence,
    ],
    articleController.destroy,
  )
  .get('/mine', [authMiddleware.verifyToken], articleController.mine)
  .get(
    '/:id',
    [articleMiddleware.checkParamIdExistence],
    articleController.detail,
  );

module.exports = router;
