const express = require('express');

const articleController = require('../controllers/article.js');
const authMiddleware = require('../middlewares/auth.js');
const articleMiddleware = require('../middlewares/article.js');

const router = express.Router();

router
  .get('/', articleController.read)
  .post(
    '/',
    [authMiddleware.verifyToken, articleMiddleware.createArticleBodyValidation],
    articleController.create,
  )
  .put(
    '/:id',
    [
      authMiddleware.verifyToken,
      articleMiddleware.isAuthorized,
      articleMiddleware.updateArticleBodyValidation,
    ],
    articleController.update,
  )
  .delete(
    '/:id',
    [authMiddleware.verifyToken, articleMiddleware.isAuthorized],
    articleController.destroy,
  )
  .get('/mine', [authMiddleware.verifyToken], articleController.mine)
  .get('/:id', articleController.detail);

module.exports = router;
