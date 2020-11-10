const db = require('../config/db.js');

const Role = db.role;

function initial() {
  Role.create({
    id: 1,
    name: 'USER',
  });

  Role.create({
    id: 2,
    name: 'ADMIN',
  });

  Role.create({
    id: 3,
    name: 'PM',
  });
}

module.exports = () => {
  // force: true will drop the table if it already exists(comment this part after first run, to disable migration)
  db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync with { force: true }');
    initial();
  });
};
