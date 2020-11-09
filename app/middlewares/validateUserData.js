const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');
const config = require('../config/config.js');

const ROLES = config.ROLES;

const User = db.user;

const checkDuplicateUsernameOrEmail = asyncHandler(async (req, res, next) => {
  try {
    const errors = [];

    if (req.body.username) {
      // * check if username is already taken
      const userWithSameUsername = await User.findOne({
        where: {
          username: req.body.username,
        },
      });
      console.log('userWithSameUsername: ' + userWithSameUsername);

      if (userWithSameUsername) {
        errors.push('Fail -> Username is already taken!');
      }
    }

    if (req.body.email) {
      // * check if email is already in use
      const userWithSameEmail = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      console.log('userWithSameEmail ' + userWithSameEmail);
      if (userWithSameEmail) {
        errors.push('Fail -> Email is already in use!');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const checkRolesExisted = asyncHandler(async (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i].toUpperCase())) {
        return res
          .status(400)
          .send('Fail -> Does not exist Role = ' + req.body.roles[i]);
      }
    }
  }
  next();
});

const signUpVerify = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
};

module.exports = signUpVerify;
