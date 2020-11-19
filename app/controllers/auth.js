const path = require('path');
const async = require('async');
const crypto = require('crypto');

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const hbs = require('nodemailer-express-handlebars');
const { Op } = require("sequelize");

const db = require('../config/db.js');
const config = require('../config/config.js');

const User = db.user;
const Role = db.role;

const transport = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
}));

const handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve(__dirname + '/../client/public/templates/'),
  extName: '.html'
};

transport.use('compile', hbs(handlebarsOptions));

const signup = asyncHandler(async (req, res) => {
  try {
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
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const renderForgotPassword = (req, res) => {
  return res.sendFile(path.resolve(__dirname + '/../client/public/templates/forgot-password.html'));
};

const renderResetPassword = (req, res) => {
  return res.sendFile(path.resolve(__dirname + '/../client/public/templates/reset-password.html'));
};

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    async.waterfall([
      async function (done) {
        try {
          const user = await User.findOne({
            where: { email }
          });

          if (user) {
            done(null, user);
          } else {
            done('User not found.', null);
          }
        } catch (error) {
          console.error(error);
          done(err, null)
        }
      },
      function (user, done) {
        // create the random token
        crypto.randomBytes(20, function (err, buffer) {
          const token = buffer.toString('hex');
          done(err, user, token);
        });
      },
      async function (user, token, done) {
        await User.update({ reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { where: { id: user.id } });
        const updatedUser = await User.findOne({ where: { id: user.id } });

        if (updatedUser) {
          done(null, token, updatedUser);
        } else {
          done('Updated user not found.', token, null);
        }
      },
      function (token, user, done) {
        const data = {
          from: process.env.EMAIL,
          to: user.email,
          template: 'forgot-password-email',
          subject: 'Password help has arrived!',
          context: {
            url: 'http://localhost:3000/auth/reset-password?token=' + token,
            name: user.name
          }
        };

        transport.sendMail(data, function (err) {
          if (!err) {
            return res.status(200).json({ message: 'Kindly check your email for further instructions' });
          } else {
            return done(err);
          }
        });
      }
    ], function (err) {
      return res.status(422).json({ message: err });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { token, newPassword, verifyPassword } = req.body;
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: {
        [Op.gt]: Date.now()
      }
    })

    if (user) {
      if (newPassword === verifyPassword) {
        user.hash_password = await bcrypt.hash(newPassword, 8);
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        user.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: err
            });
          } else {
            const data = {
              from: process.env.EMAIL,
              to: user.email,
              template: 'reset-password-email',
              subject: 'Password Reset Confirmation',
              context: {
                name: user.name
              }
            };

            transport.sendMail(data, function (err) {
              if (!err) {
                return res.status(200).json({ message: 'Password reset' });
              } else {
                return done(err);
              }
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'Passwords do not match'
        });
      }
    } else {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.'
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  signup,
  signin,
  renderForgotPassword,
  forgotPassword,
  renderResetPassword,
  resetPassword
};
