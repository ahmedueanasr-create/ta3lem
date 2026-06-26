const { Certificate, Student, ExamAttempt, Exam } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../../utils/ApiError');

function generateCertificateNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `TA3-${y}${m}${d}-${rand}`;
}

function determineGrade(score) {
  if (score >= 90) return 'ممتاز';
  if (score >= 80) return 'جيد جدا';
  if (score >= 65) return 'جيد';
  return 'مقبول';
}

class CertificateService {
  async create({ attemptId, studentId, title, studentName, subject, score, total }) {
    const certNumber = generateCertificateNumber();
    const grade = determineGrade(score);
    const today = new Date().toISOString().slice(0, 10);

    const cert = await Certificate.create({
      attempt_id: attemptId,
      student_id: studentId,
      certificate_number: certNumber,
      verification_code: uuidv4(),
      title,
      student_name: studentName,
      subject,
      score,
      total: total || 100,
      grade,
      issue_date: today,
    });
    return cert;
  }

  async verifyByCode(code) {
    const cert = await Certificate.findOne({
      where: { verification_code: code },
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: ExamAttempt, as: 'attempt', include: [{ model: Exam, as: 'exam' }] },
      ],
    });
    if (!cert) throw new ApiError(404, 'Certificate not found');
    return cert;
  }

  async getByStudentId(studentId) {
    return Certificate.findAll({
      where: { student_id: studentId },
      order: [['issue_date', 'DESC']],
    });
  }

  async getById(id) {
    const cert = await Certificate.findByPk(id, {
      include: [
        { model: Student, as: 'student' },
        { model: ExamAttempt, as: 'attempt' },
      ],
    });
    if (!cert) throw new ApiError(404, 'Certificate not found');
    return cert;
  }
}

module.exports = new CertificateService();
