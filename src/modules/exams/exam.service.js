const { Exam, Question, ExamAttempt, ExamAnswer, User, Student } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { Sequelize } = require('sequelize');
const certificateService = require('../certificates/certificate.service');

class ExamService {
  async list({ filters, limit, offset }) {
    const where = {};
    if (filters.course_id) where.course_id = filters.course_id;
    if (filters.session_id) where.session_id = filters.session_id;
    const { rows, count } = await Exam.findAndCountAll({
      where,
      include: [{ model: Question, as: 'questions' }],
      limit,
      offset,
      order: [['id', 'DESC']],
    });
    return { rows, count };
  }

  async getById(id, withQuestions = true) {
    const exam = await Exam.findByPk(id, {
      include: withQuestions ? [{ model: Question, as: 'questions' }] : [],
    });
    if (!exam) throw new ApiError(404, 'Exam not found');
    return exam;
  }

  async create(dto) {
    const exam = await Exam.create({
      course_id: dto.course_id,
      session_id: dto.session_id,
      title: dto.title,
      description: dto.description,
      duration_min: dto.duration_min,
      pass_score: dto.pass_score,
      start_at: dto.start_at,
      end_at: dto.end_at,
    });
    if (dto.questions && dto.questions.length) {
      for (const q of dto.questions) {
        await Question.create({ exam_id: exam.id, ...q });
      }
    }
    return this.getById(exam.id);
  }

  async startAttempt(examId, userId) {
    const exam = await this.getById(examId);
    if (!exam.is_published) throw new ApiError(403, 'Exam not published');
    const existing = await ExamAttempt.findOne({
      where: { exam_id: examId, user_id: userId, status: 'in_progress' },
    });
    if (existing) return existing;
    return ExamAttempt.create({
      exam_id: examId,
      user_id: userId,
      started_at: new Date(),
      max_score: 100,
    });
  }

  async submitAttempt(attemptId, userId, answers) {
    const attempt = await ExamAttempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== userId) throw new ApiError(404, 'Attempt not found');
    if (attempt.status === 'submitted') throw new ApiError(400, 'Already submitted');

    const exam = await this.getById(attempt.exam_id, true);
    let earned = 0;
    let maxPoints = 0;

    for (const ans of answers) {
      const q = exam.questions.find((x) => x.id === ans.question_id);
      if (!q) continue;
      maxPoints += parseFloat(q.points);
      let isCorrect = null;
      let points = 0;
      if (q.type === 'mcq' || q.type === 'truefalse') {
        isCorrect = String(ans.answer) === String(q.correct_answer);
        points = isCorrect ? parseFloat(q.points) : 0;
        earned += points;
      }
      await ExamAnswer.create({
        attempt_id: attempt.id,
        question_id: q.id,
        answer: ans.answer,
        is_correct: isCorrect,
        points,
      });
    }

    const score = maxPoints > 0 ? (earned / maxPoints) * 100 : 0;
    const passed = score >= parseFloat(exam.pass_score);
    let certificateNumber = null;

    if (passed) {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (student) {
        const user = await User.findByPk(userId);
        const cert = await certificateService.create({
          attemptId: attempt.id,
          studentId: student.user_id,
          title: exam.title,
          studentName: user ? user.name : 'طالب',
          subject: exam.title,
          score: parseFloat(score.toFixed(2)),
          total: 100,
        });
        certificateNumber = cert.certificate_number;
      }
    }

    await attempt.update({
      submitted_at: new Date(),
      score: parseFloat(score.toFixed(2)),
      status: 'graded',
      certificate_id: certificateNumber,
    });
    return { attempt, score, passed, certificateId: certificateNumber };
  }

  async myAttempts(userId, { limit, offset }) {
    const { rows, count } = await ExamAttempt.findAndCountAll({
      where: { user_id: userId },
      include: [{ model: Exam, as: 'exam', attributes: ['id', 'title', 'pass_score'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }
}

module.exports = new ExamService();
