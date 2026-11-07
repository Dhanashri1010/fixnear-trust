import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({ req, action, targetType, targetId = '', details = {} }) => {
  try {
    const admin = req.user || {};
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    const entry = await AuditLog.create({
      adminId: admin._id,
      adminName: admin.name || 'Admin',
      adminEmail: admin.email || 'admin@fixnear.com',
      action,
      targetType,
      targetId: String(targetId || ''),
      details,
      ipAddress: String(ipAddress),
    });

    return entry;
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
    return null;
  }
};

export default logAudit;

