const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const db = require('../config/db.js');

const { Op } = db.Sequelize;

const User = db.user;
const Role = db.role;

const read = asyncHandler(async (req, res) => {
  try {
    const user = await User.findAll({
      attributes: ['id', 'name', 'username', 'email'],
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
      data: {
        description: 'All User',
        user,
      },
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

    if (req.body.roles && req.body.roles.length > 0) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      });

      await createdUser.setRoles(roles);
    } else {
      const userRole = await Role.findOne({
        where: {
          name: 'USER',
        },
      });

      await createdUser.setRoles([userRole.id]);
    }

    return res.status(201).json({
      data: 'User has been created',
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
    const [currentUser, targetUser] = await Promise.all([
      User.findOne({
        where: {
          id: req.userId,
        },
      }),
      User.findOne({
        where: {
          id: req.params.id,
        },
      }),
    ]);

    const currentUserRoles = await currentUser
      .getRoles()
      .then((roles) => roles.map((role) => role.name));

    if (
      currentUserRoles &&
      currentUserRoles.length > 0 &&
      currentUserRoles.includes('ADMIN')
    ) {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 8);
      }

      if (req.body.roles && req.body.roles.length > 0) {
        const [targetUserRoles] = await Promise.all([
          Role.findAll({
            where: {
              name: {
                [Op.or]: req.body.roles,
              },
            },
          }),
          User.update(req.body, {
            where: {
              id: req.params.id,
            },
          }),
        ]);
        await targetUser.setRoles(targetUserRoles);
      } else {
        const targetUserRole = await Role.findOne({
          where: {
            name: 'USER',
          },
        });
        await targetUser.setRoles([targetUserRole.id]);
      }
    } else {
      return res.status(403).json({
        error: {
          code: 403,
          message:
            "You're not able to update role, only admin and owner are authorized",
        },
      });
    }

    return res.status(200).json({
      data: 'User has been updated',
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
      data: 'User has been deleted',
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

    const [roles, articles] = await Promise.all([
      user
        .getRoles()
        .then((roles) =>
          roles.map((role) => ({ id: role.id, name: role.name })),
        ),
      user.getArticles(),
    ]);

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles,
        articles,
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

    const [roles, articles] = await Promise.all([
      user
        .getRoles()
        .then((roles) =>
          roles.map((role) => ({ id: role.id, name: role.name })),
        ),
      user.getArticles(),
    ]);

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles,
        articles,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

module.exports = {
  read,
  create,
  update,
  destroy,
  detail,
  self,
};
