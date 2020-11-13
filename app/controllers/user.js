const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const User = db.user;
const Comment = db.comment;
const Article = db.article;

const readProfile = asyncHandler(async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id equals to ${userId} not found` });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { userId } = req;

    await User.update(req.body, {
      where: {
        id: userId,
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

const readUserArticles = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id equals to ${req.userId} not found` });
    }

    const articles = await user.getArticles();
    return res.status(200).json({
      articles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const readUserComments = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id equals to ${req.userId} not found` });
    }

    const comments = await user.getComments();
    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const createComment = asyncHandler(async (req, res) => {
  try {
    const articleId = req.params.article_id;
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res
        .status(404)
        .json({ message: `Article with id equals to ${articleId} not found` });
    }

    const comment = await Comment.create({
      content: req.body.content,
    });

    await Promise.all([
      comment.setUser(req.userId),
      comment.setArticle(article.id),
    ]);

    return res.status(200).json({
      comment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params.comment_id;

    const result = await Comment.destroy({
      where: { id: commentId },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `Comment with id equals to ${commentId} not found` });
    }

    return res.status(200).json({
      message: 'Comment has been deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  readProfile,
  updateProfile,
  readUserArticles,
  readUserComments,
  createComment,
  deleteComment,
};
