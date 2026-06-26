const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

function createTransporter() {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

const transporter = createTransporter();

const baseStyle = `
  body { margin: 0; padding: 0; background-color: #f4f4f4; direction: rtl; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; font-family: 'Tahoma', 'Arial', sans-serif; }
  .header { background: #1a73e8; padding: 24px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
  .body { padding: 32px 24px; color: #333333; font-size: 15px; line-height: 1.8; }
  .otp-code { text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #1a73e8; background: #e8f0fe; padding: 16px; border-radius: 8px; margin: 20px 0; }
  .button { display: inline-block; padding: 12px 32px; background: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 16px; }
  .footer { background: #f8f9fa; padding: 16px 24px; text-align: center; font-size: 12px; color: #888888; }
  .footer a { color: #1a73e8; text-decoration: none; }
`;

function wrapHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>منصة تعليم</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>هذه الرسالة مرسلة تلقائياً، يرجى عدم الرد عليها.</p>
      <p>&copy; ${new Date().getFullYear()} منصة تعليم &mdash; جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
}

class EmailService {
  async sendMail({ to, subject, html }) {
    if (!config.email.user || !config.email.pass) {
      logger.warn('SMTP not configured, skipping email');
      return { status: 'skipped', reason: 'SMTP not configured' };
    }
    try {
      const info = await transporter.sendMail({
        from: `"منصة تعليم" <${config.email.from}>`,
        to,
        subject,
        html,
      });
      logger.info('Email sent', { to, subject, messageId: info.messageId });
      return { status: 'sent', messageId: info.messageId };
    } catch (err) {
      logger.error('Email send failed', { to, subject, error: err.message });
      return { status: 'failed', error: err.message };
    }
  }

  async sendOtp(email, otp) {
    const html = wrapHtml(`
      <h2 style="margin-top:0;">رمز التحقق</h2>
      <p>مرحباً بك في <strong>منصة تعليم</strong>،</p>
      <p>رمز التحقق الخاص بك هو:</p>
      <div class="otp-code">${otp}</div>
      <p>ينتهي هذا الرمز خلال <strong>5 دقائق</strong>. يرجى عدم مشاركته مع أي شخص.</p>
      <p>إذا لم تكن قد طلبت هذا الرمز، فيرجى تجاهل هذه الرسالة.</p>
      <p>شكراً لك،<br>فريق منصة تعليم</p>
    `);
    return this.sendMail({ to: email, subject: '🔐 رمز التحقق - منصة تعليم', html });
  }

  async sendNotification(userEmail, notification) {
    const html = wrapHtml(`
      <h2 style="margin-top:0;">${notification.title || 'إشعار جديد'}</h2>
      <p>${(notification.body || '').replace(/\n/g, '<br>')}</p>
      ${notification.data?.action_url ? `<p style="text-align:center;margin-top:20px;"><a href="${notification.data.action_url}" class="button">عرض التفاصيل</a></p>` : ''}
      <p style="margin-top:20px;font-size:13px;color:#888;">مع تحيات،<br>فريق منصة تعليم</p>
    `);
    return this.sendMail({ to: userEmail, subject: `📢 ${notification.title || 'إشعار جديد'}`, html });
  }

  async sendPasswordReset(userEmail, resetLink) {
    const html = wrapHtml(`
      <h2 style="margin-top:0;">إعادة تعيين كلمة المرور</h2>
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>منصة تعليم</strong>.</p>
      <p style="text-align:center;margin:24px 0;"><a href="${resetLink}" class="button">إعادة تعيين كلمة المرور</a></p>
      <p>إذا لم تكن قد طلبت إعادة تعيين كلمة المرور، فيرجى تجاهل هذه الرسالة.</p>
      <p>ملاحظة: رابط إعادة التعيين صالح لمدة <strong>ساعة واحدة</strong> فقط.</p>
      <p>شكراً لك،<br>فريق منصة تعليم</p>
    `);
    return this.sendMail({ to: userEmail, subject: '🔑 إعادة تعيين كلمة المرور - منصة تعليم', html });
  }
}

module.exports = new EmailService();
