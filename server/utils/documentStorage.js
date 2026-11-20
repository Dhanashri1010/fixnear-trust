import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { Upload } from '../models/Upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUploadsPrivateRoot = () => {
  return path.resolve(__dirname, '../uploads-private');
};

export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Strict validation helper for KYC document publicId.
 * Format MUST be: fixnear_kyc_private/<userId>/<filename>
 * where <filename> matches /^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|pdf)$/
 * No slashes, no dots except before extension, no '..', no encoded characters.
 *
 * @param {string} publicId
 * @param {string|mongoose.Types.ObjectId} [userId]
 * @returns {boolean}
 */
export const isValidKycPublicId = (publicId, userId = null) => {
  if (typeof publicId !== 'string' || !publicId.trim()) {
    return false;
  }
  // Reject encoded characters or backslashes
  if (publicId.includes('%') || publicId.includes('\\')) {
    return false;
  }

  // Exact pattern match: fixnear_kyc_private/<userId>/<filename>
  const match = publicId.match(/^fixnear_kyc_private\/([a-zA-Z0-9_-]+)\/([A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|pdf))$/);
  if (!match) {
    return false;
  }

  const [, extractedUserId, filename] = match;

  // Strict ownership check if userId is specified
  if (userId && extractedUserId !== String(userId)) {
    return false;
  }

  // Filename cannot contain multiple dots or directory separators
  if (filename.includes('/') || filename.includes('\\') || (filename.match(/\./g) || []).length !== 1) {
    return false;
  }

  return true;
};

/**
 * Safe path resolution for local storage.
 * Builds path strictly with path.resolve(uploadsRoot, userId, filename).
 * Verifies that the path starts with uploadsRoot + path.sep and folder name equals userId.
 * Verifies with fs.realpathSync that symlinks cannot escape the user's folder.
 *
 * @param {string} publicId
 * @param {string|mongoose.Types.ObjectId} [expectedUserId]
 * @returns {string} Fully validated absolute local disk path
 */
export const resolveLocalKycPath = (publicId, expectedUserId = null) => {
  if (!isValidKycPublicId(publicId, expectedUserId)) {
    throw new Error(`Invalid KYC document publicId: ${publicId}`);
  }

  const match = publicId.match(/^fixnear_kyc_private\/([a-zA-Z0-9_-]+)\/([A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|pdf))$/);
  const userId = match[1];
  const filename = match[2];

  if (expectedUserId && String(expectedUserId) !== userId) {
    throw new Error(`KYC document owner mismatch: expected '${expectedUserId}', got '${userId}'`);
  }

  const uploadsRoot = getUploadsPrivateRoot();
  const targetPath = path.resolve(uploadsRoot, userId, filename);
  const normalizedRoot = uploadsRoot.endsWith(path.sep) ? uploadsRoot : uploadsRoot + path.sep;

  // Verify that the resolved target path starts with uploadsRoot + path.sep
  if (!targetPath.startsWith(normalizedRoot)) {
    throw new Error(`Path traversal violation: target path '${targetPath}' is outside root '${uploadsRoot}'`);
  }

  // Verify that the folder name equals the owner's userId
  const parentFolder = path.dirname(targetPath);
  if (path.basename(parentFolder) !== userId) {
    throw new Error(`Folder name violation: expected '${userId}', got '${path.basename(parentFolder)}'`);
  }

  // If the file exists, use fs.realpathSync to verify real canonical target
  if (fs.existsSync(targetPath)) {
    const realFilePath = fs.realpathSync(targetPath);
    if (!realFilePath.startsWith(normalizedRoot)) {
      throw new Error(`Symlink traversal violation: real path '${realFilePath}' is outside root`);
    }
    const realParentFolder = path.dirname(realFilePath);
    if (path.basename(realParentFolder) !== userId) {
      throw new Error(`Symlink folder mismatch: expected '${userId}', got '${path.basename(realParentFolder)}'`);
    }
  } else if (fs.existsSync(parentFolder)) {
    // If the file doesn't exist yet, check the parent directory
    const realParentFolder = fs.realpathSync(parentFolder);
    if (!realParentFolder.startsWith(normalizedRoot) && realParentFolder !== uploadsRoot) {
      throw new Error(`Symlink directory traversal violation: '${realParentFolder}' is outside root`);
    }
    if (path.basename(realParentFolder) !== userId) {
      throw new Error(`Symlink folder mismatch: expected '${userId}', got '${path.basename(realParentFolder)}'`);
    }
  }

  return targetPath;
};

/**
 * Detect file type using magic numbers (first bytes of the buffer).
 * Supports:
 * - JPEG (FF D8 FF)
 * - PNG  (89 50 4E 47 0D 0A 1A 0A)
 * - PDF  (%PDF- -> 25 50 44 46 2D)
 * - WebP (RIFF .... WEBP -> 52 49 46 46 .... 57 45 42 50)
 *
 * @param {Buffer} buffer
 * @returns {'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' | null}
 */
export const detectFileTypeFromBuffer = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // PDF: %PDF- (25 50 44 46 2D)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return 'application/pdf';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
};

/**
 * Delete a private KYC document either from Cloudinary or from local storage.
 * Requires publicId validation and an authentic Upload record.
 *
 * @param {string} publicId
 * @param {string} resourceType
 * @param {string|mongoose.Types.ObjectId} [userId]
 */
export const deletePrivateDocument = async (publicId, resourceType = 'image', userId = null) => {
  if (!publicId) return;

  // Validate format
  if (!isValidKycPublicId(publicId, userId)) {
    console.warn(`[deletePrivateDocument] Skipped deletion: invalid publicId format '${publicId}'`);
    return;
  }

  // Look up ownership in Upload collection
  const query = { publicId };
  if (userId) {
    query.userId = userId;
  }
  const uploadDoc = await Upload.findOne(query);
  if (!uploadDoc) {
    console.warn(`[deletePrivateDocument] Skipped deletion: no Upload record found for '${publicId}'`);
    return;
  }

  try {
    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType === 'raw' ? 'raw' : 'image',
        type: 'authenticated',
      });
    } else {
      const localDiskPath = resolveLocalKycPath(publicId, uploadDoc.userId);
      if (fs.existsSync(localDiskPath)) {
        fs.unlinkSync(localDiskPath);
      }
    }
    // Delete Upload record upon successful deletion
    await Upload.deleteOne({ _id: uploadDoc._id });
  } catch (err) {
    console.error(`[deletePrivateDocument] Failed to delete document '${publicId}':`, err.message);
  }
};
