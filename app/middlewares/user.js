const multer = require('multer');

const { body, param } = require('express-validator');
const asyncHandler = require('express-async-handler');

const { validate } = require('../utils/middleware.js');

const User = require('../config/db.js').user;

const isUser = asyncHandler(async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      const roles = await user
        .getRoles()
        .then((roles) => roles.map((role) => role.name));

      if (roles.includes('USER')) {
        return next();
      }
    }

    return res.status(403).json({
      message: 'You are not user, access denied',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isTargetSuperadmin = (req, res, next) => {
  if (req.params.user_id === 1) {
    return res
      .status(400)
      .json({ message: 'You are not allowed to modify superadmin' });
  }

  next();
};

const bodyRequired = validate([
  body('name')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string'),
  body('username')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isAlphanumeric()
    .withMessage('is containing illegal character')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('email')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isEmail()
    .withMessage('is not an email')
    .normalizeEmail(),
  body('password')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 8 })
    .withMessage('is expected to be at least 8 characters long'),
]);

const bodyOptional = validate([
  body('name')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('username')
    .optional()
    .isString()
    .trim()
    .withMessage('is not a string')
    .isAlphanumeric()
    .withMessage('is containing illegal character')
    .isLength({ min: 4, max: 30 })
    .withMessage('is expected to be 4 to 30 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('is not an email')
    .normalizeEmail(),
]);

const checkDuplicateAccount = asyncHandler(async (req, res, next) => {
  try {
    const { username, email } = req.body;

    const errors = [];
    if (username) {
      // * check if username is already taken
      const userWithSameUsername = await User.findOne({
        where: {
          username: username,
        },
      });

      if (userWithSameUsername) {
        errors.push('Username is already taken!');
      }
    }

    if (email) {
      // * check if email is already in use
      const userWithSameEmail = await User.findOne({
        where: {
          email: email,
        },
      });

      if (userWithSameEmail) {
        errors.push('Email is already in use!');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Duplicate account found',
        errors,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const isParamUserIdExists = validate([
  param('user_id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('is not exists')
    .bail(),
]);

const isCurentUserAnOwner = asyncHandler(async (req, res, next) => {
  try {
    if (req.userId) {
      const userId = req.params.user_id;
      const targetAccount = await User.findByPk(userId);
      if (targetAccount.id === req.userId) {
        return next();
      } else {
        return res.status(403).json({
          message: 'You are not account owner, access denied',
        });
      }
    }

    return res.status(401).json({
      message: 'Authorization failed',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const uploadAvatar = (req, res, next) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage }).single('avatar');
  upload(req, res, (err) => {
    if (err) {
      console.error(error);
      return res.status(500).json({ message: err.message });
    }
    next();
  });
};

const validateAvatarFile = (req, res, next) => {
  if (req.file) {
    const { mimetype } = req.file;
    if (mimetype.startsWith('image')) {
      return next();
    }
    return res.status(400).json({ message: 'File is not an image file.' });
  } else {
    return res.status(400).json({
      message: 'Cannot read mimetype of uploaded file.',
    });
  }
};

const validateAvatarMimetype = (req, res, next) => {
  if (req.file) {
    const { mimetype } = req.file;
    const allowedMimetypes = ['image/jpeg', 'image/png'];
    if (allowedMimetypes.includes(mimetype)) {
      return next();
    }
  }
  return res.status(400).json({
    message: 'Only .jpeg and .png image files are allowed.',
  });
};

module.exports = {
  isUser,
  isTargetSuperadmin,
  bodyRequired,
  bodyOptional,
  checkDuplicateAccount,
  isParamUserIdExists,
  isCurentUserAnOwner,
  uploadAvatar,
  validateAvatarFile,
  validateAvatarMimetype,
};
