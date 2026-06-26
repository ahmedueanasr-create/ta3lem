# Development Roadmap

## Phase 0 — Foundation ✅ (done)
- Modular architecture, config, logger, MySQL/Sequelize, Redis
- 26 models + migration + seeders (roles, permissions, admin)
- Auth (JWT access+refresh, rotation, blacklist), RBAC middleware
- Wallet (transactional charge/deduct/refund, history)
- Sessions (create/start/join/end/cancel), attendance, recordings rows
- Notifications service + cron (15m/2m reminders)
- WhatsApp (Baileys) + provider abstraction
- Live streaming provider interface (LiveKit + Agora adapters)
- Socket.io realtime (chat, hand, presence, whiteboard, screen-share)
- Exams (auto-grade + certificates), Homework, Files, Reports, Audit
- Frontend: landing, auth, dashboard, wallet, live room, dark/light

## Phase 1 — Production hardening (1–2 weeks)
- BullMQ queue for WhatsApp + push (retry/backoff, throttling)
- Recording-ready webhook from LiveKit Egress → finalize recording row + URL
- Push (FCM/APN) worker consuming `push:notify` Redis channel
- Email channel (nodemailer + templates) for notifications
- CSRF token cookie flow for browser clients
- Swagger/OpenAPI generation for all routes
- Unit + integration tests (jest + supertest), CI workflow

## Phase 2 — Scale & media (2–3 weeks)
- Socket.io Redis adapter for multi-instance broadcast
- MySQL read replicas + Sequelize read/write replication
- S3/MinIO storage for uploads + recordings (storage_disk switch)
- CDN in front of recordings & frontend build
- LiveKit cluster deployment + TURN servers
- Rate limiting per-user (rate-limiter-flexible on Redis)
- Horizontal scaling test (k6 load tests targeting 100k)

## Phase 3 — Platform features (3–6 weeks)
- Subscriptions (monthly/yearly) auto-charge via wallet
- Coupon / promo system
- Multi-tenant (schools) isolation
- Advanced analytics dashboard (charts, exports)
- Parent portal (guardian view of student)
- In-app payments (Fawry / Stripe / Paymob) → wallet top-up
- Certificate PDF generation
- Whiteboard persistence (yjs / tldraw server)
- Mobile app (React Native reusing REST + socket)

## Phase 4 — Enterprise ops
- Centralized logging (ELK / Loki)
- APM (Prometheus + Grafana)
- Blue/green deployment, DB migrations CI
- Backup & PITR strategy for MySQL
- SOC2 / data-residency compliance controls
