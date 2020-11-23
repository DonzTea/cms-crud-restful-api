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
      authMiddleware.signupBodyRequired,
      userMiddleware.checkDuplicateAccount,
    ],
    authController.signup,
  )
  .post(
    '/signin',
    [globalMiddleware.isRequestBodyAnObject, authMiddleware.signinBodyRequired],
    authController.signin,
  )
  .get('/forgot-password', authController.renderForgotPassword)
  .post('/forgot-password', [globalMiddleware.isRequestBodyAnObject], authController.forgotPassword)
  .get('/reset-password', authController.renderResetPassword)
  .post('/reset-password', [globalMiddleware.isRequestBodyAnObject, authMiddleware.resetPassword], authController.resetPassword);

module.exports = router;
