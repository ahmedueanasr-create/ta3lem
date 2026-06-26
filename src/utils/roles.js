/**
 * Centralised role constants used across RBAC.
 * Keep in sync with DB seeders.
 */
module.exports = {
  SUPER_ADMIN: 'super_admin',
  PLATFORM_ADMIN: 'platform_admin',
  TEACHERS_SUPERVISOR: 'teachers_supervisor',
  STUDENT_SUPERVISOR: 'student_supervisor',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',

  all: [
    'super_admin',
    'platform_admin',
    'teachers_supervisor',
    'student_supervisor',
    'teacher',
    'student',
    'parent',
  ],
};
