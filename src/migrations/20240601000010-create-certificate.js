'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificates', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      attempt_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'exam_attempts', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'students', key: 'user_id' }, onDelete: 'CASCADE' },
      certificate_number: { type: Sequelize.STRING(30), unique: true, allowNull: false },
      verification_code: { type: Sequelize.UUID, unique: true, allowNull: false, defaultValue: Sequelize.literal('(UUID())') },
      title: { type: Sequelize.STRING(255), allowNull: false },
      student_name: { type: Sequelize.STRING(150), allowNull: false },
      subject: { type: Sequelize.STRING(100), allowNull: false },
      score: { type: Sequelize.DECIMAL(5,2), allowNull: false },
      total: { type: Sequelize.DECIMAL(5,2), allowNull: false },
      grade: { type: Sequelize.ENUM('ممتاز','جيد جدا','جيد','مقبول'), allowNull: false },
      issue_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('certificates', ['verification_code']);
    await queryInterface.addIndex('certificates', ['student_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('certificates');
  }
};
