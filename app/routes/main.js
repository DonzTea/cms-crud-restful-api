module.exports = (app) => {
  // api docs
  const apiDocsRouter = require('../routes/apiDoc.js');
  app.use('/api-docs', apiDocsRouter);

  // apis
  const authRouter = require('../routes/auth.js');
  const articlesRouter = require('../routes/articles.js');
  const usersRouter = require('../routes/users.js');
  const adminRouter = require('../routes/admin.js');

  app.use('/api/auth', authRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);
};
