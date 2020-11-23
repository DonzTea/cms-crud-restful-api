const sequelizePaginate = require('sequelize-paginate')

module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define('comments', {
    content: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  sequelizePaginate.paginate(Comment);

  return Comment;
};
