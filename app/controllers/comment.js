const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const Comment = db.comment;
const Article = db.article;

const read = asyncHandler(async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findByPk(articleId);
    const comments = await article.getComments();

    return res.status(200).json({
      comments,
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
    const { articleId } = req.params;
    const { content } = req.body;

    const [comment, article] = await Promise.all([
      Comment.create({ content }),
      Article.findByPk(articleId),
    ]);

    if (!article) {
      return res.status(404).json({
        error: {
          code: 404,
          message: `Article with id equals to ${articleId} is not found`,
        },
      });
    }

    await Promise.all([
      comment.setArticle(article),
      comment.setUser(req.userId),
    ]);
    return res.status(201).json({
      comment,
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
    const { commentId } = req.params;
    const { content } = req.body;

    await Comment.update({ content }, { where: { id: commentId } });

    return res.status(200).json({
      message: `Comment with id equals to ${comment.id} was successfully updated`,
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
    const { commentId } = req.params;
    await Comment.destroy({ where: { id: commentId } });
    return res.status(200).json({
      message: `Comment with id equals to ${comment.id} was successfully deleted`,
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
};
