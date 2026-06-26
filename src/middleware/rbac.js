const ApiError = require('../utils/ApiError');

/**
 * Restrict route to one or more roles.
 * Usage: router.use(checkRole('platform_admin', 'teachers_supervisor'))
 */
const checkRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !req.user.role) return next(new ApiError(403, 'Forbidden'));
  if (!allowedRoles.includes(req.user.role.name)) {
    return next(new ApiError(403, 'Insufficient role'));
  }
  next();
};

/**
 * Restrict route to one or more permission names (checked against role.permissions).
 */
const checkPermission = (...perms) => (req, _res, next) => {
  if (!req.user || !req.user.role) return next(new ApiError(403, 'Forbidden'));
  const granted = new Set((req.user.role.permissions || []).map((p) => p.name));
  const ok = perms.every((p) => granted.has(p));
  if (!ok) return next(new ApiError(403, 'Insufficient permissions'));
  next();
};

module.exports = { checkRole, checkPermission };
