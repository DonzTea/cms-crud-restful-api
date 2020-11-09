const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const db = require('../config/db.js');

const { Op } = db.Sequelize;

const User = db.user;
const Role = db.role;

const users = asyncHandler(async (req, res) => {
  try {
    const user = await User.findAll({
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
      description: 'All User',
      user,
    });
  } catch (error) {
    console.error(error);
    return res
      .json(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const create = asyncHandler(async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 8);
    const createdUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password,
    });
    const roles = await Role.findAll({
      where: {
        name: {
          [Op.or]: req.body.roles,
        },
      },
    });

    await createdUser.setRoles(roles);

    return res.status(201).json({
      status: 201,
      message: 'User has been created',
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const update = asyncHandler(async (req, res) => {
  try {
    const updatedUserCandidate = req.body;
    if (updatedUserCandidate.password) {
      updatedUserCandidate.password = await bcrypt.hash(
        updatedUserCandidate.password,
        8,
      );
    }

    await User.update(updatedUserCandidate, {
      where: {
        id: req.params.id,
      },
    });

    if (updatedUserCandidate.roles) {
      const [user, roles] = await Promise.all([
        User.findOne({
          where: {
            id: req.params.id,
          },
        }),
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }),
      ]);
      await user.setRoles(roles);
    }

    return res.status(200).json({
      status: 200,
      message: 'User has been updated',
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const destroy = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await User.destroy({
      where: {
        id,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'User has been deleted',
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const detail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(400)
        .json({ error: { code: 400, message: 'Not Found' } });
    }

    const roles = await user
      .getRoles()
      .then((roles) => roles.map((role) => ({ id: role.id, name: role.name })));

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const self = asyncHandler(async (req, res) => {
  try {
    const id = req.userId;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(400)
        .json({ error: { code: 400, message: 'Not Found' } });
    }

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const findOrCreate = asyncHandler(async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(
      req.body.password || '12345678',
      8,
    );

    if (req.body.password) req.body.password = hashedPassword;

    const [user, created] = await User.findOrCreate({
      where: req.body,
      defaults: req.body,
    });

    if (created) {
      await user.setRoles(req.body.roles || [1]);

      return res.status(201).json({
        status: 201,
        message: 'User has been created',
      });
    }

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const userContent = asyncHandler(async (req, res) => {
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
    return res
      .json(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const adminBoard = asyncHandler(async (req, res) => {
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
    return res
      .json(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const managementBoard = asyncHandler(async (req, res) => {
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
    return res
      .json(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

module.exports = {
  users,
  create,
  update,
  destroy,
  detail,
  self,
  findOrCreate,
  userContent,
  adminBoard,
  managementBoard,
};
