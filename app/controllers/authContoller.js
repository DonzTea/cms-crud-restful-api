const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../config/db.js');
const config = require('../config/config.js');

const User = db.user;
const Role = db.role;

const { Op } = db.Sequelize;

const signup = asyncHandler(async (req, res) => {
  // save user to database
  console.log('Processing func -> signup');

  try {
    const password = await bcrypt.hash(req.body.password, 8);
    const user = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password,
    });

    if (req.body.roles && req.body.roles.length > 0) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      });

      await user.setRoles(roles);
    } else {
      await user.setRoles([1]);
    }

    return res.status(201).send({
      status: 'User registered successfully!',
    });
  } catch (error) {
    console.error(error);
    return res
      .send(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const signin = asyncHandler(async (req, res) => {
  console.log('Sign-In');

  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (!user) {
      return res.status(404).send({
        auth: false,
        accessToken: null,
        reason: 'User Not Found!',
      });
    }

    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!passwordIsValid) {
      return res.status(401).send({
        auth: false,
        accessToken: null,
        reason: 'Invalid Password!',
      });
    }

    const roles = await user
      .getRoles()
      .then((roles) => roles.map((role) => role.name));

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: '1 days',
    });
    return res.status(200).send({
      auth: true,
      type: 'Bearer',
      accessToken: token,
      roles,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

module.exports = {
  signup,
  signin,
};
