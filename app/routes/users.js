const express = require('express');

const userMiddleware = require('../middlewares/user.js');
const authMiddleware = require('../middlewares/auth.js');
const authJwt = require('../middlewares/verifyJwtToken.js');
const userController = require('../controllers/userController.js');

const router = express.Router();

router
  .get('/', [authJwt.verifyToken], userController.users)
  .post(
    '/',
    [
      authJwt.verifyToken,
      userMiddleware.isAdmin,
      userMiddleware.createUserBodyValidation,
      userMiddleware.checkDuplicateUsernameOrEmail,
      userMiddleware.isRolesValid,
    ],
    userController.create,
  )
  .put(
    '/:id',
    [
      authJwt.verifyToken,
      userMiddleware.checkParamIdExistence,
      userMiddleware.updateUserBodyValidation,
      authMiddleware.isAuthorized,
      userMiddleware.checkDuplicateUsernameOrEmail,
      userMiddleware.isRolesValid,
    ],
    userController.update,
  )
  .delete(
    '/:id',
    [
      authJwt.verifyToken,
      userMiddleware.checkParamIdExistence,
      authMiddleware.isAuthorized,
    ],
    userController.destroy,
  )
  .get('/self', [authJwt.verifyToken], userController.self)
  .get(
    '/:id',
    [authJwt.verifyToken, userMiddleware.checkParamIdExistence],
    userController.detail,
  );

module.exports = router;
