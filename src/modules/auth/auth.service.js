const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role, Student, Teacher, TeacherPricing, Wallet, Supervisor } = require('../../models');
const ApiError = require('../../utils/ApiError');
const JwtService = require('../../utils/jwt');
const config = require('../../config');
const { redis } = require('../../config/redis');
const ROLES = require('../../utils/roles');
const logger = require('../../config/logger');
const waService = require('../whatsapp/whatsapp.service');
const emailService = require('../../services/email.service');

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class AuthService {
  async register({ name, email, password, phone, guardian_name, guardian_phone, grade }) {
    // Student-only registration. Teachers are added by admin only.
    // Validate full triple name (at least 3 words)
    const nameWords = name.trim().split(/\s+/).filter(Boolean);
    if (nameWords.length < 3) {
      throw new ApiError(422, 'الاسم يجب أن يكون ثلاثياً على الأقل (الاسم والأب والجد/العائلة)');
    }

    // Validate Egyptian phone format
    const phoneClean = (phone || '').replace(/\s|-/g, '');
    if (!/^01[0-9]{9}$/.test(phoneClean)) {
      throw new ApiError(422, 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
    }

    // Validate guardian phone
    const guardianPhoneClean = (guardian_phone || '').replace(/\s|-/g, '');
    if (!guardian_phone || !/^01[0-9]{9}$/.test(guardianPhoneClean)) {
      throw new ApiError(422, 'رقم ولي الأمر غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new ApiError(409, 'البريد الإلكتروني مسجل بالفعل');

    const phoneExists = await User.findOne({ where: { phone: phoneClean } });
    if (phoneExists) throw new ApiError(409, 'رقم الهاتف مسجل بالفعل');

    const roleRow = await Role.findOne({ where: { name: ROLES.STUDENT } });
    if (!roleRow) throw new ApiError(400, 'Invalid role');

    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
    const user = await User.create({
      name: name.trim(),
      email,
      phone: phoneClean,
      password_hash: passwordHash,
      role_id: roleRow.id,
      status: 'active',
      first_login: false,
    });

    await Student.create({
      user_id: user.id,
      grade: grade || null,
      guardian_name: guardian_name || null,
      guardian_phone: guardianPhoneClean,
    });

    await Wallet.create({ user_id: user.id, balance: 0 });

    return user;
  }

  /**
   * Login Step 1: validate credentials → generate OTP → send via WhatsApp → return temp token.
   * The temp token is used in Step 2 (verifyOtp) to get the real JWT.
   */
  async login({ email, password }) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', include: ['permissions'] }],
    });
    if (!user) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new ApiError(401, 'بيانات الدخول غير صحيحة');
    if (user.status === 'suspended') throw new ApiError(403, 'الحساب موقوف');

    // Generate OTP
    const otp = generateOtp();
    const otpKey = `otp:${user.id}`;

    // Store OTP in Redis (5 min TTL) — fallback to in-memory if Redis down
    try {
      await redis.set(otpKey, otp, 'EX', 300);
    } catch (e) {
      // Redis unavailable — use in-memory store
      inMemoryOtps.set(otpKey, { otp, expires: Date.now() + 300000 });
      logger.warn('Redis down, using in-memory OTP store');
    }

    // Send OTP via WhatsApp (fire-and-forget, don't block login)
    const phoneForWa = `2${user.phone}`;
    const otpMessage = `رمز التحقق الخاص بك في منصة تعليم هو: ${otp}\n\nلا تشارك هذا الرمز مع أحد.\nينتهي خلال 5 دقائق.`;
    waService.send(phoneForWa, otpMessage).catch(() => {});

    // Send OTP via email as fallback (fire-and-forget)
    emailService.sendOtp(user.email, otp).catch(() => {});

    // In dev mode, always return OTP for local testing
    const isDev = config.app.env === 'development' || config.app.env === 'local';

    // Issue a short-lived temp token for OTP verification
    const tempToken = JwtService.signAccess({
      sub: user.id,
      role: user.role.name,
      otp_pending: true,
    });

    if (isDev) logger.info(`Dev OTP: ${otp}`);

    return {
      tempToken,
      requiresOtp: true,
      phone: user.phone ? `*****${user.phone.slice(-4)}` : null,
      devOtp: isDev ? otp : null,
    };
  }

  /**
   * Login Step 2: verify OTP → issue real JWT tokens.
   */
  async verifyOtp(tempToken, otp) {
    const decoded = JwtService.verifyAccess(tempToken);
    if (!decoded.otp_pending) throw new ApiError(400, 'Invalid temp token');

    const userId = decoded.sub;
    const otpKey = `otp:${userId}`;

    // Get stored OTP
    let storedOtp;
    try {
      storedOtp = await redis.get(otpKey);
    } catch (e) {
      const mem = inMemoryOtps.get(otpKey);
      storedOtp = mem && mem.expires > Date.now() ? mem.otp : null;
    }

    if (!storedOtp) throw new ApiError(400, 'انتهت صلاحية الرمز أو لم يتم إرساله');
    if (storedOtp !== String(otp)) throw new ApiError(400, 'رمز التحقق غير صحيح');

    // Clear OTP
    try { await redis.del(otpKey); } catch (e) { inMemoryOtps.delete(otpKey); }

    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role', include: ['permissions'] }],
    });
    if (!user || user.status !== 'active') throw new ApiError(401, 'الحساب غير نشط');

    const payload = { sub: user.id, role: user.role.name };
    const accessToken = JwtService.signAccess(payload);
    const refreshToken = JwtService.signRefresh(payload);

    await user.update({ last_login: new Date() });

    return {
      user,
      accessToken,
      refreshToken,
      mustChangePassword: user.must_change_password,
      firstLogin: user.first_login,
    };
  }

  /**
   * Resend OTP (for login flow).
   */
  async resendOtp(tempToken) {
    const decoded = JwtService.verifyAccess(tempToken);
    if (!decoded.otp_pending) throw new ApiError(400, 'Invalid temp token');
    const user = await User.findByPk(decoded.sub);
    if (!user) throw new ApiError(401, 'User not found');

    const otp = generateOtp();
    const otpKey = `otp:${user.id}`;
    try {
      await redis.set(otpKey, otp, 'EX', 300);
    } catch (e) {
      inMemoryOtps.set(otpKey, { otp, expires: Date.now() + 300000 });
    }

    const phoneForWa = `2${user.phone}`;
    const otpMessage = `رمز التحقق الجديد: ${otp}\n\nينتهي خلال 5 دقائق.`;
    waService.send(phoneForWa, otpMessage).catch(() => {});

    // Send OTP via email as fallback (fire-and-forget)
    emailService.sendOtp(user.email, otp).catch(() => {});

    return {
      devOtp: otp,
      phone: user.phone ? `*****${user.phone.slice(-4)}` : null,
    };
  }

  async refresh(refreshToken) {
    const decoded = JwtService.verifyRefresh(refreshToken);
    try {
      const blocked = await redis.get(`bl:${decoded.jti}`);
      if (blocked) throw new ApiError(401, 'Token revoked');
    } catch (e) { /* Redis down — skip */ }

    const user = await User.findByPk(decoded.sub, {
      include: [{ model: Role, as: 'role', include: ['permissions'] }],
    });
    if (!user || user.status !== 'active') throw new ApiError(401, 'Invalid user');

    const payload = { sub: user.id, role: user.role.name };
    const accessToken = JwtService.signAccess(payload);
    const newRefresh = JwtService.signRefresh(payload);

    try { await redis.set(`bl:${decoded.jti}`, '1', 'EX', 60 * 60 * 24 * 7); } catch (e) {}
    return { accessToken, refreshToken: newRefresh };
  }

  async logout(accessToken, refreshToken) {
    try {
      if (accessToken) {
        const d = JwtService.decode(accessToken);
        if (d?.exp) await redis.set(`bl:${d.jti}`, '1', 'EX', d.exp - Math.floor(Date.now() / 1000));
      }
      if (refreshToken) {
        const d = JwtService.decode(refreshToken);
        if (d?.exp) await redis.set(`bl:${d.jti}`, '1', 'EX', d.exp - Math.floor(Date.now() / 1000));
      }
    } catch (e) {}
  }

  async me(user) {
    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) return;
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    try {
      await redis.set(`reset:${hash}`, String(user.id), 'EX', 3600);
    } catch (e) {
      logger.warn('Redis unavailable for reset token', { message: e.message });
    }
    logger.info(`Password reset token for ${email}: ${token}`);
    return { token, email: user.email };
  }

  async resetPassword(token, newPassword) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    let userId;
    try {
      userId = await redis.get(`reset:${hash}`);
    } catch (e) {
      throw new ApiError(500, 'Reset service unavailable');
    }
    if (!userId) throw new ApiError(400, 'Invalid or expired reset token');
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(400, 'User not found');
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await user.update({ password_hash: passwordHash });
    try { await redis.del(`reset:${hash}`); } catch (e) {}
    return true;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const ok = await bcrypt.compare(oldPassword, user.password_hash);
    if (!ok) throw new ApiError(401, 'كلمة المرور الحالية غير صحيحة');
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await user.update({ password_hash: passwordHash, must_change_password: false });
    return true;
  }

  /**
   * Admin creates a teacher (or any user). Teacher gets first_login=true + must_change_password=true.
   */
  async adminCreateUser({ name, email, password, phone, role, extra }) {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw new ApiError(409, 'Email already registered');

    const roleRow = await Role.findOne({ where: { name: role || ROLES.STUDENT } });
    if (!roleRow) throw new ApiError(400, 'Invalid role');

    const phoneClean = (phone || '').replace(/\s|-/g, '');
    if (phone && !/^01[0-9]{9}$/.test(phoneClean)) {
      throw new ApiError(422, 'رقم الهاتف غير صحيح');
    }

    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
    const isTeacher = roleRow.name === ROLES.TEACHER;

    const user = await User.create({
      name,
      email,
      phone: phoneClean || null,
      password_hash: passwordHash,
      role_id: roleRow.id,
      status: 'active',
      email_verified: true,
      first_login: isTeacher,
      must_change_password: isTeacher,
    });

    if (roleRow.name === ROLES.STUDENT) {
      await Student.create({
        user_id: user.id,
        grade: extra?.grade,
        guardian_name: extra?.guardian_name,
        guardian_phone: extra?.guardian_phone,
      });
    } else if (roleRow.name === ROLES.TEACHER) {
      await Teacher.create({
        user_id: user.id,
        bio: null,
        specialization: extra?.specialization || null,
        status: 'approved',
        approved_by: 1,
        approved_at: new Date(),
      });
      await TeacherPricing.create({ teacher_id: user.id });
    } else if (roleRow.name === ROLES.TEACHERS_SUPERVISOR || roleRow.name === ROLES.STUDENT_SUPERVISOR) {
      await Supervisor.create({ user_id: user.id, type: extra?.supervisor_type || 'teachers' });
    }

    await Wallet.create({ user_id: user.id, balance: 0 });
    return user;
  }

  /**
   * Teacher onboarding: save health data + change password on first login.
   */
  async teacherOnboarding(userId, { health_status, health_notes, newPassword }) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (!health_status) throw new ApiError(422, 'البيانات الصحية مطلوبة');
    if (!newPassword || newPassword.length < 8) throw new ApiError(422, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');

    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await user.update({
      health_status,
      health_notes: health_notes || null,
      password_hash: passwordHash,
      must_change_password: false,
      first_login: false,
    });

    return user;
  }
}

// In-memory OTP fallback (when Redis is down)
const inMemoryOtps = new Map();

module.exports = new AuthService();
