# تعليم (ta3lem) — Enterprise Educational Platform

منصة تعليمية احترافية متكاملة قابلة للتوسع (Node.js + MySQL + React)، مبنية ببنية Modular Architecture قابلة لخدمة أكثر من 100,000 مستخدم متزامن.

## Quick start

### Backend
```bash
cp .env.example .env
npm install
# MySQL & Redis must be running (docker-compose up -d mysql redis)
npx sequelize-cli db:migrate --config src/config/sequelize.js
npx sequelize-cli db:seed:all   --config src/config/sequelize.js
npm run dev    # http://localhost:4000
```
Default admin: `admin@ta3lem.local` / `Admin@12345`

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev    # http://localhost:3000
```

### Stack (docker-compose)
MySQL 8 · Redis 7 · LiveKit · Node API.

## Folder structure
```
src/
  config/        # env, db, redis, logger, sequelize-cli
  core/          # express app, error handling
  middleware/    # auth, rbac, rate-limit, validate, audit
  models/        # 26 Sequelize models + associations
  migrations/    # SQL migrations
  seeders/       # roles, permissions, admin
  modules/       # feature modules (auth, wallet, sessions, ...)
    <module>/
      *.service.js  *.controller.js  *.routes.js  *.validator.js
  providers/     # LiveProvider interface + LiveKit/Agora adapters
  realtime/      # Socket.io (chat, hand, presence, whiteboard)
  jobs/          # cron reminders (15m / 2m before session)
  utils/         # jwt, ApiError, asyncHandler, paginate, roles
  server.js      # entrypoint
frontend/        # Vite + React + Tailwind (landing, auth, dashboard, live room, wallet)
docs/            # architecture, ERD, API, flows, roadmap, deployment
```

## Roles
super_admin · platform_admin · teachers_supervisor · student_supervisor · teacher · student

See `docs/` for full architecture, ERD, API reference, flows, roadmap and deployment plan.
