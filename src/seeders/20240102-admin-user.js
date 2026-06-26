const bcrypt = require('bcryptjs');
const ROLES = require('../utils/roles');

module.exports = {
  async up(queryInterface) {
    const [[role]] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name='${ROLES.SUPER_ADMIN}' LIMIT 1;`,
    );
    if (!role) throw new Error('Super admin role missing. Run roles seeder first.');

    const password_hash = await bcrypt.hash('Admin@12345', 12);
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        uuid: require('uuid').v4(),
        name: 'Platform Super Admin',
        email: 'admin@ta3lem.local',
        phone: '201000000000',
        password_hash,
        role_id: role.id,
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: now,
        updated_at: now,
      },
    ], {});

    const [[user]] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email='admin@ta3lem.local' LIMIT 1;`,
    );
    await queryInterface.bulkInsert('wallets', [
      { user_id: user.id, balance: 0, currency: 'EGP', created_at: now, updated_at: now },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('wallets', { user_id: { [require('sequelize').Op]: null } }, {});
    await queryInterface.bulkDelete('users', { email: 'admin@ta3lem.local' }, {});
  },
};
