const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role, Parent, StudentParent, Student, Wallet, Transaction, ExamAttempt, Session, SessionEnrollment, SessionAttendance } = require('../../models');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const ROLES = require('../../utils/roles');

class ParentService {
  async register({ fullName, phone, password, email, relationType, notificationPreference, studentCode }) {
    const phoneClean = (phone || '').replace(/\s|-/g, '');
    if (!/^01[0-9]{9}$/.test(phoneClean)) {
      throw new ApiError(422, 'رقم الهاتف غير صحيح');
    }

    const emailValue = email || `parent_${phoneClean}@parent.ta3lem.app`;

    const emailExists = await User.findOne({ where: { email: emailValue } });
    if (emailExists) throw new ApiError(409, 'البريد الإلكتروني مسجل بالفعل');

    const phoneExists = await User.findOne({ where: { phone: phoneClean } });
    if (phoneExists) throw new ApiError(409, 'رقم الهاتف مسجل بالفعل');

    const roleRow = await Role.findOne({ where: { name: ROLES.PARENT } });
    if (!roleRow) throw new ApiError(400, 'Invalid role');

    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    const user = await User.create({
      name: fullName.trim(),
      email: emailValue,
      phone: phoneClean,
      password_hash: passwordHash,
      role_id: roleRow.id,
      status: 'active',
    });

    const parent = await Parent.create({
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phoneClean,
      email: emailValue,
      relation_type: relationType || 'أب',
      notification_preference: notificationPreference || 'whatsapp',
    });

    if (studentCode) {
      const student = await Student.findOne({ where: { linking_code: studentCode } });
      if (student) {
        await StudentParent.create({
          student_id: student.user_id,
          parent_id: parent.id,
          relationship: relationType === 'أم' ? 'أم' : 'أب',
          is_primary: true,
        });
      }
    }

    return { user, parent };
  }

  async getDashboard(parentId) {
    const parent = await Parent.findByPk(parentId);
    if (!parent) throw new ApiError(404, 'Parent not found');

    const links = await StudentParent.findAll({
      where: { parent_id: parentId },
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', include: [{ model: Wallet, as: 'wallet' }] }],
      }],
    });

    const students = await Promise.all(links.map(async (link) => {
      const studentUserId = link.student_id;

      const recentGrades = await ExamAttempt.findAll({
        where: { user_id: studentUserId, status: 'graded' },
        order: [['created_at', 'DESC']],
        limit: 5,
      });

      const enrollments = await SessionEnrollment.findAll({
        where: { user_id: studentUserId },
        include: [{
          model: Session,
          as: 'session',
          where: { scheduled_at: { [Op.gt]: new Date() }, status: 'scheduled' },
          required: false,
        }],
        limit: 5,
      });

      return {
        student: link.student,
        user: link.student.user,
        relationship: link.relationship,
        isPrimary: link.is_primary,
        recentGrades,
        upcomingSessions: enrollments.filter((e) => e.session).map((e) => e.session),
        wallet: link.student.user?.wallet,
      };
    }));

    return { parent, students };
  }

  async linkStudent(parentId, studentCode) {
    const parent = await Parent.findByPk(parentId);
    if (!parent) throw new ApiError(404, 'Parent not found');

    const student = await Student.findOne({ where: { linking_code: studentCode } });
    if (!student) throw new ApiError(404, 'الطالب غير موجود. رمز الربط غير صحيح');

    const existing = await StudentParent.findOne({
      where: { student_id: student.user_id, parent_id: parentId },
    });
    if (existing) throw new ApiError(409, 'هذا الطالب مرتبط بالفعل بحسابك');

    const link = await StudentParent.create({
      student_id: student.user_id,
      parent_id: parentId,
      relationship: parent.relation_type === 'أم' ? 'أم' : 'أب',
      is_primary: true,
    });

    const studentUser = await User.findByPk(student.user_id);

    return { link, student: { ...student.get(), user: studentUser } };
  }

  async getStudentReport(parentId, studentId) {
    const parent = await Parent.findByPk(parentId);
    if (!parent) throw new ApiError(404, 'Parent not found');

    const link = await StudentParent.findOne({
      where: { parent_id: parentId, student_id: studentId },
    });
    if (!link) throw new ApiError(403, 'هذا الطالب غير مرتبط بحسابك');

    const student = await Student.findByPk(studentId, {
      include: [{ model: User, as: 'user' }],
    });
    if (!student) throw new ApiError(404, 'Student not found');

    const grades = await ExamAttempt.findAll({
      where: { user_id: studentId },
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    const attendance = await SessionAttendance.findAll({
      where: { user_id: studentId },
      include: [{ model: Session, as: 'session' }],
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    const enrollments = await SessionEnrollment.findAll({
      where: { user_id: studentId },
      include: [{ model: Session, as: 'session' }],
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    return { student, grades, attendance, sessions: enrollments.map((e) => e.session) };
  }

  async getPayments(parentId) {
    const parent = await Parent.findByPk(parentId);
    if (!parent) throw new ApiError(404, 'Parent not found');

    const links = await StudentParent.findAll({
      where: { parent_id: parentId },
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', include: [{ model: Wallet, as: 'wallet' }] }],
      }],
    });

    const payments = await Promise.all(links.map(async (link) => {
      const wallet = link.student.user?.wallet;
      if (!wallet) return { student: { ...link.student.get(), user: link.student.user }, transactions: [] };

      const transactions = await Transaction.findAll({
        where: { wallet_id: wallet.id },
        order: [['created_at', 'DESC']],
        limit: 50,
      });

      return {
        student: { ...link.student.get(), user: link.student.user },
        wallet,
        transactions,
      };
    }));

    return payments;
  }
}

module.exports = new ParentService();
