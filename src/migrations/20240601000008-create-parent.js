'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure parent role exists
    const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = 'parent';`);
    if (roles.length === 0) {
      await queryInterface.bulkInsert('roles', [{
        name: 'parent',
        label: 'Parent',
        description: 'Parent/Guardian who monitors students',
        created_at: new Date(),
        updated_at: new Date(),
      }], {});
    }

    await queryInterface.createTable('parents', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      full_name: { type: Sequelize.STRING(150), allowNull: false },
      phone: { type: Sequelize.STRING(20), unique: true, allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: true },
      relation_type: { type: Sequelize.ENUM('أب', 'أم', 'وصي', 'غيره'), allowNull: false, defaultValue: 'أب' },
      notification_preference: { type: Sequelize.ENUM('sms', 'whatsapp', 'email'), allowNull: false, defaultValue: 'whatsapp' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('parents', ['user_id']);
    await queryInterface.addIndex('parents', ['phone']);

    await queryInterface.createTable('student_parents', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      student_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'students', key: 'user_id' }, onDelete: 'CASCADE' },
      parent_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'parents', key: 'id' }, onDelete: 'CASCADE' },
      relationship: { type: Sequelize.ENUM('أب', 'أم', 'وصي'), allowNull: false, defaultValue: 'أب' },
      is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('student_parents', ['student_id', 'parent_id'], { unique: true, name: 'student_parent_uniq' });
    await queryInterface.addIndex('student_parents', ['parent_id']);

    await queryInterface.addColumn('students', 'linking_code', {
      type: Sequelize.STRING(8),
      unique: true,
      allowNull: true,
    });
    await queryInterface.addIndex('students', ['linking_code'], { name: 'students_linking_code' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('students', 'students_linking_code');
    await queryInterface.removeColumn('students', 'linking_code');
    await queryInterface.removeIndex('student_parents', 'student_parent_uniq');
    await queryInterface.removeIndex('student_parents', ['parent_id']);
    await queryInterface.removeIndex('parents', ['user_id']);
    await queryInterface.removeIndex('parents', ['phone']);
    await queryInterface.dropTable('student_parents');
    await queryInterface.dropTable('parents');
  },
};
