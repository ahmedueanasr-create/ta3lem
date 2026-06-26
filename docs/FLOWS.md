# Core Flows

## 1. Authentication Flow
```
register → create user + role profile + wallet (status=pending for teacher)
login    → verify bcrypt → sign access(15m)+refresh(7d) → return
me       → verify access (Redis blacklist) → load user+role+permissions
refresh  → verify refresh → blacklist old jti → issue new pair (rotation)
logout   → blacklist access+refresh jti (TTL = token exp)
```

## 2. Wallet Flow
```
charge(userId, amount)  → SELECT FOR UPDATE wallet → balance+=amount → insert transaction(charge)
deduct(userId, amount)  → SELECT FOR UPDATE wallet
                        → IF balance < amount → 402 Insufficient balance
                        → balance-=amount → insert transaction(deduct)
refund                  → charge with type=refund
history                 → paginated transactions by wallet
```
All mutations inside `sequelize.transaction` with row locks → no race conditions on concurrent joins.

## 3. Live Session Flow
```
teacher: POST /sessions            → create row, room_name=uuid
teacher: POST /sessions/:id/start  → LiveProvider.createRoom()
                                   → if recording_enabled: provider.startRecording() → record row
                                   → session.status=live, started_at=now
                                   → notify enrolled students (inapp+push+whatsapp)
                                   → return LiveKit token (teacher grant)
student: POST /sessions/:id/join   → load session
                                   → IF not enrolled AND price>0:
                                       check balance >= price
                                       deduct (transactional)
                                       create enrollment (tx ref)
                                   → upsert attendance (joined_at, present)
                                   → return LiveKit token (student grant)
teacher: POST /sessions/:id/end    → close all open attendance (left_at, duration, pct)
                                   → recording.status=processing
                                   → session.status=ended
                                   → notify students recording available
teacher: cancel                    → session.status=cancelled → refund all enrollments
```

## 4. Attendance & Recording
- On join: `SessionAttendance` row with `joined_at`.
- On end: compute `duration_sec` and `attendance_pct = min(100, dur/(duration_min*60)*100)`.
- Recording started at session start; LiveKit Egress writes MP4 to `storage/recordings/`; row finalized to `ready` when Egress completes (webhook handler to be added).

## 5. WhatsApp Flow
```
boot            → Baileys makeWASocket + useMultiFileAuthState → QR in terminal
                → on open: isConnected=true; on close: auto-reconnect (unless logged out)
notify()        → channels includes 'whatsapp' && phone
                → waService.send → insert whatsapp_messages(queued)
                → if ready: sock.sendMessage → update sent; else stays queued (worker retries)
broadcast       → loop send with small delays (rate-safe)
inbound         → messages.upsert → store direction=in
```

## 6. Notification Flow (cron-driven)
```
every 1 min:
  find scheduled sessions starting in [13m,17m] → if Redis flag absent →
    notify each enrolled user (inapp+push+whatsapp) → set flag rem:15
every 1 min:
  find scheduled sessions starting in [1m,3m] → if flag absent →
    notify (inapp+push+whatsapp) → set flag rem:2
on session start  → instant "session_started" to enrolled
on session end    → instant "session_ended + recording ready"
```
Redis `NX EX` flags guarantee exactly-once reminder per session.

## 7. Exam Flow
```
teacher creates exam + questions (mcq/truefalse/essay, correct_answer, points)
publish → student POST /attempts → in_progress row
submit answers → for mcq/truefalse auto-grade; essay left for manual
              → score = earned/maxPoints*100
              → passed = score>=pass_score → certificate_id = `CERT-<attempt uuid>`
```

## 8. Homework Flow
```
teacher create homework (due_at, max_score)
student submit (content / file_id) → one submission per student
teacher grade (score, feedback) → status=graded
```
