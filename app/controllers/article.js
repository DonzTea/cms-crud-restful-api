const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Article = db.article;
const Comment = db.comment;

const readArticles = asyncHandler(async (req, res) => {
  try {
    const { page, paginate } = req.query;
    const paginationOptions = {
      page: page || 1,
      paginate: paginate || 20,
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
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
    const { page, paginate } = req.query;

    const article = await Article.findByPk(articleId);
    if (!article) {
      return res
        .status(404)
        .json({ message: `Article with id equals to ${articleId} not found` });
    }

    const commentIds = await article.getComments().then(comments => comments.map(comment => comment.id));

    if (!commentIds) {
      const result = {
        description: 'Article\'s Comments',
        page,
        comments: [],
        totalPages: 0,
        totalData: 0
      };

      return res.status(200).json(result);
    }

    const paginationOptions = {
      page: page || 1,
      paginate: paginate || 20,
      where: {
        id: commentIds
      },
      attributes: ['id', 'content', 'createdAt', 'updatedAt'],
      order: [
        ['createdAt', 'DESC']
      ],
    }
    const { docs, pages, total } = await Comment.paginate(paginationOptions);

    if (page > pages) {
      return res.status(400).json({
        message: `requested page exceeding ${pages} (total pages)`
      });
    }

    const result = {
      description: 'Article\'s Comments',
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

module.exports = {
  readArticles,
  readArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  readComments,
};
