const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Article = db.article;

const articles = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findAll({
      attributes: ['title', 'content'],
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
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
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
      status: 201,
      message: 'Article has been created',
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
    await Article.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Article has been updated',
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

    await Article.destroy({
      where: {
        id,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Article has been deleted',
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
      return res
        .status(400)
        .json({ error: { code: 400, message: 'Not Found' } });
    }

    return res.status(200).json({ data: article });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const findOrCreate = asyncHandler(async (req, res) => {
  try {
    const [article, created] = await Article.findOrCreate({
      where: req.body,
      defaults: req.body,
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (created) {
      return res.status(201).json({
        status: 201,
        message: 'Article has been created',
      });
    }

    return res.status(200).json({
      data: article,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

module.exports = {
  articles,
  create,
  update,
  destroy,
  detail,
  findOrCreate,
};
