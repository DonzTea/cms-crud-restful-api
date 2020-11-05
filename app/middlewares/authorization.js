const asyncHandler = require('express-async-handler');

const db = require('../config/db.js');

const Article = db.article;

const isOwner = asyncHandler(async (req, res, next) => {
  try {
    const article = await Article.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: 'Not Found',
      });
    }

    if (req.userId !== article.userId) {
      return res.status(403).json({
        code: 403,
        message: 'Unauthorized',
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      auth: false,
      message: 'Fail to authentication. Error -> ' + error,
    });
  }
});

module.exports = {
  isOwner,
};
