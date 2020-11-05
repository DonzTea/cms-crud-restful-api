const express = require('express');

const authJwt = require('../middlewares/verifyJwtToken.js');
const userController = require('../controllers/userController.js');

const router = express.Router();

router
  .get('/user', [authJwt.verifyToken], userController.userContent)
  .get(
    '/pm',
    [authJwt.verifyToken, authJwt.isPmOrAdmin],
    userController.managementBoard,
  )
  .get(
    '/admin',
    [authJwt.verifyToken, authJwt.isAdmin],
    userController.adminBoard,
  );

module.exports = router;
