module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_tokens', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false },
      token: { type: Sequelize.STRING(500), allowNull: false },
      platform: { type: Sequelize.ENUM('android', 'ios', 'web'), allowNull: false, defaultValue: 'android' },
      device_name: { type: Sequelize.STRING(200), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('device_tokens', ['user_id']);
    await queryInterface.addIndex('device_tokens', ['token'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('device_tokens');
  },
};
