const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

function generateLinkingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const Student = sequelize.define(
  'Student',
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true },
    grade: { type: DataTypes.STRING(80), allowNull: true },
    guardian_name: { type: DataTypes.STRING(150), allowNull: true },
    guardian_phone: { type: DataTypes.STRING(20), allowNull: true },
    linking_code: { type: DataTypes.STRING(8), unique: true, allowNull: true },
  },
  {
    tableName: 'students',
    hooks: {
      beforeCreate: (student) => {
        if (!student.linking_code) {
          student.linking_code = generateLinkingCode();
        }
      },
    },
  },
);

module.exports = Student;
