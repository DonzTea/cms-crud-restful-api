module.exports = (sequelize, Sequelize, Actor, Movie) => {
  const ActorMovie = sequelize.define('actor_movies');
  return ActorMovie;
};
