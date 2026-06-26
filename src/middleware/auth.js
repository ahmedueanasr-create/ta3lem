const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const JwtService = require('../utils/jwt');
const { redis } = require('../config/redis');
const { User, Role } = require('../models');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) token = req.query.token || null;
  if (!token) throw new ApiError(401, 'Authentication required');

  const decoded = JwtService.verifyAccess(token);

  // check blacklist (logout / rotation) — gracefully degrade if Redis is down
  try {
    const blocked = await redis.get(`bl:${decoded.jti}`);
    if (blocked) throw new ApiError(401, 'Token revoked');
  } catch (redisErr) {
    // Redis unavailable — skip blacklist check in dev (logged in redis.js)
  }

  const user = await User.findByPk(decoded.sub, {
    include: [{ model: Role, as: 'role', include: ['permissions'] }],
  });
  if (!user) throw new ApiError(401, 'User not found');
  if (user.status !== 'active') throw new ApiError(403, 'Account is not active');

  req.user = user;
  req.tokenJti = decoded.jti;
  next();
});
