const { Course, Teacher, Subject, User } = require('../../models');
const ApiError = require('../../utils/ApiError');

class CourseService {
  async list({ filters, limit, offset }) {
    const where = {};
    if (filters.teacher_id) where.teacher_id = filters.teacher_id;
    if (filters.subject_id) where.subject_id = filters.subject_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active !== 'false';
    const { rows, count } = await Course.findAndCountAll({
      where,
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: Subject, as: 'subject' },
      ],
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async getById(id) {
    const course = await Course.findByPk(id, {
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: Subject, as: 'subject' },
      ],
    });
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  async create(teacherUserId, dto) {
    const teacher = await Teacher.findByPk(teacherUserId);
    if (!teacher) throw new ApiError(403, 'Only teachers can create courses');
    return Course.create({
      teacher_id: teacher.user_id,
      subject_id: dto.subject_id,
      title: dto.title,
      description: dto.description,
      price: dto.price || 0,
      is_private: dto.is_private || false,
    });
  }

  async update(id, dto, userId, isAdmin) {
    const course = await this.getById(id);
    if (!isAdmin && course.teacher_id !== userId) throw new ApiError(403, 'Not allowed');
    await course.update(dto);
    return course;
  }

  async remove(id, userId, isAdmin) {
    const course = await this.getById(id);
    if (!isAdmin && course.teacher_id !== userId) throw new ApiError(403, 'Not allowed');
    await course.destroy();
    return true;
  }
}

module.exports = new CourseService();
