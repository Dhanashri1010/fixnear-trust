import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });

// Strictly append-only: reject all update and delete mutations
const rejectAuditMutation = function () {
  throw new Error('AuditLog is append-only and cannot be modified or deleted.');
};

auditLogSchema.pre('updateOne', rejectAuditMutation);
auditLogSchema.pre('updateMany', rejectAuditMutation);
auditLogSchema.pre('findOneAndUpdate', rejectAuditMutation);
auditLogSchema.pre('replaceOne', rejectAuditMutation);
auditLogSchema.pre('deleteOne', rejectAuditMutation);
auditLogSchema.pre('deleteMany', rejectAuditMutation);
auditLogSchema.pre('findOneAndDelete', rejectAuditMutation);
auditLogSchema.pre('findOneAndRemove', rejectAuditMutation);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

