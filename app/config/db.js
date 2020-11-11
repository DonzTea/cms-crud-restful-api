const { Sequelize } = require('sequelize');

// * set database environment
const host = process.env.HOST;
const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

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
