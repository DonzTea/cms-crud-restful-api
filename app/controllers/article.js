const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Article = db.article;

const read = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findAll({
      attributes: ['id', 'title', 'content'],
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      description: 'All Article',
      article,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const create = asyncHandler(async (req, res) => {
  try {
    await Article.create({
      title: req.body.title,
      content: req.body.content,
      userId: req.userId,
    });

    return res.status(201).json({
      message: 'Article has been created',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const update = asyncHandler(async (req, res) => {
  try {
    await Article.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      message: 'Article has been updated',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const destroy = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await Article.destroy({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: 'Article has been deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const detail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id, {
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (article === null) {
      return res.status(400).json({ message: 'Not Found' });
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

const mine = asyncHandler(async (req, res) => {
  try {
    const userIdPayload = req.userId;
    const user = await User.findByPk(userIdPayload);
    const articles = await user.getArticles().then((articles) =>
      articles.map((article) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })),
    );
    return res.status(200).json({ articles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  read,
  create,
  update,
  destroy,
  detail,
  mine,
};
