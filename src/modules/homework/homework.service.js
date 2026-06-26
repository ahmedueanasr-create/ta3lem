const { Homework, HomeworkSubmission, File } = require('../../models');
const ApiError = require('../../utils/ApiError');

class HomeworkService {
  async list({ filters, limit, offset }) {
    const where = {};
    if (filters.teacher_id) where.teacher_id = filters.teacher_id;
    if (filters.session_id) where.session_id = filters.session_id;
    const { rows, count } = await Homework.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });
    return { rows, count };
  }

  async getById(id) {
    const hw = await Homework.findByPk(id, { include: [{ model: HomeworkSubmission, as: 'submissions' }] });
    if (!hw) throw new ApiError(404, 'Homework not found');
    return hw;
  }

  async create(teacherUserId, dto) {
    return Homework.create({ teacher_id: teacherUserId, ...dto });
  }

  async submit(homeworkId, userId, { content, fileId }) {
    const existing = await HomeworkSubmission.findOne({ where: { homework_id: homeworkId, user_id: userId } });
    if (existing) throw new ApiError(409, 'Already submitted');
    return HomeworkSubmission.create({
      homework_id: homeworkId,
      user_id: userId,
      content,
      file_id: fileId,
      submitted_at: new Date(),
    });
  }

  async grade(submissionId, { score, feedback }) {
    const sub = await HomeworkSubmission.findByPk(submissionId);
    if (!sub) throw new ApiError(404, 'Submission not found');
    await sub.update({ score, feedback, status: 'graded' });
    return sub;
  }
}

module.exports = new HomeworkService();
