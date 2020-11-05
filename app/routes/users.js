const express = require('express');

const validateUserData = require('../middlewares/validateUserData.js');
const authJwt = require('../middlewares/verifyJwtToken.js');
const userController = require('../controllers/userController.js');

const router = express.Router();

router
  .get('/', [authJwt.verifyToken], userController.users)
  .post(
    '/',
    [
      authJwt.verifyToken,
      validateUserData.checkDuplicateUsernameOrEmail,
      validateUserData.checkRolesExisted,
    ],
    userController.create,
  )
  .put(
    '/:id',
    [
      authJwt.verifyToken,
      validateUserData.checkDuplicateUsernameOrEmail,
      validateUserData.checkRolesExisted,
    ],
    userController.update,
  )
  .delete('/:id', [authJwt.verifyToken], userController.destroy)
  .get('/:id', [authJwt.verifyToken], userController.detail)
  .post(
    '/find-or-create',
    [authJwt.verifyToken, validateUserData.checkRolesExisted],
    userController.findOrCreate,
  );

module.exports = router;
