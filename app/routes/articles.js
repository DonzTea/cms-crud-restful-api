const express = require('express');

const authJwt = require('../middlewares/verifyJwtToken.js');
const articleController = require('../controllers/articleController.js');
const authMiddleware = require('../middlewares/auth.js');
const articleMiddleware = require('../middlewares/article.js');
const userMiddleware = require('../middlewares/user.js');

const router = express.Router();

router
  .get('/', [authJwt.verifyToken], articleController.articles)
  .post(
    '/',
    [authJwt.verifyToken, articleMiddleware.createArticleBodyValidation],
    articleController.create,
  )
  .put(
    '/:id',
    [
      authJwt.verifyToken,
      authMiddleware.isAuthorized,
      articleMiddleware.updateArticleBodyValidation,
    ],
    articleController.update,
  )
  .delete(
    '/:id',
    [authJwt.verifyToken, authMiddleware.isAuthorized],
    articleController.destroy,
  )
  .get('/mine', [authJwt.verifyToken], articleController.mine)
  .get('/:id', [authJwt.verifyToken], articleController.detail);

module.exports = router;
