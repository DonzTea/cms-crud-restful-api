const express = require('express');

const router = express.Router();

const authJwt = require('../middlewares/verifyJwtToken.js');
const movieController = require('../controllers/movieController.js');

router
  .get('/', [authJwt.verifyToken], movieController.read)
  .post('/', [authJwt.verifyToken], movieController.create);

module.exports = router;
