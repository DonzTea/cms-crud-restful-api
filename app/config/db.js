// require('dotenv').config();

const { Sequelize } = require('sequelize');

const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const sequelize = new Sequelize(database, username, password, {
  host: 'localhost',
  dialect: 'postgres',
});

const user = require('../models/user.js')(sequelize, Sequelize);
const role = require('../models/role.js')(sequelize, Sequelize);
const article = require('../models/article.js')(sequelize, Sequelize);

// custom models
const Actor = require('../models/actor.js')(sequelize, Sequelize);
const Movie = require('../models/movie.js')(sequelize, Sequelize);
const ActorMovie = require('../models/actorMovie.js')(
  sequelize,
  Sequelize,
  Actor,
  Movie,
);

const db = {
  Sequelize,
  sequelize,
  user,
  role,
  article,
  Movie,
  Actor,
};

db.role.belongsToMany(db.user, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId',
});
db.user.belongsToMany(db.role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
});
db.user.hasMany(db.article);
db.article.belongsTo(db.user);

// custom relationship
db.Movie.belongsToMany(Actor, { through: ActorMovie });
db.Actor.belongsToMany(Movie, { through: ActorMovie });

module.exports = db;
