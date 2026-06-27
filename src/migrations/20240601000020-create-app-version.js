'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('app_versions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      version_code: { type: Sequelize.INTEGER, allowNull: false },
      version_name: { type: Sequelize.STRING(50), allowNull: false },
      file_path: { type: Sequelize.STRING(255), allowNull: false },
      file_size: { type: Sequelize.BIGINT, allowNull: true },
      release_notes: { type: Sequelize.TEXT, allowNull: true },
      is_force_update: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('app_versions');
  },
};
