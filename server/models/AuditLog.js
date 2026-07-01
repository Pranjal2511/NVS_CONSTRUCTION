import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String },
    resourceId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.set('toJSON', jsonOptions);
auditLogSchema.set('toObject', jsonOptions);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
