const express = require('express');

const authJwt = require('../middlewares/verifyJwtToken.js');
const articleController = require('../controllers/articleController.js');
const authorizationMiddleware = require('../middlewares/authorization.js');

const router = express.Router();

router
  .get('/', [authJwt.verifyToken], articleController.articles)
  .post('/', [authJwt.verifyToken], articleController.create)
  .put(
    '/:id',
    [authJwt.verifyToken, authorizationMiddleware.isOwner],
    articleController.update,
  )
  .delete(
    '/:id',
    [authJwt.verifyToken, authorizationMiddleware.isOwner],
    articleController.destroy,
  )
  .get('/:id', [authJwt.verifyToken], articleController.detail)
  .post(
    '/find-or-create',
    [authJwt.verifyToken],
    articleController.findOrCreate,
  );

module.exports = router;
