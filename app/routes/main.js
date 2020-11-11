module.exports = (app) => {
  const authRouter = require('../routes/auth.js');
  const pagesRouter = require('../routes/pages.js');
  const usersRouter = require('../routes/users.js');
  const articlesRouter = require('../routes/articles.js');
  const commentsRouter = require('../routes/comments.js');

  app.use('/api/auth', authRouter);
  app.use('/api/test', pagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/comments', commentsRouter);

  // api docs
  const apiDocsRouter = require('../routes/apiDoc.js');
  app.use('/api-docs', apiDocsRouter);
};
