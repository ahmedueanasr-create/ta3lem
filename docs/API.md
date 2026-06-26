# API Reference — `/api/v1`

All protected routes require `Authorization: Bearer <accessToken>`.

## Auth
| Method | Path | Role | Description |
|---|---|---|---|
| POST | /auth/register | public | register (student/teacher/supervisor) |
| POST | /auth/login | public | login → access+refresh |
| POST | /auth/refresh | public | rotate refresh token |
| POST | /auth/logout | auth | blacklist tokens |
| GET | /auth/me | auth | current user + role + permissions |

## Users (admin/supervisor)
GET /users · GET /users/:id · PUT /users/:id · PATCH /users/:id/status · DELETE /users/:id

## Teachers
GET /teachers · GET /teachers/:id · POST /teachers/:id/approve · POST /teachers/:id/reject · PUT /teachers/:id/pricing

## Subjects
GET /subjects · POST /subjects (admin) · PUT /subjects/:id (admin)

## Wallet
GET /wallet · GET /wallet/history · POST /wallet/charge

## Sessions (live classes)
GET /sessions · GET /sessions/:id · POST /sessions (teacher) ·
POST /sessions/:id/start (teacher) · POST /sessions/:id/end (teacher) ·
POST /sessions/:id/join (student) · POST /sessions/:id/enroll (student) ·
POST /sessions/:id/cancel

## Notifications
GET /notifications · PATCH /notifications/:id/read · POST /notifications/read-all

## WhatsApp
GET /whatsapp/status · POST /whatsapp/send · POST /whatsapp/broadcast · GET /whatsapp/messages

## Exams
GET /exams · GET /exams/:id · POST /exams (teacher) · POST /exams/:id/publish ·
POST /exams/:id/attempts (student) · POST /exams/attempts/:attemptId/submit

## Homework
GET /homework · GET /homework/:id · POST /homework (teacher) ·
POST /homework/:id/submit (student) · POST /homework/submissions/:id/grade

## Files
POST /files/upload (multipart) · GET /files

## Reports (admin/supervisor)
GET /reports/platform · GET /reports/revenue · GET /reports/top-subjects ·
GET /reports/teacher/:id · GET /reports/student/:id

## Realtime — Socket.io (`/socket`)
Events (client → server): `session:join`, `chat:message`, `hand:raise`, `hand:lower`, `screen:share`, `whiteboard:draw`
Events (server → client): `session:joined`, `presence:join`, `chat:message`, `hand:raised`, `hand:lowered`, `screen:share`, `whiteboard:draw`, `error`

## Standard response envelope
```json
{ "success": true, "data": {...}, "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 } }
```
Errors: `{ "success": false, "message": "...", "details": [...] }`
