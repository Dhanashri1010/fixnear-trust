import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Provider } from '../models/Provider.js';
import { Upload } from '../models/Upload.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { isValidKycPublicId } from '../utils/documentStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Scans all providers for unvalidated KYC public IDs or missing Upload records.
 * Clears invalid fields, sets provider status to 'needs_info', logs an audit entry,
 * and prints a clean summary.
 */
export const fixKycPaths = async () => {
  const providers = await Provider.find({
    $or: [
      { idProofPublicId: { $exists: true, $ne: '' } },
      { certificatePublicId: { $exists: true, $ne: '' } },
    ],
  });

  // Find admin user for AuditLog or fallback to system admin
  let adminUser = await User.findOne({ role: 'admin' });
  const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
  const adminName = adminUser ? adminUser.name : 'System Security Cleanup';
  const adminEmail = adminUser ? adminUser.email : 'security@fixnear.com';

  const totalInspected = providers.length;
  let fixedCount = 0;
  let validCount = 0;

  console.log(`[fix-kyc-paths] Inspecting ${totalInspected} provider(s)...`);

  for (const provider of providers) {
    let needsUpdate = false;
    const clearedFields = [];

    // Check idProofPublicId
    if (provider.idProofPublicId) {
      const isValid = isValidKycPublicId(provider.idProofPublicId, provider.userId);
      const uploadDoc = isValid ? await Upload.findOne({ publicId: provider.idProofPublicId, userId: provider.userId }) : null;

      if (!isValid || !uploadDoc) {
        needsUpdate = true;
        clearedFields.push({
          field: 'idProofPublicId',
          value: provider.idProofPublicId,
          reason: !isValid ? 'Failed format validation' : 'Missing Upload record',
        });
        provider.idProofPublicId = '';
        provider.idProofUrl = '';
      }
    }

    // Check certificatePublicId
    if (provider.certificatePublicId) {
      const isValid = isValidKycPublicId(provider.certificatePublicId, provider.userId);
      const uploadDoc = isValid ? await Upload.findOne({ publicId: provider.certificatePublicId, userId: provider.userId }) : null;

      if (!isValid || !uploadDoc) {
        needsUpdate = true;
        clearedFields.push({
          field: 'certificatePublicId',
          value: provider.certificatePublicId,
          reason: !isValid ? 'Failed format validation' : 'Missing Upload record',
        });
        provider.certificatePublicId = '';
        provider.certificateUrl = '';
      }
    }

    if (needsUpdate) {
      const prevStatus = provider.status;
      provider.status = 'needs_info';
      provider.rejectionReason = 'Please re-upload your verification documents to ensure file safety.';
      await provider.save();

      await AuditLog.create({
        adminId,
        adminName,
        adminEmail,
        action: 'FIX_KYC_PATHS_CLEANUP',
        targetType: 'provider',
        targetId: String(provider._id),
        details: {
          clearedFields,
          previousStatus: prevStatus,
          newStatus: 'needs_info',
          reason: 'KYC path traversal security fix: invalidated unverified publicIds',
        },
      });

      fixedCount++;
      console.log(`[fix-kyc-paths] Updated provider ${provider._id} (${provider.email}): cleared ${clearedFields.map((f) => f.field).join(', ')}`);
    } else {
      validCount++;
    }
  }

  const summary = {
    totalInspected,
    fixedCount,
    validCount,
  };

  console.log('=============================================');
  console.log('KYC Path Cleanup Summary:');
  console.log(`Total inspected: ${summary.totalInspected}`);
  console.log(`Providers updated (needs_info): ${summary.fixedCount}`);
  console.log(`Providers valid: ${summary.validCount}`);
  console.log('=============================================');

  return summary;
};

// Direct script execution
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
  console.log(`[fix-kyc-paths] Connecting to MongoDB: ${mongoUri}...`);
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await fixKycPaths();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[fix-kyc-paths] Error running script:', err);
      process.exit(1);
    });
}
