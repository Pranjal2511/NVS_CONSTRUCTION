import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const logAudit = async ({ userId, action, resource, resourceId, req, details }) => {
  const entry = {
    userId,
    action,
    resource,
    resourceId,
    ip: req?.ip || req?.headers?.['x-forwarded-for'],
    userAgent: req?.headers?.['user-agent'],
    details,
  };

  logger.audit(action, { userId, resource, resourceId });
  try {
    await AuditLog.create(entry);
  } catch (err) {
    logger.error('Failed to persist audit log', { message: err.message });
  }
};
