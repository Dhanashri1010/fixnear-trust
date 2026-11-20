import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * @param {string} publicId
 * @param {string} resourceType
 */
export const deletePrivateDocument = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  try {
    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType === 'raw' ? 'raw' : 'image',
        type: 'authenticated',
      });
    } else {
      // Local private storage: publicId is "fixnear_kyc_private/<userId>/filename.ext"
      const relativePath = publicId.replace(/^fixnear_kyc_private\//, '');
      const localDiskPath = path.resolve(__dirname, '../uploads-private', relativePath);
      if (fs.existsSync(localDiskPath)) {
        fs.unlinkSync(localDiskPath);
      }
    }
  } catch (err) {
    console.error(`[deletePrivateDocument] Failed to delete document '${publicId}':`, err.message);
  }
};
