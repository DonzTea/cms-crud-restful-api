const express = require('express');

const authMiddleware = require('../middlewares/auth.js');
const pageController = require('../controllers/page.js');

const router = express.Router();

router
  .get('/user', [authMiddleware.verifyToken], pageController.user)
  .get(
    '/pm',
    [authMiddleware.verifyToken, authMiddleware.isPmOrAdmin],
    pageController.pm,
  )
  .get(
    '/admin',
    [authMiddleware.verifyToken, authMiddleware.isAdmin],
    pageController.admin,
  );

module.exports = router;
