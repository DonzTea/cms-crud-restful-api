const express = require('express');

const authMiddleware = require('../middlewares/auth.js');
const userMiddleware = require('../middlewares/user.js');
const articleMiddleware = require('../middlewares/article.js');
const commentMiddleware = require('../middlewares/comment.js');
const globalMiddleware = require('../middlewares/global.js');
const adminController = require('../controllers/admin.js');

const router = express.Router();

// only admin role allowed
router.use([authMiddleware.verifyToken, authMiddleware.isAdmin]);

router
  .get('/users', [globalMiddleware.paginationQuery], adminController.readUsers)
  .get(
    '/users/:user_id',
    [userMiddleware.isParamUserIdExists],
    adminController.readUser,
  )
  .post(
    '/users',
    [
      globalMiddleware.isRequestBodyAnObject,
      userMiddleware.bodyRequired,
      userMiddleware.checkDuplicateAccount,
    ],
    adminController.createUser,
  )
  .put(
    '/users/:user_id',
    [
      userMiddleware.isParamUserIdExists,
      userMiddleware.isTargetSuperadmin,
      globalMiddleware.isRequestBodyAnObject,
      userMiddleware.bodyOptional,
      userMiddleware.checkDuplicateAccount,
    ],
    adminController.updateUser,
  )
  .delete(
    '/users/:user_id',
    [userMiddleware.isParamUserIdExists, userMiddleware.isTargetSuperadmin],
    adminController.deleteUser,
  )
  .get('/articles', [globalMiddleware.paginationQuery], adminController.readArticles)
  .get(
    '/articles/:article_id',
    [articleMiddleware.isParamArticleIdExists],
    adminController.readArticle,
  )
  .delete(
    '/articles/:article_id',
    [articleMiddleware.isParamArticleIdExists],
    adminController.deleteArticle,
  )
  .get('/comments', [globalMiddleware.paginationQuery], adminController.readComments)
  .delete(
    '/comments/:comment_id',
    [commentMiddleware.isParamCommentIdExists],
    adminController.deleteComment,
  );

module.exports = router;
