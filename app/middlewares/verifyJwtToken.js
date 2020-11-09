const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const db = require('../config/db.js');
const config = require('../config/config.js');

const User = db.user;

const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
      // remove Bearer from string
      token = token.slice(7, token.length);
    }

    if (!token) {
      return res.status(403).send({
        auth: false,
        message: 'No token provided.',
      });
    }

    const decoded = jwt.verify(token, config.secret);

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      auth: false,
      message: 'Fail to authentication. Error -> ' + error,
    });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name.toUpperCase() === 'ADMIN') {
        return next();
      }
    }

    return res.status(403).send('Require Admin Role!');
  } catch (error) {
    console.error(error);
    return res
      .send(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const isPmOrAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      console.log(roles[i].name);
      if (
        roles[i].name.toUpperCase() === 'PM' ||
        roles[i].name.toUpperCase() === 'ADMIN'
      ) {
        return next();
      }
    }

    return res.status(403).send('Require PM or Admin Roles!');
  } catch (error) {
    console.error(error);
    return res
      .send(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const authJwt = {
  verifyToken,
  isAdmin,
  isPmOrAdmin,
};

module.exports = authJwt;
