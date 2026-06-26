const { Server } = require('socket.io');
const logger = require('../config/logger');
const JwtService = require('../utils/jwt');
const { Session, SessionEnrollment } = require('../models');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    path: '/socket',
  });

  // auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);
    if (!token) return next(new Error('auth_required'));
    try {
      const decoded = JwtService.verifyAccess(token);
      socket.userId = decoded.sub;
      socket.role = decoded.role;
      next();
    } catch (e) {
      next(new Error('invalid_token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`socket connected: user=${socket.userId}`);

    socket.on('session:join', async ({ sessionId }) => {
      try {
        const session = await Session.findByPk(sessionId);
        if (!session) return socket.emit('error', { message: 'session_not_found' });

        // verify enrollment for students
        if (socket.role === 'student') {
          const enrolled = await SessionEnrollment.findOne({
            where: { session_id: sessionId, user_id: socket.userId },
          });
          if (!enrolled) return socket.emit('error', { message: 'not_enrolled' });
        }

        const room = `session:${sessionId}`;
        socket.join(room);
        socket.to(room).emit('presence:join', { userId: socket.userId, ts: Date.now() });
        socket.emit('session:joined', { room });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('chat:message', async ({ sessionId, text }) => {
      if (!text || text.length > 2000) return;
      const room = `session:${sessionId}`;
      io.to(room).emit('chat:message', {
        userId: socket.userId,
        text,
        ts: Date.now(),
      });
    });

    socket.on('hand:raise', ({ sessionId }) => {
      const room = `session:${sessionId}`;
      socket.to(room).emit('hand:raised', { userId: socket.userId, ts: Date.now() });
    });

    socket.on('hand:lower', ({ sessionId }) => {
      const room = `session:${sessionId}`;
      socket.to(room).emit('hand:lowered', { userId: socket.userId });
    });

    socket.on('screen:share', ({ sessionId, active }) => {
      const room = `session:${sessionId}`;
      socket.to(room).emit('screen:share', { userId: socket.userId, active });
    });

    socket.on('whiteboard:draw', ({ sessionId, data }) => {
      const room = `session:${sessionId}`;
      socket.to(room).emit('whiteboard:draw', { userId: socket.userId, data });
    });

    socket.on('disconnect', () => {
      logger.debug(`socket disconnected: user=${socket.userId}`);
    });
  });

  return io;
}

module.exports = initSocket;
