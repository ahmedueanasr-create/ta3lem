const { Session, SessionEnrollment, Teacher, User, SessionAttendance, SessionRecording, Subject } = require('../../models');
const ApiError = require('../../utils/ApiError');

class RatingService {
  async rateSession(studentUserId, sessionId, { rating, comment }) {
    if (rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be 1-5');
    const enrollment = await SessionEnrollment.findOne({
      where: { session_id: sessionId, user_id: studentUserId },
    });
    if (!enrollment) throw new ApiError(403, 'You did not attend this session');
    if (enrollment.rating) throw new ApiError(409, 'Already rated');

    await enrollment.update({ rating, comment });

    // update teacher aggregate rating
    const session = await Session.findByPk(sessionId);
    if (session) {
      const allRatings = await SessionEnrollment.findAll({
        where: { rating: { [require('sequelize').Op.ne]: null } },
        include: [{ model: Session, as: 'session', where: { teacher_id: session.teacher_id }, attributes: [] }],
      });
      if (allRatings.length > 0) {
        const avg = allRatings.reduce((s, e) => s + parseFloat(e.rating), 0) / allRatings.length;
        await Teacher.update(
          { rating: parseFloat(avg.toFixed(2)) },
          { where: { user_id: session.teacher_id } },
        );
      }
    }
    return enrollment;
  }

  async getSessionRatings(sessionId) {
    const enrollments = await SessionEnrollment.findAll({
      where: { session_id: sessionId, rating: { [require('sequelize').Op.ne]: null } },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });
    return enrollments;
  }
}

module.exports = new RatingService();
