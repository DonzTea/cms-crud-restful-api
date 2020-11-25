const express = require('express');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });
const parseForm = express.urlencoded({ extended: false });

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
  .get(
    '/forgot-password',
    [csrfProtection],
    authController.renderForgotPassword,
  )
  .post(
    '/forgot-password',
    [globalMiddleware.isRequestBodyAnObject, parseForm, csrfProtection],
    authController.forgotPassword,
  )
  .get('/reset-password', [csrfProtection], authController.renderResetPassword)
  .post(
    '/reset-password',
    [
      globalMiddleware.isRequestBodyAnObject,
      authMiddleware.resetPassword,
      parseForm,
      csrfProtection,
    ],
    authController.resetPassword,
  );

module.exports = router;
