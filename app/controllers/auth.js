const path = require('path');
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
  try {
    return res.sendFile(path.resolve(__dirname + '/../client/public/views/forgot-password.html'));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const renderResetPassword = (req, res) => {
  try {
    return res.sendFile(path.resolve(__dirname + '/../client/public/views/reset-password.html'));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    crypto.randomBytes(20, async function (err, buffer) {
      const token = buffer.toString('hex');
      const [result] = await User.update({ reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { where: { id: user.id } });
      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }

      const protocol = req.protocol;
      const host = req.headers.host;
      const data = {
        from: process.env.EMAIL,
        to: user.email,
        template: 'forgot-password',
        subject: 'Password help has arrived!',
        context: {
          url: `${protocol}://${host}/api/auth/reset-password?token=${token}`,
          name: user.name
        }
      };

      transport.sendMail(data, function (err) {
        if (!err) {
          return res.status(200).json({ message: 'Kindly check your email for further instructions' });
        } else {
          console.log(err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { newPassword, verifyPassword, token } = req.body;
    if (newPassword === verifyPassword) {
      const password = await bcrypt.hash(newPassword, 8);
      const [originalUserData, result] = await Promise.all([
        User.findOne({
          where: {
            reset_password_token: token,
            reset_password_expires: {
              [Op.gt]: Date.now()
            }
          }
        }), User.update({
          password,
          reset_password_token: null,
          reset_password_expires: null
        }, {
          where: {
            reset_password_token: token,
            reset_password_expires: {
              [Op.gt]: Date.now()
            }
          }
        })
      ]);

      if (!originalUserData) {
        return res.status(404).send({
          message: 'User not found.'
        });
      }

      if (!result) {
        return res.status(400).send({
          message: 'Password reset token is invalid or has expired.'
        });
      }

      const data = {
        from: process.env.EMAIL,
        to: originalUserData.email,
        template: 'reset-password',
        subject: 'Password Reset Confirmation',
        context: {
          name: originalUserData.name
        }
      };

      transport.sendMail(data, function (err) {
        if (!err) {
          return res.status(200).json({ message: 'Password successfully updated' });
        } else {
          console.error(error);
          return res.status(500).json({ message: 'Error while sending email' });
        }
      });
    } else {
      return res.status(422).send({
        message: 'Password confirmation does not match'
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
