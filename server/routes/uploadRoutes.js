import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer memory storage with 5 MB limit & image file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed.'));
    }
  },
});

// Private KYC docs (supports images and PDF up to 5 MB)
const privateDocUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files up to 5 MB are allowed.'));
    }
  },
});

const isCloudinaryConfigured = () => {
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

// POST /api/upload (up to 3 photos)
router.post('/upload', authenticate, upload.array('photos', 3), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Photo upload is not available right now.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded.',
      });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'fixnear_bookings', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      urls,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload/private (ID proof / Certificate - private/authenticated per-user folder)
router.post('/upload/private', authenticate, authorize('provider', 'admin'), privateDocUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const isPdf = req.file.mimetype === 'application/pdf';
    const resourceType = isPdf ? 'raw' : 'image';
    const ext = isPdf ? '.pdf' : path.extname(req.file.originalname) || '.jpg';
    const userFolder = `fixnear_kyc_private/${req.user._id}`;

    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          message: 'Private document upload storage is not configured in production.',
        });
      }

      // Development / Test local storage: store under server/uploads-private/<userId>/
      const userDir = path.resolve(__dirname, '../uploads-private', String(req.user._id));
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const filename = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(userDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const publicId = `${userFolder}/${filename}`;
      return res.status(200).json({
        success: true,
        publicId,
        resourceType,
        url: `/api/providers/documents/idProof/file`,
        message: 'File saved securely to local private storage.',
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: userFolder,
          type: 'authenticated', // Private authenticated asset
          resource_type: resourceType,
        },
        (error, res) => {
          if (error) return reject(error);
          resolve(res);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      publicId: result.public_id,
      resourceType,
      url: result.secure_url,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
