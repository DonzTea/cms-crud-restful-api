const express = require('express');

const validateUserData = require('../middlewares/validateUserData.js');
const authController = require('../controllers/authContoller.js');

const router = express.Router();

router
  .post(
    '/signup',
    [
      validateUserData.checkDuplicateUsernameOrEmail,
      validateUserData.checkRolesExisted,
    ],
    authController.signup,
  )
  .post('/signin', authController.signin);

module.exports = router;
