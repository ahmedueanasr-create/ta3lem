const { User, Role, Student, Teacher, Supervisor, Wallet } = require('../../models');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');
const config = require('../../config');

class UserService {
  async list({ filters, limit, offset }) {
    const where = {};
    if (filters.role_id) where.role_id = filters.role_id;
    if (filters.status) where.status = filters.status;
    if (filters.q) where.name = { [require('sequelize').Op.like]: `%${filters.q}%` };
    const { rows, count } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'role' }],
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async getById(id) {
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }, { model: Student, as: 'student' }, { model: Teacher, as: 'teacher' }, { model: Supervisor, as: 'supervisor' }, { model: Wallet, as: 'wallet' }],
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async update(id, dto) {
    const user = await this.getById(id);
    const patch = { ...dto };
    if (patch.password) {
      patch.password_hash = await bcrypt.hash(patch.password, config.security.bcryptRounds);
      delete patch.password;
    }
    delete patch.email; // email immutable here
    await user.update(patch);
    return user;
  }

  async setStatus(id, status) {
    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, 'User not found');
    await user.update({ status });
    return user;
  }

  async remove(id) {
    const user = await User.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  }
}

module.exports = new UserService();
