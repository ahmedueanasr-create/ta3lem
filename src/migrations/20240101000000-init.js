'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      label: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      label: { type: Sequelize.STRING(150), allowNull: false },
      group: { type: Sequelize.STRING(80) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('permissions', ['group']);

    await queryInterface.createTable('role_permissions', {
      role_id: { type: Sequelize.BIGINT, primaryKey: true },
      permission_id: { type: Sequelize.BIGINT, primaryKey: true },
    });

    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, allowNull: false, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(190), unique: true, allowNull: false },
      phone: { type: Sequelize.STRING(20), unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'roles', key: 'id' } },
      status: { type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending'), allowNull: false, defaultValue: 'active' },
      avatar: { type: Sequelize.STRING(500) },
      last_login: { type: Sequelize.DATE },
      email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      phone_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      refresh_jti: { type: Sequelize.STRING(64) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.addIndex('users', ['status']);

    await queryInterface.createTable('wallets', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, unique: true, allowNull: false, references: { model: 'users', key: 'id' } },
      balance: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EGP' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      wallet_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'wallets', key: 'id' } },
      type: { type: Sequelize.ENUM('charge', 'deduct', 'refund', 'bonus', 'payout'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_before: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_after: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reason: { type: Sequelize.STRING(255) },
      reference_type: { type: Sequelize.STRING(60) },
      reference_id: { type: Sequelize.BIGINT },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('transactions', ['wallet_id']);
    await queryInterface.addIndex('transactions', ['reference_type', 'reference_id']);

    await queryInterface.createTable('students', {
      user_id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'users', key: 'id' } },
      grade: { type: Sequelize.STRING(80) },
      guardian_name: { type: Sequelize.STRING(150) },
      guardian_phone: { type: Sequelize.STRING(20) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('teachers', {
      user_id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'users', key: 'id' } },
      bio: { type: Sequelize.TEXT },
      specialization: { type: Sequelize.STRING(150) },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'), allowNull: false, defaultValue: 'pending' },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      total_sessions: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_students: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      approved_by: { type: Sequelize.BIGINT },
      approved_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('teachers', ['status']);

    await queryInterface.createTable('teacher_pricing', {
      teacher_id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'teachers', key: 'user_id' } },
      session_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      private_session_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      monthly_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      yearly_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EGP' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('supervisors', {
      user_id: { type: Sequelize.BIGINT, primaryKey: true, references: { model: 'users', key: 'id' } },
      type: { type: Sequelize.ENUM('teachers', 'students'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('supervisors', ['type']);

    await queryInterface.createTable('subjects', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), unique: true, allowNull: false },
      slug: { type: Sequelize.STRING(160), unique: true, allowNull: false },
      description: { type: Sequelize.TEXT },
      icon: { type: Sequelize.STRING(500) },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('courses', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      teacher_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'teachers', key: 'user_id' } },
      subject_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'subjects', key: 'id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      is_private: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('courses', ['teacher_id']);
    await queryInterface.addIndex('courses', ['subject_id']);

    await queryInterface.createTable('sessions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      course_id: { type: Sequelize.BIGINT, references: { model: 'courses', key: 'id' } },
      teacher_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'teachers', key: 'user_id' } },
      subject_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'subjects', key: 'id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      scheduled_at: { type: Sequelize.DATE, allowNull: false },
      duration_min: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
      status: { type: Sequelize.ENUM('scheduled', 'live', 'ended', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
      is_private: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      room_name: { type: Sequelize.STRING(120), unique: true, allowNull: false },
      recording_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      started_at: { type: Sequelize.DATE },
      ended_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('sessions', ['teacher_id']);
    await queryInterface.addIndex('sessions', ['subject_id']);
    await queryInterface.addIndex('sessions', ['status']);
    await queryInterface.addIndex('sessions', ['scheduled_at']);

    await queryInterface.createTable('session_enrollments', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      session_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'sessions', key: 'id' } },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      charged_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      transaction_id: { type: Sequelize.BIGINT },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('session_enrollments', ['session_id', 'user_id'], { unique: true, name: 'session_user_uniq' });
    await queryInterface.addIndex('session_enrollments', ['user_id']);

    await queryInterface.createTable('session_attendance', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      session_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'sessions', key: 'id' } },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      joined_at: { type: Sequelize.DATE },
      left_at: { type: Sequelize.DATE },
      duration_sec: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      attendance_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.ENUM('present', 'absent', 'late'), allowNull: false, defaultValue: 'absent' },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('session_attendance', ['session_id', 'user_id'], { unique: true, name: 'att_session_user_uniq' });
    await queryInterface.addIndex('session_attendance', ['user_id']);

    await queryInterface.createTable('session_recordings', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      session_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'sessions', key: 'id' } },
      file_path: { type: Sequelize.STRING(500) },
      duration_sec: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      size_bytes: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.ENUM('recording', 'processing', 'ready', 'failed'), allowNull: false, defaultValue: 'recording' },
      chat_log: { type: Sequelize.JSON },
      url: { type: Sequelize.STRING(500) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('session_recordings', ['session_id']);

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      type: { type: Sequelize.STRING(60), allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      body: { type: Sequelize.TEXT },
      data: { type: Sequelize.JSON },
      channel: { type: Sequelize.ENUM('inapp', 'push', 'whatsapp', 'email'), allowNull: false, defaultValue: 'inapp' },
      read_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('notifications', ['user_id', 'read_at']);

    await queryInterface.createTable('whatsapp_messages', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      jid: { type: Sequelize.STRING(80), allowNull: false },
      message: { type: Sequelize.TEXT },
      media_url: { type: Sequelize.STRING(500) },
      status: { type: Sequelize.ENUM('queued', 'sent', 'delivered', 'read', 'failed'), allowNull: false, defaultValue: 'queued' },
      direction: { type: Sequelize.ENUM('in', 'out'), allowNull: false, defaultValue: 'out' },
      session: { type: Sequelize.STRING(60) },
      wa_message_id: { type: Sequelize.STRING(120) },
      error: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('whatsapp_messages', ['jid']);
    await queryInterface.addIndex('whatsapp_messages', ['status']);

    await queryInterface.createTable('exams', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      course_id: { type: Sequelize.BIGINT, references: { model: 'courses', key: 'id' } },
      session_id: { type: Sequelize.BIGINT, references: { model: 'sessions', key: 'id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      duration_min: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
      pass_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 50 },
      start_at: { type: Sequelize.DATE },
      end_at: { type: Sequelize.DATE },
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('questions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      exam_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'exams', key: 'id' } },
      type: { type: Sequelize.ENUM('mcq', 'truefalse', 'essay'), allowNull: false },
      text: { type: Sequelize.TEXT, allowNull: false },
      options: { type: Sequelize.JSON },
      correct_answer: { type: Sequelize.STRING(255) },
      points: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('questions', ['exam_id']);

    await queryInterface.createTable('exam_attempts', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      exam_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'exams', key: 'id' } },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      started_at: { type: Sequelize.DATE, allowNull: false },
      submitted_at: { type: Sequelize.DATE },
      score: { type: Sequelize.DECIMAL(5, 2) },
      max_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
      status: { type: Sequelize.ENUM('in_progress', 'submitted', 'graded'), allowNull: false, defaultValue: 'in_progress' },
      certificate_id: { type: Sequelize.STRING(120) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('exam_attempts', ['exam_id']);
    await queryInterface.addIndex('exam_attempts', ['user_id']);

    await queryInterface.createTable('exam_answers', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      attempt_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'exam_attempts', key: 'id' } },
      question_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'questions', key: 'id' } },
      answer: { type: Sequelize.TEXT },
      is_correct: { type: Sequelize.BOOLEAN },
      points: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('exam_answers', ['attempt_id']);
    await queryInterface.addIndex('exam_answers', ['attempt_id', 'question_id'], { unique: true, name: 'attempt_question_uniq' });

    await queryInterface.createTable('homework', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      course_id: { type: Sequelize.BIGINT, references: { model: 'courses', key: 'id' } },
      session_id: { type: Sequelize.BIGINT, references: { model: 'sessions', key: 'id' } },
      teacher_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'teachers', key: 'user_id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      due_at: { type: Sequelize.DATE, allowNull: false },
      max_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('homework', ['teacher_id']);

    await queryInterface.createTable('homework_submissions', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      homework_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'homework', key: 'id' } },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      file_id: { type: Sequelize.BIGINT },
      content: { type: Sequelize.TEXT },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      score: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('submitted', 'graded', 'returned'), allowNull: false, defaultValue: 'submitted' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('homework_submissions', ['homework_id']);
    await queryInterface.addIndex('homework_submissions', ['homework_id', 'user_id'], { unique: true, name: 'hw_user_uniq' });

    await queryInterface.createTable('files', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      uuid: { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
      uploader_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      entity_type: { type: Sequelize.STRING(60) },
      entity_id: { type: Sequelize.BIGINT },
      original_name: { type: Sequelize.STRING(255), allowNull: false },
      stored_name: { type: Sequelize.STRING(255), allowNull: false },
      mime: { type: Sequelize.STRING(120), allowNull: false },
      size: { type: Sequelize.BIGINT, allowNull: false },
      url: { type: Sequelize.STRING(500), allowNull: false },
      storage_disk: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'local' },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('files', ['uploader_id']);
    await queryInterface.addIndex('files', ['entity_type', 'entity_id']);

    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT },
      action: { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(60) },
      entity_id: { type: Sequelize.BIGINT },
      before: { type: Sequelize.JSON },
      after: { type: Sequelize.JSON },
      ip: { type: Sequelize.STRING(45) },
      user_agent: { type: Sequelize.STRING(300) },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id']);
  },

  async down(queryInterface) {
    const tables = [
      'audit_logs', 'files', 'homework_submissions', 'homework', 'exam_answers', 'exam_attempts',
      'questions', 'exams', 'whatsapp_messages', 'notifications', 'session_recordings',
      'session_attendance', 'session_enrollments', 'sessions', 'courses', 'subjects',
      'supervisors', 'teacher_pricing', 'teachers', 'students', 'transactions', 'wallets',
      'users', 'role_permissions', 'permissions', 'roles',
    ];
    for (const t of tables) await queryInterface.dropTable(t);
  },
};
