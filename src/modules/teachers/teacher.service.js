const { Teacher, User, TeacherPricing, Session } = require('../../models');
const ApiError = require('../../utils/ApiError');

class TeacherService {
  async list({ filters, limit, offset }) {
    const where = {};
    if (filters.status) where.status = filters.status;
    const { rows, count } = await Teacher.findAndCountAll({
      where,
      include: [{ model: User, as: 'user' }, { model: TeacherPricing, as: 'pricing' }],
      order: [['user_id', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async getById(userId) {
    const teacher = await Teacher.findByPk(userId, {
      include: [{ model: User, as: 'user' }, { model: TeacherPricing, as: 'pricing' }],
    });
    if (!teacher) throw new ApiError(404, 'Teacher not found');
    return teacher;
  }

  async approve(userId, approverId) {
    const teacher = await this.getById(userId);
    await teacher.update({ status: 'approved', approved_by: approverId, approved_at: new Date() });
    await User.update({ status: 'active' }, { where: { id: userId } });
    return teacher;
  }

  async reject(userId) {
    const teacher = await this.getById(userId);
    await teacher.update({ status: 'rejected' });
    return teacher;
  }

  async updatePricing(userId, dto) {
    let pricing = await TeacherPricing.findByPk(userId);
    if (!pricing) {
      pricing = await TeacherPricing.create({ teacher_id: userId, ...dto });
    } else {
      await pricing.update(dto);
    }
    return pricing;
  }

  async updateProfile(userId, dto) {
    const teacher = await this.getById(userId);
    await teacher.update(dto);
    return teacher;
  }
}

module.exports = new TeacherService();
