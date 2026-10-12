import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const logAudit = async ({ userId, action, resource, resourceId, req, details }) => {
  // Normalize ObjectId to a plain string so logs and DB entries are human-readable
  const normalizedUserId = userId?.toString ? userId.toString() : userId;

  const entry = {
    userId: normalizedUserId,
    action,
    resource,
    resourceId: resourceId?.toString ? resourceId.toString() : resourceId,
    ip: req?.ip || req?.headers?.['x-forwarded-for'],
    userAgent: req?.headers?.['user-agent'],
    details,
  };

  logger.audit(action, { userId: normalizedUserId, resource, resourceId });
  try {
    await AuditLog.create(entry);
  } catch (err) {
    logger.error('Failed to persist audit log', { message: err.message });
  }
};
