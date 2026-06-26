# System Architecture

## High-level diagram

```
            ┌───────────────┐     ┌───────────────┐
            │   Web Client  │     │  WhatsApp Srv │ (Baileys, in-process)
            │ React + Vite  │     └───────────────┘
            └───────┬───────┘
        HTTPS / WSS │ /api/v1   /socket (Socket.io)   wss (LiveKit)
                    ▼
            ┌───────────────┐   ┌─────────────┐   ┌───────────────┐
            │  Node API     │──▶│   Redis     │   │   LiveKit     │
            │  Express +    │   │ cache/queue │   │   SFU         │
            │  Socket.io    │   │ pub/sub     │   │   recording   │
            └───────┬───────┘   └─────────────┘   └───────────────┘
                    ▼
            ┌───────────────┐
            │   MySQL 8     │
            │  Sequelize    │
            └───────────────┘
```

## Principles
- **Modular architecture**: every domain is a self-contained module (`service` + `controller` + `routes` + `validator`). Cross-module communication via service imports — no controllers call other controllers.
- **Provider abstraction**: live streaming (`LiveProvider`) and WhatsApp are pluggable. Switch LiveKit↔Agora via `LIVE_PROVIDER` env.
- **Stateless API**: JWT access + refresh, blacklist via Redis → horizontally scalable behind a load balancer.
- **Realtime**: Socket.io with sticky-session / Redis adapter for multi-instance fan-out.
- **Transactional integrity**: wallet operations use row-locked DB transactions (`SELECT ... FOR UPDATE`).
- **Idempotency**: enrollments & attendance are unique-constrained; reminders guarded by Redis `NX` flags.
- **Observability**: Winston logging, structured audit logs, health endpoint.

## Scaling to 100k concurrent
1. Multiple Node instances behind NGINX/ALB (stateless JWT).
2. Socket.io with `@socket.io/redis-adapter` for cross-instance broadcast.
3. MySQL read replicas + connection pooling (pool max tuned per instance).
4. Redis Cluster for cache/queue/blacklist.
5. LiveKit horizontally scaled (its own cluster) for media — Node only issues tokens.
6. Object storage (S3/MinIO) for recordings & uploads instead of local disk in prod.
7. Queue-based WhatsApp sending (BullMQ on Redis) to throttle and retry.
8. CDN in front of frontend build + recordings.

## Modules implemented
auth, users, teachers, subjects, wallet, sessions (live), notifications, whatsapp, exams, homework, files, reports. Realtime socket, cron jobs, live providers, audit middleware.

## Security layers
JWT + refresh rotation, Redis blacklist, bcrypt(12), helmet, CORS, rate limiting (global + auth), RBAC (role+permission), audit logs, input validation (express-validator), SQL-injection-safe (Sequelize parameterized), XSS-safe (no raw HTML rendering), CSRF token for cookie-based flows (ready to enable).
