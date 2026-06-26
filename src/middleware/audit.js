const asyncHandler = require('../utils/asyncHandler');
const { AuditLog } = require('../models');

/**
 * Lightweight audit logger. Call req.audit(action, entity, before, after) in controllers,
 * OR use as middleware for mutating routes.
 */
const auditMiddleware = (action, entityTypeResolver) =>
  asyncHandler(async (req, _res, next) => {
    req.audit = (act, entity, before, after) =>
      AuditLog.create({
        user_id: req.user ? req.user.id : null,
        action: act,
        entity_type: entity ? entity.type : null,
        entity_id: entity ? entity.id : null,
        before: before || null,
        after: after || null,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
    if (action) {
      const type = typeof entityTypeResolver === 'function' ? entityTypeResolver(req) : entityTypeResolver;
      req._audit = { action, type };
    }
    next();
  });

module.exports = auditMiddleware;
