const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Article = db.article;

const readArticles = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findAll({
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
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

const createArticle = asyncHandler(async (req, res) => {
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

const updateArticle = asyncHandler(async (req, res) => {
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

const deleteArticle = asyncHandler(async (req, res) => {
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

const readComments = asyncHandler(async (req, res) => {
  try {
    const articleId = req.params.article_id;
    const article = await Article.findByPk(articleId, {
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
    });

    if (!article) {
      return res
        .status(404)
        .json({ message: `Article with id equals to ${articleId} not found` });
    }

    const comments = await article.getComments();

    return res.status(200).json({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  readArticles,
  readArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  readComments,
};
