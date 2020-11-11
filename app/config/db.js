const { Sequelize } = require('sequelize');

// * determine database environment
let host, database, username, password;
if (process.env.NODE_ENV === 'production') {
  host = 'ec2-34-232-24-202.compute-1.amazonaws.com';
  database = 'd4pgn5qsm6n3k3';
  username = 'lqqjgtaypmqxlb';
  password = '51653a84ea072c61b22b6df1580a9585243f9af5b2ea00adbc7465907d480385';
} else {
  host = process.env.HOST;
  database = process.env.DATABASE;
  username = process.env.USERNAME;
  password = process.env.PASSWORD;
}

// * sequelize instance
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: 'postgres',
});

// * create models
const user = require('../models/user.js')(sequelize, Sequelize);
const role = require('../models/role.js')(sequelize, Sequelize);
const article = require('../models/article.js')(sequelize, Sequelize);
const comment = require('../models/comment.js')(sequelize, Sequelize);

// * models container
const db = {
  Sequelize,
  sequelize,
  user,
  role,
  article,
  comment,
};

// * models relationship
//  n user - n role
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
// 1 user - n article
db.user.hasMany(db.article);
db.article.belongsTo(db.user);
//  1 user - n comment
db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);
// 1 article - n comment
db.article.hasMany(db.comment);
db.comment.belongsTo(db.article);

module.exports = db;
