const express = require('express');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const authJwt = require('../middlewares/verifyJwtToken.js');
const actorController = require('../controllers/actorController.js');

router
  .get('/', [authJwt.verifyToken], actorController.read)
  .post('/', [authJwt.verifyToken], actorController.create);

module.exports = router;
