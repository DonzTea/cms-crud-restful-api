const express = require('express');

const userMiddleware = require('../middlewares/user.js');
const authMiddleware = require('../middlewares/auth.js');
const authController = require('../controllers/auth.js');

const router = express.Router();

router
  .post(
    '/signup',
    [
      authMiddleware.signupBodyValidation,
      userMiddleware.checkDuplicateUsernameOrEmail,
    ],
    authController.signup,
  )
  .post(
    '/signin',
    [authMiddleware.signinBodyValidation],
    authController.signin,
  );

module.exports = router;
