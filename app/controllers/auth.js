const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const db = require('../config/db.js');
const config = require('../config/config.js');

const User = db.user;
const Role = db.role;

const signup = asyncHandler(async (req, res) => {
  try {
    const transport = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      },
    }));

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: 'Sending email using node.js',
      text: 'Thank you for registering!'
    };

    transport.sendMail(mailOptions, function (err, result) {
      if (err) {
        throw new Error(err);
      } else {
        transport.close();
      }
    });

    const password = await bcrypt.hash(req.body.password, 8);
    const [createdUser, userRole] = await Promise.all([
      User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password,
      }),
      Role.findOne({
        where: {
          name: 'USER',
        },
      }),
    ]);

    await createdUser.setRoles([userRole.id]);

    return res.status(201).json({
      message: 'Account successfully registered',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const signin = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (!user) {
      return res.status(404).json({
        auth: false,
        accessToken: null,
        reason: 'User not found',
      });
    }

    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!passwordIsValid) {
      return res.status(401).json({
        auth: false,
        accessToken: null,
        reason: 'Invalid password',
      });
    }

    const roles = await user
      .getRoles()
      .then((roles) => roles.map((role) => role.name));

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: '1 days',
    });

    return res.status(200).json({
      auth: true,
      type: 'Bearer',
      accessToken: token,
      roles,
      name: user.name,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  signup,
  signin,
};
