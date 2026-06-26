const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const future = (h) => new Date(Date.now() + h * 3600 * 1000);

    // Subjects
    await queryInterface.bulkInsert('subjects', [
      { name: 'الرياضيات', slug: 'math', description: 'رياضيات جميع المراحل', icon: '📐', is_active: true, created_at: now, updated_at: now },
      { name: 'الفيزياء', slug: 'physics', description: 'فيزياء للثانوية العامة', icon: '⚛️', is_active: true, created_at: now, updated_at: now },
      { name: 'الكيمياء', slug: 'chemistry', description: 'كيمياء عضوية وغير عضوية', icon: '🧪', is_active: true, created_at: now, updated_at: now },
      { name: 'الأحياء', slug: 'biology', description: 'أحياء متكاملة', icon: '🧬', is_active: true, created_at: now, updated_at: now },
      { name: 'اللغة العربية', slug: 'arabic', description: 'نحو وبلاغة وأدب', icon: '📝', is_active: true, created_at: now, updated_at: now },
      { name: 'اللغة الإنجليزية', slug: 'english', description: 'إنجليزي جميع المستويات', icon: '🔤', is_active: true, created_at: now, updated_at: now },
    ], {});

    // Teacher user
    const [[teacherRole]] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name='teacher' LIMIT 1;`);
    const teacherPwd = await bcrypt.hash('Teacher@123', 12);
    await queryInterface.bulkInsert('users', [{
      uuid: uuidv4(), name: 'أ. محمد أحمد', email: 'teacher@test.local', phone: '201111111111',
      password_hash: teacherPwd, role_id: teacherRole.id, status: 'active',
      email_verified: true, phone_verified: true, created_at: now, updated_at: now,
    }], {});

    const [[teacherUser]] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email='teacher@test.local' LIMIT 1;`);
    const [[mathSub]] = await queryInterface.sequelize.query(`SELECT id FROM subjects WHERE slug='math' LIMIT 1;`);

    // Teacher profile (approved)
    await queryInterface.bulkInsert('teachers', [{
      user_id: teacherUser.id, bio: 'مدرس رياضيات خبرة 15 سنة', specialization: 'الرياضيات',
      status: 'approved', rating: 4.8, total_sessions: 0, total_students: 0,
      approved_by: 1, approved_at: now, created_at: now, updated_at: now,
    }], {});

    // Teacher pricing
    await queryInterface.bulkInsert('teacher_pricing', [{
      teacher_id: teacherUser.id, session_price: 50, private_session_price: 150,
      monthly_price: 500, yearly_price: 5000, currency: 'EGP', created_at: now, updated_at: now,
    }], {});

    // Wallet for teacher
    await queryInterface.bulkInsert('wallets', [{
      user_id: teacherUser.id, balance: 0, currency: 'EGP', created_at: now, updated_at: now,
    }], {});

    // Sessions
    await queryInterface.bulkInsert('sessions', [
      {
        uuid: uuidv4(), course_id: null, teacher_id: teacherUser.id, subject_id: mathSub.id,
        title: 'شرح التفاضل والتكامل', description: 'حصة مباشرة في التفاضل',
        scheduled_at: future(2), duration_min: 90, status: 'scheduled',
        is_private: false, price: 50, room_name: 'ta3lem-demo-1', recording_enabled: true,
        created_at: now, updated_at: now,
      },
      {
        uuid: uuidv4(), course_id: null, teacher_id: teacherUser.id, subject_id: mathSub.id,
        title: 'مراجعة عامة على الجبر', description: 'مراجعة شاملة',
        scheduled_at: future(26), duration_min: 60, status: 'scheduled',
        is_private: false, price: 30, room_name: 'ta3lem-demo-2', recording_enabled: true,
        created_at: now, updated_at: now,
      },
    ], {});

    // Charge student wallet
    const [[studentUser]] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email='student@test.local' LIMIT 1;`);
    if (studentUser) {
      const [[wallet]] = await queryInterface.sequelize.query(`SELECT id, balance FROM wallets WHERE user_id=${studentUser.id} LIMIT 1;`);
      if (wallet) {
        await queryInterface.bulkInsert('transactions', [{
          uuid: uuidv4(), wallet_id: wallet.id, type: 'charge', amount: 500,
          balance_before: 0, balance_after: 500, reason: 'شحن رصيد تجريبي',
          created_at: now,
        }], {});
        await queryInterface.sequelize.query(`UPDATE wallets SET balance=500 WHERE id=${wallet.id};`);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('sessions', { room_name: ['ta3lem-demo-1', 'ta3lem-demo-2'] });
    await queryInterface.bulkDelete('teacher_pricing', { teacher_id: 3 });
    await queryInterface.bulkDelete('teachers', { user_id: 3 });
    await queryInterface.bulkDelete('users', { email: 'teacher@test.local' });
    await queryInterface.bulkDelete('subjects', { slug: ['math', 'physics', 'chemistry', 'biology', 'arabic', 'english'] });
  },
};
