const ROLES = require('../utils/roles');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { name: ROLES.SUPER_ADMIN, label: 'Super Admin', description: 'Full system access', created_at: now, updated_at: now },
      { name: ROLES.PLATFORM_ADMIN, label: 'Platform Admin', description: 'Platform management', created_at: now, updated_at: now },
      { name: ROLES.TEACHERS_SUPERVISOR, label: 'Teachers Supervisor', description: 'Approve & monitor teachers', created_at: now, updated_at: now },
      { name: ROLES.STUDENT_SUPERVISOR, label: 'Student Supervisor', description: 'Monitor students & attendance', created_at: now, updated_at: now },
      { name: ROLES.TEACHER, label: 'Teacher', description: 'Conduct live classes', created_at: now, updated_at: now },
      { name: ROLES.STUDENT, label: 'Student', description: 'Attend classes', created_at: now, updated_at: now },
    ], {});

    const permissions = [
      ['users.manage', 'Manage users', 'users'],
      ['teachers.approve', 'Approve teachers', 'teachers'],
      ['teachers.evaluate', 'Evaluate teachers', 'teachers'],
      ['students.monitor', 'Monitor students', 'students'],
      ['sessions.manage', 'Manage sessions', 'sessions'],
      ['sessions.create', 'Create sessions', 'sessions'],
      ['sessions.join', 'Join sessions', 'sessions'],
      ['wallet.charge', 'Charge wallet', 'wallet'],
      ['wallet.manage', 'Manage all wallets', 'wallet'],
      ['subjects.manage', 'Manage subjects', 'subjects'],
      ['exams.manage', 'Manage exams', 'exams'],
      ['exams.take', 'Take exams', 'exams'],
      ['homework.grade', 'Grade homework', 'homework'],
      ['reports.view', 'View reports', 'reports'],
      ['whatsapp.send', 'Send WhatsApp', 'whatsapp'],
      ['pricing.manage', 'Manage pricing', 'pricing'],
      ['notifications.manage', 'Manage notifications', 'notifications'],
    ].map(([name, label, group]) => ({ name, label, group, created_at: now, updated_at: now }));

    await queryInterface.bulkInsert('permissions', permissions, {});

    // map role -> permission groups (broad grants for MVP)
    const [roles] = await queryInterface.sequelize.query(`SELECT id, name FROM roles;`);
    const [perms] = await queryInterface.sequelize.query(`SELECT id, name FROM permissions;`);
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    const permMap = Object.fromEntries(perms.map((p) => [p.name, p.id]));

    const grants = {
      [ROLES.SUPER_ADMIN]: permissions.map((p) => p.name),
      [ROLES.PLATFORM_ADMIN]: permissions.map((p) => p.name),
      [ROLES.TEACHERS_SUPERVISOR]: ['teachers.approve', 'teachers.evaluate', 'sessions.manage', 'reports.view', 'whatsapp.send'],
      [ROLES.STUDENT_SUPERVISOR]: ['students.monitor', 'reports.view', 'whatsapp.send', 'notifications.manage'],
      [ROLES.TEACHER]: ['sessions.create', 'exams.manage', 'homework.grade', 'whatsapp.send'],
      [ROLES.STUDENT]: ['sessions.join', 'exams.take', 'wallet.charge'],
    };

    const rows = [];
    for (const [roleName, permNames] of Object.entries(grants)) {
      for (const pn of permNames) {
        rows.push({ role_id: roleMap[roleName], permission_id: permMap[pn] });
      }
    }
    await queryInterface.bulkInsert('role_permissions', rows, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
