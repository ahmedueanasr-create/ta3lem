const sequelize = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Student = require('./Student');
const Teacher = require('./Teacher');
const TeacherPricing = require('./TeacherPricing');
const Supervisor = require('./Supervisor');
const Subject = require('./Subject');
const Course = require('./Course');
const Session = require('./Session');
const SessionEnrollment = require('./SessionEnrollment');
const SessionAttendance = require('./SessionAttendance');
const SessionRecording = require('./SessionRecording');
const Notification = require('./Notification');
const WhatsAppMessage = require('./WhatsAppMessage');
const Exam = require('./Exam');
const Question = require('./Question');
const ExamAttempt = require('./ExamAttempt');
const ExamAnswer = require('./ExamAnswer');
const Homework = require('./Homework');
const HomeworkSubmission = require('./HomeworkSubmission');
const File = require('./File');
const AuditLog = require('./AuditLog');
const Parent = require('./Parent');
const StudentParent = require('./StudentParent');
const Certificate = require('./Certificate');
const SessionBan = require('./SessionBan');
const SessionReport = require('./SessionReport');

// ── RBAC ─────────────────────────────────────────────────────
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// ── Profile entities ─────────────────────────────────────────
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });

Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacher' });
Teacher.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

TeacherPricing.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Teacher.hasOne(TeacherPricing, { foreignKey: 'teacher_id', as: 'pricing' });

Supervisor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Supervisor, { foreignKey: 'user_id', as: 'supervisor' });

// ── Wallet ───────────────────────────────────────────────────
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });

// ── Subjects / Courses / Sessions ────────────────────────────
Course.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Course.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Teacher.hasMany(Course, { foreignKey: 'teacher_id', as: 'courses' });
Subject.hasMany(Course, { foreignKey: 'subject_id', as: 'courses' });

Session.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Session.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Session.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Teacher.hasMany(Session, { foreignKey: 'teacher_id', as: 'sessions' });
Subject.hasMany(Session, { foreignKey: 'subject_id', as: 'sessions' });

SessionEnrollment.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
SessionEnrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Session.hasMany(SessionEnrollment, { foreignKey: 'session_id', as: 'enrollments' });
User.hasMany(SessionEnrollment, { foreignKey: 'user_id', as: 'enrollments' });

SessionAttendance.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
SessionAttendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Session.hasMany(SessionAttendance, { foreignKey: 'session_id', as: 'attendance' });
User.hasMany(SessionAttendance, { foreignKey: 'user_id', as: 'attendance' });

SessionRecording.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Session.hasMany(SessionRecording, { foreignKey: 'session_id', as: 'recordings' });

SessionBan.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
SessionBan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Session.hasMany(SessionBan, { foreignKey: 'session_id', as: 'bans' });

SessionReport.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
SessionReport.belongsTo(User, { foreignKey: 'user_id', as: 'reporter' });
Session.hasMany(SessionReport, { foreignKey: 'session_id', as: 'reports' });

// ── Notifications / WhatsApp ─────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// ── Exams ────────────────────────────────────────────────────
Exam.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Exam.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Question.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
Exam.hasMany(Question, { foreignKey: 'exam_id', as: 'questions' });

ExamAttempt.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
ExamAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Exam.hasMany(ExamAttempt, { foreignKey: 'exam_id', as: 'attempts' });
User.hasMany(ExamAttempt, { foreignKey: 'user_id', as: 'examAttempts' });

ExamAnswer.belongsTo(ExamAttempt, { foreignKey: 'attempt_id', as: 'attempt' });
ExamAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
ExamAttempt.hasMany(ExamAnswer, { foreignKey: 'attempt_id', as: 'answers' });

// ── Certificates ──────────────────────────────────────────────
Certificate.belongsTo(ExamAttempt, { foreignKey: 'attempt_id', as: 'attempt' });
ExamAttempt.hasOne(Certificate, { foreignKey: 'attempt_id', as: 'certificate' });
Certificate.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Student.hasMany(Certificate, { foreignKey: 'student_id', as: 'certificates' });

// ── Homework ─────────────────────────────────────────────────
Homework.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Homework.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homework_id', as: 'homework' });
HomeworkSubmission.belongsTo(User, { foreignKey: 'user_id', as: 'student' });
HomeworkSubmission.belongsTo(File, { foreignKey: 'file_id', as: 'file' });
Homework.hasMany(HomeworkSubmission, { foreignKey: 'homework_id', as: 'submissions' });

// ── Parent / StudentParent ──────────────────────────────────
Parent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Parent, { foreignKey: 'user_id', as: 'parent' });

Parent.belongsToMany(Student, {
  through: StudentParent,
  foreignKey: 'parent_id',
  otherKey: 'student_id',
  as: 'students',
});
Student.belongsToMany(Parent, {
  through: StudentParent,
  foreignKey: 'student_id',
  otherKey: 'parent_id',
  as: 'parents',
});

StudentParent.belongsTo(Student, { foreignKey: 'student_id', targetKey: 'user_id', as: 'student' });
StudentParent.belongsTo(Parent, { foreignKey: 'parent_id', as: 'parent' });
Student.hasMany(StudentParent, { foreignKey: 'student_id', sourceKey: 'user_id', as: 'parentLinks' });
Parent.hasMany(StudentParent, { foreignKey: 'parent_id', as: 'studentLinks' });

// ── Files / Audit ────────────────────────────────────────────
File.belongsTo(User, { foreignKey: 'uploader_id', as: 'uploader' });
User.hasMany(File, { foreignKey: 'uploader_id', as: 'files' });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Wallet,
  Transaction,
  Student,
  Teacher,
  TeacherPricing,
  Supervisor,
  Subject,
  Course,
  Session,
  SessionEnrollment,
  SessionAttendance,
  SessionRecording,
  Notification,
  WhatsAppMessage,
  Exam,
  Question,
  ExamAttempt,
  ExamAnswer,
  Homework,
  HomeworkSubmission,
  File,
  AuditLog,
  Parent,
  StudentParent,
  Certificate,
  SessionBan,
  SessionReport,
};
