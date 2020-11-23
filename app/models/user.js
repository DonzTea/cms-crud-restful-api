const sequelizePaginate = require('sequelize-paginate')

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('users', {
    name: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    avatar: {
      type: Sequelize.STRING,
    },
    reset_password_token: {
      type: Sequelize.STRING,
    },
    reset_password_expires: {
      type: Sequelize.DATE,
    },
  });
  sequelizePaginate.paginate(User);

  return User;
};
