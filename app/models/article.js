const sequelizePaginate = require('sequelize-paginate')

module.exports = (sequelize, Sequelize) => {
  const Article = sequelize.define('articles', {
    title: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
    },
  });
  sequelizePaginate.paginate(Article);

  return Article;
};
