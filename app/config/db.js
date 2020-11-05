const { Sequelize } = require('sequelize');

let host, database, username, password;

if (process.env.NODE_ENV) {
  host = 'ec2-34-232-24-202.compute-1.amazonaws.com';
  database = 'd4pgn5qsm6n3k3';
  username = 'lqqjgtaypmqxlb';
  password = '51653a84ea072c61b22b6df1580a9585243f9af5b2ea00adbc7465907d480385';
} else {
  require('dotenv').config();

  host = process.env.HOST;
  database = process.env.DATABASE;
  username = process.env.USERNAME;
  password = process.env.PASSWORD;
}

const sequelize = new Sequelize(database, username, password, {
  host: host,
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
