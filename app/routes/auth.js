const express = require('express');

const globalMiddleware = require('../middlewares/global.js');
const userMiddleware = require('../middlewares/user.js');
const authMiddleware = require('../middlewares/auth.js');
const authController = require('../controllers/auth.js');

const router = express.Router();

router
  .post(
    '/signup',
    [
      globalMiddleware.isRequestBodyAnObject,
      authMiddleware.signupBodyValidation,
      userMiddleware.checkDuplicateUsernameOrEmail,
    ],
    authController.signup,
  )
  .post(
    '/signin',
    [
      globalMiddleware.isRequestBodyAnObject,
      authMiddleware.signinBodyValidation,
    ],
    authController.signin,
  );

module.exports = router;
