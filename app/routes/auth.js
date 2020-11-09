const express = require('express');

const userMiddleware = require('../middlewares/user.js');
const authMiddleware = require('../middlewares/auth.js');
const authController = require('../controllers/authContoller.js');

const router = express.Router();

router
  .post(
    '/signup',
    [
      authMiddleware.signupBodyValidation,
      userMiddleware.checkDuplicateUsernameOrEmail,
      userMiddleware.isRolesValid,
    ],
    authController.signup,
  )
  .post(
    '/signin',
    [authMiddleware.signinBodyValidation],
    authController.signin,
  );

module.exports = router;
