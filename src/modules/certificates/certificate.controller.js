const certificateService = require('./certificate.service');
const { Student } = require('../../models');
const ApiError = require('../../utils/ApiError');

class CertificateController {
  async verify(req, res) {
    const cert = await certificateService.verifyByCode(req.params.code);
    res.json({ success: true, data: cert });
  }

  async myCertificates(req, res) {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) throw new ApiError(404, 'Student profile not found');
    const certs = await certificateService.getByStudentId(student.user_id);
    res.json({ success: true, data: certs });
  }

  async getCertificate(req, res) {
    const cert = await certificateService.getById(req.params.id);
    res.json({ success: true, data: cert });
  }
}

module.exports = new CertificateController();
