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
      authMiddleware.isAuthorizedForUpdate,
      articleMiddleware.updateArticleBodyValidation,
    ],
    articleController.update,
  )
  .delete(
    '/:id',
    [authJwt.verifyToken, authMiddleware.isAuthorizedForDelete],
    articleController.destroy,
  )
  .get('/mine', [authJwt.verifyToken], articleController.mine)
  .get('/:id', [authJwt.verifyToken], articleController.detail)
  .post(
    '/find-or-create',
    [authJwt.verifyToken, userMiddleware.isAdmin],
    articleController.findOrCreate,
  );

module.exports = router;
