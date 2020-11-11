module.exports = (app) => {
  const authRouter = require('../routes/auth.js');
  const pagesRouter = require('../routes/pages.js');
  const usersRouter = require('../routes/users.js');
  const articlesRouter = require('../routes/articles.js');

  app.use('/api/auth', authRouter);
  app.use('/api/test', pagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/articles', articlesRouter);

  // custom routers
  const moviesRouter = require('../routes/movies.js');
  const actorsRouter = require('../routes/actors.js');

  app.use('/api/movies', moviesRouter);
  app.use('/api/actors', actorsRouter);

  // api docs
  const apiDocsRouter = require('../routes/apiDoc.js');
  app.use('/api-docs', apiDocsRouter);
};
