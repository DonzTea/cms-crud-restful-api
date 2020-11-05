module.exports = (sequelize, Sequelize) => {
  const Movie = sequelize.define('movies', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
  });

  return Movie;
};
