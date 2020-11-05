module.exports = (sequelize, Sequelize) => {
  const Actor = sequelize.define('actors', {
    name: Sequelize.STRING,
  });

  return Actor;
};
