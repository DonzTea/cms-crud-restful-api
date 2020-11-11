const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Role = db.role;

const user = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ['name', 'username', 'email'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: {
            attributes: ['userId', 'roleId'],
          },
        },
      ],
    });

    return res.status(200).json({
      description: 'User Content Page',
      user,
    });
  } catch (error) {
    console.error(error);
    return res.json(500).json({ message: 'Internal Server Error' });
  }
});

const admin = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ['name', 'username', 'email'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: {
            attributes: ['userId', 'roleId'],
          },
        },
      ],
    });

    return res.status(200).json({
      description: 'Admin Board',
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const pm = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ['name', 'username', 'email'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: {
            attributes: ['userId', 'roleId'],
          },
        },
      ],
    });

    return res.status(200).json({
      description: 'Management Board',
      user,
    });
  } catch (error) {
    console.error(error);
    return res.json(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  user,
  admin,
  pm,
};
