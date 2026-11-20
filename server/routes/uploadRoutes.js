import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  detectFileTypeFromBuffer,
  isCloudinaryConfigured,
  resolveLocalKycPath,
} from '../utils/documentStorage.js';
import { Upload } from '../models/Upload.js';

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
const privateDocMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

    if (allowedMimes.includes(file.mimetype) && (ext ? allowedExts.includes(ext) : true)) {
      cb(null, true);
    } else {
      const err = new Error('Please upload a JPG, PNG, WebP or PDF file.');
      err.code = 'FILE_TYPE_NOT_ALLOWED';
      cb(err);
    }
  },
});

// Multer error handling wrapper middleware for private document upload
const handlePrivateDocUpload = (req, res, next) => {
  privateDocMulter.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            code: 'FILE_TOO_LARGE',
            message: 'This file is bigger than 5 MB. Please choose a smaller file.',
          });
        }
        return res.status(400).json({
          success: false,
          code: 'FILE_UNEXPECTED_FIELD',
          message: err.message || 'Unexpected upload field received.',
        });
      }
      return res.status(400).json({
        success: false,
        code: 'FILE_TYPE_NOT_ALLOWED',
        message: 'Please upload a JPG, PNG, WebP or PDF file.',
      });
    }
    next();
  });
};

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
router.post(
  '/upload/private',
  authenticate,
  authorize('provider', 'admin'),
  handlePrivateDocUpload,
  async (req, res, next) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          code: 'NO_FILE_UPLOADED',
          message: 'No file uploaded.',
        });
      }

      // Verify file content via magic numbers
      const detectedType = detectFileTypeFromBuffer(req.file.buffer);
      if (!detectedType) {
        return res.status(400).json({
          success: false,
          code: 'FILE_TYPE_NOT_ALLOWED',
          message: 'Please upload a JPG, PNG, WebP or PDF file.',
        });
      }

      // Verify claimed type vs content inspection
      const normalizedClaimedMime = req.file.mimetype === 'image/jpg' ? 'image/jpeg' : req.file.mimetype;
      const isClaimedPdf = normalizedClaimedMime === 'application/pdf';
      const isDetectedPdf = detectedType === 'application/pdf';

      if (isClaimedPdf !== isDetectedPdf) {
        return res.status(400).json({
          success: false,
          code: 'FILE_TYPE_NOT_ALLOWED',
          message: 'Please upload a JPG, PNG, WebP or PDF file.',
        });
      }

      const isPdf = isDetectedPdf;
      const resourceType = isPdf ? 'raw' : 'image';
      const contentType = isPdf ? 'pdf' : 'image';
      const ext = isPdf
        ? '.pdf'
        : detectedType === 'image/png'
        ? '.png'
        : detectedType === 'image/webp'
        ? '.webp'
        : '.jpg';

      const userFolder = `fixnear_kyc_private/${req.user._id}`;
      const docType = req.body?.docType === 'certificate' ? 'certificate' : 'idProof';

      if (!isCloudinaryConfigured()) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            success: false,
            message: 'Private document upload storage is not configured in production.',
          });
        }

        // Development / Test local storage: store under server/uploads-private/<userId>/
        const filename = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        const publicId = `${userFolder}/${filename}`;

        // Rebuild safely and resolve boundary
        const filePath = resolveLocalKycPath(publicId, req.user._id);
        const userDir = path.dirname(filePath);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        fs.writeFileSync(filePath, req.file.buffer);

        // Record ownership in Upload collection
        await Upload.create({
          userId: req.user._id,
          publicId,
          resourceType,
          contentType,
        });

        return res.status(200).json({
          success: true,
          publicId,
          resourceType,
          contentType,
          url: `/api/providers/documents/${docType}/file`,
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
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // Record ownership in Upload collection
      await Upload.create({
        userId: req.user._id,
        publicId: result.public_id,
        resourceType,
        contentType,
      });

      res.status(200).json({
        success: true,
        publicId: result.public_id,
        resourceType,
        contentType,
        url: result.secure_url,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
