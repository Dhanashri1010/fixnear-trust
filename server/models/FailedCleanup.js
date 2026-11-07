import mongoose from 'mongoose';

const failedCleanupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
    },
    assetType: {
      type: String,
      default: 'private_document',
    },
    publicId: {
      type: String,
      default: '',
    },
    resourceType: {
      type: String,
      default: 'image',
    },
    filePath: {
      type: String,
      default: '',
    },
    storageType: {
      type: String,
      enum: ['cloudinary', 'local_disk', 'unknown'],
      default: 'unknown',
    },
    error: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING_RETRY', 'RESOLVED'],
      default: 'PENDING_RETRY',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

failedCleanupSchema.index({ status: 1 });
failedCleanupSchema.index({ userId: 1 });

export const FailedCleanup =
  mongoose.models.FailedCleanup || mongoose.model('FailedCleanup', failedCleanupSchema);
export default FailedCleanup;
