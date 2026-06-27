const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const { Session, SessionEnrollment, SessionAttendance, SessionRecording, SessionBan, SessionReport, User, Teacher, TeacherPricing, Subject, Course } = require('../../models');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const walletService = require('../wallet/wallet.service');
const notificationService = require('../notifications/notification.service');
const { getProvider } = require('../../providers');

class SessionService {
  async list({ filters, limit, offset, include }) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.teacher_id) where.teacher_id = filters.teacher_id;
    if (filters.subject_id) where.subject_id = filters.subject_id;
    const { rows, count } = await Session.findAndCountAll({
      where,
      include: include || [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: Subject, as: 'subject' },
      ],
      order: [['scheduled_at', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async getById(id) {
    const session = await Session.findByPk(id, {
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }, { model: TeacherPricing, as: 'pricing' }] },
        { model: Subject, as: 'subject' },
        { model: Course, as: 'course' },
        { model: SessionEnrollment, as: 'enrollments', include: [{ model: User, as: 'user' }] },
        { model: SessionAttendance, as: 'attendance' },
        { model: SessionRecording, as: 'recordings' },
      ],
    });
    if (!session) throw new ApiError(404, 'Session not found');
    return session;
  }

  async create(teacherUserId, dto) {
    const teacher = await Teacher.findOne({ where: { user_id: teacherUserId } });
    if (!teacher) throw new ApiError(403, 'Only teachers can create sessions');
    if (teacher.status !== 'approved') throw new ApiError(403, 'Teacher not approved');

    const roomName = `ta3lem-${uuidv4()}`;
    const session = await Session.create({
      teacher_id: teacher.user_id,
      subject_id: dto.subject_id,
      course_id: dto.course_id || null,
      title: dto.title,
      description: dto.description,
      scheduled_at: dto.scheduled_at,
      duration_min: dto.duration_min || 60,
      is_private: dto.is_private || false,
      price: dto.price ?? 0,
      room_name: roomName,
      recording_enabled: dto.recording_enabled !== false,
    });
    return session;
  }

  /**
   * Student joins a session:
   * 1. Check balance >= price
   * 2. Deduct + create enrollment
   * 3. Create attendance row
   * 4. Return live provider token
   */
  async join(studentUserId, sessionId) {
    const session = await this.getById(sessionId);
    if (session.status === 'cancelled' || session.status === 'ended') {
      throw new ApiError(400, 'Session is not joinable');
    }

    // idempotent enrollment
    let enrollment = await SessionEnrollment.findOne({
      where: { session_id: session.id, user_id: studentUserId },
    });

    if (!enrollment) {
      let transaction = null;
      if (parseFloat(session.price) > 0) {
        const wallet = await walletService.getBalance(studentUserId);
        if (parseFloat(wallet.balance) < parseFloat(session.price)) {
          throw new ApiError(402, 'Insufficient balance to join this session', {
            balance: parseFloat(wallet.balance),
            required: parseFloat(session.price),
          });
        }
        const deducted = await walletService.deduct(
          studentUserId,
          session.price,
          `Session: ${session.title}`,
          { type: 'session', id: session.id },
        );
        transaction = deducted.transaction;
      }

      enrollment = await SessionEnrollment.create({
        session_id: session.id,
        user_id: studentUserId,
        charged_amount: session.price,
        transaction_id: transaction ? transaction.id : null,
      });
    }

    // attendance row (idempotent upsert)
    let attendance = await SessionAttendance.findOne({
      where: { session_id: session.id, user_id: studentUserId },
    });
    if (!attendance) {
      attendance = await SessionAttendance.create({
        session_id: session.id,
        user_id: studentUserId,
        joined_at: new Date(),
        status: 'present',
      });
    } else if (!attendance.joined_at) {
      await attendance.update({ joined_at: new Date(), status: 'present' });
    }

    const provider = getProvider();
    const token = await provider.getToken(session.room_name, `student-${studentUserId}`, 'student');

    return { session, enrollment, attendance, token, roomName: session.room_name, livekitUrl: config.live.livekit.url };
  }

  async start(teacherUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.teacher_id !== teacherUserId) throw new ApiError(403, 'Not the session teacher');

    const provider = getProvider();
    await provider.createRoom({ name: session.room_name });

    let recording = null;
    if (session.recording_enabled) {
      const rec = await provider.startRecording(session.room_name);
      if (rec) {
        recording = await SessionRecording.create({
          session_id: session.id,
          status: 'recording',
        });
      }
    }

    await session.update({ status: 'live', started_at: new Date() });

    // notify enrolled students
    const enrollments = await SessionEnrollment.findAll({
      where: { session_id: session.id },
      include: [{ model: User, as: 'user' }],
    });
    for (const e of enrollments) {
      notificationService.notify({
        user: e.user,
        phone: e.user.phone,
        type: 'session_started',
        title: `بدأت الحصة: ${session.title}`,
        body: 'المدرس بدأ البث الآن، يمكنك الدخول.',
        data: { sessionId: session.id, room: session.room_name },
        channels: ['inapp', 'push', 'whatsapp'],
      });
    }

    const token = await provider.getToken(session.room_name, `teacher-${teacherUserId}`, 'teacher');
    return { session, recording, token, roomName: session.room_name, livekitUrl: config.live.livekit.url };
  }

  async end(teacherUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.teacher_id !== teacherUserId) throw new ApiError(403, 'Not the session teacher');

    // close attendance & compute durations
    const rows = await SessionAttendance.findAll({ where: { session_id: session.id, left_at: null } });
    for (const a of rows) {
      const leftAt = new Date();
      const dur = Math.round((leftAt - new Date(a.joined_at || leftAt)) / 1000);
      const pct = Math.min(100, Math.round((dur / (session.duration_min * 60)) * 100));
      await a.update({ left_at: leftAt, duration_sec: dur, attendance_pct: pct });
    }

    // finalize recording
    const recording = await SessionRecording.findOne({
      where: { session_id: session.id, status: 'recording' },
    });
    if (recording) {
      await recording.update({ status: 'processing' });
    }

    await session.update({ status: 'ended', ended_at: new Date() });

    // notify enrolled students about recording availability
    const enrollments = await SessionEnrollment.findAll({
      where: { session_id: session.id },
      include: [{ model: User, as: 'user' }],
    });
    for (const e of enrollments) {
      notificationService.notify({
        user: e.user,
        phone: e.user.phone,
        type: 'session_ended',
        title: `انتهت الحصة: ${session.title}`,
        body: 'التسجيل متاح للمشاهدة لاحقاً.',
        data: { sessionId: session.id },
        channels: ['inapp', 'push'],
      });
    }

    return session;
  }

  async cancel(teacherUserId, sessionId, reason, isAdmin = false) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (!isAdmin && session.teacher_id !== teacherUserId) {
      throw new ApiError(403, 'Not allowed');
    }
    await session.update({ status: 'cancelled' });

    // refund enrolled students
    const enrollments = await SessionEnrollment.findAll({ where: { session_id: session.id } });
    for (const e of enrollments) {
      if (parseFloat(e.charged_amount) > 0) {
        await walletService.refund(e.user_id, e.charged_amount, `Refund: cancelled session #${session.id}`, {
          type: 'session',
          id: session.id,
        });
      }
    }
    return session;
  }

  async enroll(studentUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    const existing = await SessionEnrollment.findOne({
      where: { session_id: sessionId, user_id: studentUserId },
    });
    if (existing) return existing;
    return SessionEnrollment.create({ session_id: sessionId, user_id: studentUserId, charged_amount: 0 });
  }

  async joinAsObserver(userId, sessionId) {
    const session = await this.getById(sessionId);
    if (session.status === 'cancelled' || session.status === 'ended') {
      throw new ApiError(400, 'Session is not joinable');
    }
    const provider = getProvider();
    const token = await provider.getToken(session.room_name, `observer-${userId}`, 'observer');
    return { session, token, roomName: session.room_name, livekitUrl: config.live.livekit.url };
  }

  async forceEnd(adminUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.status !== 'live') throw new ApiError(400, 'Session is not live');
    const provider = getProvider();
    await provider.deleteRoom(session.room_name);
    const rows = await SessionAttendance.findAll({ where: { session_id: session.id, left_at: null } });
    for (const a of rows) {
      const leftAt = new Date();
      const dur = Math.round((leftAt - new Date(a.joined_at || leftAt)) / 1000);
      await a.update({ left_at: leftAt, duration_sec: dur });
    }
    const recording = await SessionRecording.findOne({ where: { session_id: session.id, status: 'recording' } });
    if (recording) {
      await recording.update({ status: 'processing' });
    }
    await session.update({ status: 'ended', ended_at: new Date() });
    return session;
  }

  async banUser(adminUserId, sessionId, targetUserId, reason) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    const [ban] = await SessionBan.findOrCreate({
      where: { session_id: session.id, user_id: targetUserId },
      defaults: { session_id: session.id, user_id: targetUserId, banned_by: adminUserId, reason },
    });
    return ban;
  }

  async suspendTeacher(adminUserId, sessionId) {
    const { Teacher } = require('../../models');
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    const teacher = await Teacher.findOne({ where: { user_id: session.teacher_id } });
    if (teacher) {
      await teacher.update({ status: 'suspended' });
    }
    const provider = getProvider();
    await provider.deleteRoom(session.room_name);
    const rows = await SessionAttendance.findAll({ where: { session_id: session.id, left_at: null } });
    for (const a of rows) {
      const leftAt = new Date();
      const dur = Math.round((leftAt - new Date(a.joined_at || leftAt)) / 1000);
      await a.update({ left_at: leftAt, duration_sec: dur });
    }
    await session.update({ status: 'ended', ended_at: new Date() });
    return session;
  }

  async lockRoom(teacherUserId, sessionId, locked) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.teacher_id !== teacherUserId) throw new ApiError(403, 'Not the session teacher');
    return session.update({ is_private: locked });
  }

  async startRecording(teacherUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.teacher_id !== teacherUserId) throw new ApiError(403, 'Not the session teacher');
    const provider = getProvider();
    const rec = await provider.startRecording(session.room_name);
    if (!rec) throw new ApiError(500, 'Failed to start recording');
    const recording = await SessionRecording.create({ session_id: session.id, status: 'recording' });
    return recording;
  }

  async stopRecording(teacherUserId, sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.teacher_id !== teacherUserId) throw new ApiError(403, 'Not the session teacher');
    const recording = await SessionRecording.findOne({ where: { session_id: session.id, status: 'recording' } });
    if (!recording) throw new ApiError(400, 'No active recording');
    const provider = getProvider();
    await provider.stopRecording(session.room_name, recording.id);
    await recording.update({ status: 'processing' });
    return recording;
  }

  async getLiveSessions() {
    const sessions = await Session.findAll({
      where: { status: 'live' },
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'avatar'] }] },
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
        { model: SessionEnrollment, as: 'enrollments', attributes: ['id'] },
      ],
      order: [['started_at', 'DESC']],
    });

    // Count currently present participants (joined_at set, left_at null)
    const attendanceCounts = await SessionAttendance.findAll({
      where: { left_at: null },
      attributes: ['session_id', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['session_id'],
      raw: true,
    });
    const countMap = {};
    for (const row of attendanceCounts) {
      countMap[row.session_id] = parseInt(row.count, 10);
    }

    return sessions.map((s) => {
      const data = s.toJSON();
      return {
        ...data,
        liveParticipants: countMap[s.id] || 0,
        totalEnrolled: data.enrollments?.length || 0,
      };
    });
  }

  async createReport(userId, sessionId, dto) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    const report = await SessionReport.create({
      session_id: session.id,
      user_id: userId,
      type: dto.type || 'other',
      description: dto.description,
      severity: dto.severity || 'medium',
    });
    return report;
  }
}

module.exports = new SessionService();
