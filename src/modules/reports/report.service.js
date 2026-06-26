const { Sequelize, Op } = require('sequelize');
const {
  User, Session, SessionAttendance, SessionEnrollment, Wallet, Transaction,
  Teacher, Subject, Student,
} = require('../../models');

class ReportService {
  async platformStats() {
    const [users, teachers, students, sessions, revenue] = await Promise.all([
      User.count(),
      Teacher.count(),
      Student.count(),
      Session.count(),
      Transaction.sum('amount', { where: { type: 'charge' } }),
    ]);
    return { users, teachers, students, sessions, totalCharged: revenue || 0 };
  }

  async revenue({ from, to }) {
    const where = { type: 'deduct' };
    if (from && to) where.created_at = { [Op.between]: [from, to] };
    const rows = await Transaction.findAll({
      where,
      attributes: ['reason', [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
      group: ['reason'],
      order: [[Sequelize.literal('total'), 'DESC']],
      raw: true,
    });
    return rows;
  }

  async topSubjects() {
    return Session.findAll({
      attributes: ['subject_id', [Sequelize.fn('COUNT', Sequelize.col('Session.id')), 'sessions']],
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }],
      group: ['subject_id'],
      order: [[Sequelize.literal('sessions'), 'DESC']],
      limit: 10,
      raw: true,
    });
  }

  async teacherReport(teacherUserId) {
    const totalSessions = await Session.count({ where: { teacher_id: teacherUserId } });
    const totalStudents = await SessionEnrollment.count({
      distinct: true,
      col: 'user_id',
      include: [{ model: Session, as: 'session', where: { teacher_id: teacherUserId } }],
    });
    const sessions = await Session.findAll({ where: { teacher_id: teacherUserId }, attributes: ['id'] });
    const sessionIds = sessions.map(s => s.id);
    let earnings = 0;
    if (sessionIds.length) {
      earnings = await Transaction.sum('amount', {
        where: { type: 'deduct', reference_type: 'session', reference_id: sessionIds },
      });
    }
    return { totalSessions, totalStudents, earnings: earnings || 0 };
  }

  async studentReport(studentUserId) {
    const attended = await SessionAttendance.count({ where: { user_id: studentUserId, status: 'present' } });
    const absent = await SessionAttendance.count({ where: { user_id: studentUserId, status: 'absent' } });
    const wallet = await Wallet.findOne({ where: { user_id: studentUserId } });
    return {
      attended,
      absent,
      attendancePct: attended + absent > 0 ? Math.round((attended / (attended + absent)) * 100) : 0,
      balance: wallet ? parseFloat(wallet.balance) : 0,
    };
  }

  async studentAttendanceDetail(studentUserId, { limit, offset }) {
    const { rows, count } = await SessionAttendance.findAndCountAll({
      where: { user_id: studentUserId },
      include: [{ model: Session, as: 'session', include: [{ model: Subject, as: 'subject' }] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async sessionAttendanceReport(sessionId) {
    const { SessionAttendance, Session, User, Student } = require('../../models');
    const session = await Session.findByPk(sessionId);
    if (!session) return null;
    const records = await SessionAttendance.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: User,
          as: 'user',
          include: [{ model: Student, as: 'student' }],
        },
      ],
      order: [['joined_at', 'DESC']],
    });
    return { session, records };
  }

  async allStudentsSummary({ limit, offset }) {
    const { rows, count } = await Student.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash', 'refresh_jti'] } }],
      order: [['user_id', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async topTeachers() {
    return Teacher.findAll({
      attributes: [
        'user_id',
        'specialization',
        'rating',
        'total_sessions',
        [Sequelize.fn('COUNT', Sequelize.col('sessions.id')), 'session_count'],
      ],
      include: [{ model: Session, as: 'sessions', attributes: [] }],
      group: ['Teacher.user_id'],
      order: [[Sequelize.literal('session_count'), 'DESC']],
      limit: 10,
      raw: true,
    });
  }
}

module.exports = new ReportService();
