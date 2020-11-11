const bcrypt = require('bcryptjs');

const db = require('../config/db.js');

const User = db.user;
const Role = db.role;

async function initial() {
  try {
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 8);
    const [admin, adminRole] = await Promise.all([
      User.create({
        name: 'admin',
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
      }),
      Role.create({
        name: 'ADMIN',
      }),
      Role.create({
        name: 'PM',
      }),
      Role.create({
        name: 'USER',
      }),
    ]);

    await admin.setRoles([adminRole.id]);
  } catch (error) {
    console.error(error);
  }
}

module.exports = () => {
  // force: true will drop the table if it already exists(comment this part after first run, to disable migration)
  db.sequelize.sync({ force: true }).then(async () => {
    await initial();
  });
};
