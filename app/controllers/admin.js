const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const db = require('../config/db.js');

const User = db.user;
const Role = db.role;
const Article = db.article;
const Comment = db.comment;

const readUsers = asyncHandler(async (req, res) => {
  try {
    const { page, paginate } = req.query;

    const paginationOptions = {
      page: page || 1,
      paginate: paginate || 20,
      attributes: ['id', 'name', 'username', 'email'],
      order: [
        ['name', 'ASC']
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: {
            attributes: ['userId', 'roleId'],
          },
        },
      ],
    }
    const { docs, pages, total } = await User.paginate(paginationOptions);

    if (page > pages) {
      return res.status(400).json({
        message: `requested page exceeding ${pages} (total pages)`
      });
    }

    const result = {
      description: 'Users',
      page,
      users: docs,
      totalPages: pages,
      totalData: total
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.json(500).json({ message: 'Internal Server Error' });
  }
});

const readUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id equals to ${userId} not found` });
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
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      reset_password_token: user.reset_password_token,
      reset_password_expires: user.reset_password_expires,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
      articles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const createUser = asyncHandler(async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 8);
    await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password,
    });

    return res.status(201).json({
      message: 'User has been created',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const targetUserId = req.params.user_id;
    const targetUser = await User.findOne({
      where: {
        id: targetUserId,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: `User with id equals to ${targetUserId} is not found`,
      });
    }

    await User.update(req.body, {
      where: {
        id: targetUserId,
      },
    });

    return res.status(200).json({
      message: 'User has been updated',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    const result = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `User with id equals to ${userId} not found` });
    }

    return res.status(200).json({
      message: 'User has been deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const readArticles = asyncHandler(async (req, res) => {
  try {
    const { page, paginate } = req.query;

    const paginationOptions = {
      page: page || 1,
      paginate: paginate || 20,
      attributes: ['id', 'title', 'content'],
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    }
    const { docs, pages, total } = await Article.paginate(paginationOptions);

    if (page > pages) {
      return res.status(400).json({
        message: `requested page exceeding ${pages} (total pages)`
      });
    }

    const result = {
      description: 'Articles',
      page,
      articles: docs,
      totalPages: pages,
      totalData: total
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const readArticle = asyncHandler(async (req, res) => {
  try {
    const articleId = req.params.article_id;
    const article = await Article.findByPk(articleId, {
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!article) {
      return res
        .status(404)
        .json({ message: `Article with id equals to ${articleId} not found` });
    }

    return res.status(200).json({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: article.user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deleteArticle = asyncHandler(async (req, res) => {
  try {
    const articleId = req.params.article_id;
    const result = await Article.destroy({
      where: {
        id: articleId,
      },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `Article with id equals to ${articleId} not found` });
    }

    return res.status(200).json({
      message: 'Article has been deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const readComments = asyncHandler(async (req, res) => {
  try {
    const { page, paginate } = req.query;

    const paginationOptions = {
      page: page || 1,
      paginate: paginate || 20,
      attributes: ['id', 'content'],
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: Article,
          attributes: ['id'],
        },
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    }
    const { docs, pages, total } = await Comment.paginate(paginationOptions);

    if (page > pages) {
      return res.status(400).json({
        message: `requested page exceeding ${pages} (total pages)`
      });
    }

    const result = {
      description: 'Articles',
      page,
      comments: docs,
      totalPages: pages,
      totalData: total
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params.comment_id;
    const result = await Comment.destroy({ where: { id: commentId } });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `Comment with id equals to ${commentId} not found` });
    }

    return res.status(200).json({
      message: `Comment with id equals to ${commentId} was successfully deleted`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  readUsers,
  readUser,
  createUser,
  updateUser,
  deleteUser,
  readArticles,
  readArticle,
  deleteArticle,
  readComments,
  deleteComment,
};
