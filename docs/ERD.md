# ERD — Entity Relationship Diagram

26 tables. PK = primary key, FK = foreign key, UQ = unique, IDX = index.

## Identity & RBAC
```
roles (id PK, name UQ, label, description)
permissions (id PK, name UQ, label, group)            IDX(group)
role_permissions (role_id PK/FK->roles, permission_id PK/FK->permissions)
users (id PK, uuid UQ, name, email UQ, phone UQ, password_hash,
       role_id FK->roles IDX, status, avatar, last_login,
       email_verified, phone_verified, refresh_jti)   IDX(role_id,status)
```
`users 1—1 student | teacher | supervisor`

## Profiles
```
students   (user_id PK/FK->users, grade, guardian_name, guardian_phone)
teachers   (user_id PK/FK->users, bio, specialization, status,
            rating, total_sessions, total_students, approved_by FK->users,
            approved_at)                               IDX(status)
teacher_pricing (teacher_id PK/FK->teachers, session_price,
                 private_session_price, monthly_price, yearly_price, currency)
supervisors (user_id PK/FK->users, type ENUM(teachers,students))  IDX(type)
```

## Wallet
```
wallets (id PK, user_id UQ/FK->users, balance, currency)
transactions (id PK, uuid UQ, wallet_id FK->wallets IDX, type ENUM,
              amount, balance_before, balance_after, reason,
              reference_type, reference_id)             IDX(wallet_id, ref)
```

## Curriculum
```
subjects (id PK, name UQ, slug UQ, description, icon, is_active)
courses (id PK, uuid UQ, teacher_id FK->teachers IDX, subject_id FK->subjects IDX,
         title, description, price, is_private, is_active)
```

## Live Sessions
```
sessions (id PK, uuid UQ, course_id FK->courses, teacher_id FK->teachers,
          subject_id FK->subjects, title, description, scheduled_at,
          duration_min, status ENUM(scheduled,live,ended,cancelled),
          is_private, price, room_name UQ, recording_enabled,
          started_at, ended_at)                        IDX(teacher,subject,status,scheduled_at)
session_enrollments (id PK, session_id FK, user_id FK, charged_amount,
                     transaction_id)                   UQ(session_id,user_id)
session_attendance (id PK, session_id FK, user_id FK, joined_at, left_at,
                    duration_sec, attendance_pct, status ENUM)  UQ(session_id,user_id)
session_recordings (id PK, uuid UQ, session_id FK, file_path, duration_sec,
                    size_bytes, status ENUM, chat_log JSON, url)  IDX(session_id)
```

## Communication
```
notifications (id PK, user_id FK, type, title, body, data JSON,
               channel ENUM, read_at)                  IDX(user_id,read_at)
whatsapp_messages (id PK, jid, message, media_url, status ENUM,
                   direction ENUM, session, wa_message_id, error)  IDX(jid,status)
```

## Assessment
```
exams (id PK, uuid UQ, course_id FK, session_id FK, title, description,
       duration_min, pass_score, start_at, end_at, is_published)
questions (id PK, exam_id FK, type ENUM(mcq,truefalse,essay),
           text, options JSON, correct_answer, points)  IDX(exam_id)
exam_attempts (id PK, uuid UQ, exam_id FK, user_id FK, started_at,
               submitted_at, score, max_score, status ENUM, certificate_id)  IDX(exam,user)
exam_answers (id PK, attempt_id FK, question_id FK, answer, is_correct,
              points)                                  UQ(attempt_id,question_id)
homework (id PK, uuid UQ, course_id FK, session_id FK, teacher_id FK,
          title, description, due_at, max_score)       IDX(teacher)
homework_submissions (id PK, homework_id FK, user_id FK, file_id FK,
                      content, submitted_at, score, feedback, status ENUM)  UQ(homework,user)
```

## Files & Audit
```
files (id PK, uuid UQ, uploader_id FK, entity_type, entity_id,
       original_name, stored_name, mime, size, url, storage_disk)  IDX(uploader,entity)
audit_logs (id PK, user_id, action, entity_type, entity_id,
            before JSON, after JSON, ip, user_agent)   IDX(user,action,entity)
```

## Key relationships (summary)
- user 1—1 wallet 1—N transactions
- teacher 1—N sessions ; session N—1 subject
- session 1—N enrollments / attendance / recordings
- session 1—N (via enrollment) students
- exam 1—N questions ; exam 1—N attempts 1—N answers
- homework 1—N submissions
