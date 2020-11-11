const express = require('express');

const userMiddleware = require('../middlewares/user.js');
const authMiddleware = require('../middlewares/auth.js');
const userController = require('../controllers/user.js');

const router = express.Router();

router
  .get('/', userController.read)
  .post(
    '/',
    [
      authMiddleware.verifyToken,
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
      authMiddleware.verifyToken,
      userMiddleware.checkParamIdExistence,
      userMiddleware.updateUserBodyValidation,
      userMiddleware.isAuthorized,
      userMiddleware.checkDuplicateUsernameOrEmail,
      userMiddleware.isRolesValid,
    ],
    userController.update,
  )
  .delete(
    '/:id',
    [
      authMiddleware.verifyToken,
      userMiddleware.checkParamIdExistence,
      userMiddleware.isAuthorized,
    ],
    userController.destroy,
  )
  .get('/self', [authMiddleware.verifyToken], userController.self)
  .get('/:id', [userMiddleware.checkParamIdExistence], userController.detail);

module.exports = router;
