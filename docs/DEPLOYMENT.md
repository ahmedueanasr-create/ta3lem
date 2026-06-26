# Production Deployment Plan

## Target topology (100k concurrent)
```
              ┌──────────────┐
              │   Cloudflare │ (CDN, WAF, DDoS)
              └──────┬───────┘
        ┌────────────┴────────────┐
        ▼                         ▼
   NGINX / ALB (TLS, sticky)   LiveKit cluster (SFU + TURN)
        ▼
   Node API × N (PM2 / containers)   ← stateless
   ├── Redis Cluster (cache, blacklist, pub/sub, queue)
   ├── MySQL Primary + N Read Replicas
   ├── S3 / MinIO (uploads + recordings)
   └── Baileys WhatsApp worker (×1, single session)
```

## Environment
- Set `NODE_ENV=production`, strong random JWT secrets, `DB_LOGGING=false`.
- `LIVE_PROVIDER=livekit` with real LiveKit host/key/secret.
- `WA_ENABLED=true` with persistent session volume.
- Object storage: replace local `storage/` with S3 presigned URLs (swap multer storage + recording path).

## Database
- `mysql_tune`: innodb_buffer_pool_size ~70% RAM, utf8mb4, connection limit > pool_max×N.
- Migrations via CI: `sequelize-cli db:migrate` on deploy; never `sync({alter})` in prod.
- Daily logical backup + binlog PITR; read replicas for reports.

## App
- Containerize (Dockerfile provided). Run behind PM2 or k8s (2+ replicas).
- Health check `/health`; readiness = DB + Redis reachable.
- Graceful shutdown on SIGTERM (closes HTTP, sockets, DB pool).
- Secrets via env / secret manager (never in repo).

## Realtime at scale
- Socket.io `@socket.io/redis-adapter` so messages broadcast across instances.
- Sticky sessions at LB for the websocket upgrade.

## Media
- LiveKit: deploy own cluster with autoscaling; Node only mints tokens (cheap).
- Recording: LiveKit Egress → S3; webhook → `POST /internal/recordings/ready` to finalize row.

## WhatsApp
- Single Baileys worker instance (one phone number). Pair once; persist auth in a mounted volume.
- Send via BullMQ queue with per-recipient throttle and exponential backoff.

## Security checklist
- TLS everywhere; HSTS; helmet; strict CORS to frontend origin.
- Rate limit (global + auth + per-route).
- JWT rotation + Redis blacklist with TTL.
- Audit logs retained 90+ days; immutable (append-only).
- Backups encrypted; secrets rotated.

## CI/CD
1. lint → test → build → docker image → push registry.
2. migrate on staging → smoke tests → promote to prod.
3. Blue/green or rolling with health-gate.

## Monitoring
- Prometheus metrics (request latency, errors, socket connections, wallet tx count).
- Grafana dashboards; alert on error rate, DB lag, Redis memory, LiveKit rooms.
- Winston → Loki/ELK for structured logs.

## Quick prod run (single host)
```bash
docker-compose up -d mysql redis livekit
npm run db:migrate && npm run db:seed
NODE_ENV=production node src/server.js
# frontend: build and serve dist/ via nginx
```
