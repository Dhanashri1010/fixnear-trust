import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Provider } from '../models/Provider.js';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Setting } from '../models/Setting.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/providers (public: verified only, filter by service, city, rating)
export const getProviders = async (req, res, next) => {
  try {
    const { service, category, city, minRating } = req.query;

    const filter = { status: 'approved' };

    if (city) {
      filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
    }

    if (category || service) {
      const catVal = category || service;
      const catRegex = new RegExp(escapeRegex(catVal), 'i');
      filter.$or = [
        { 'skills.categoryId': catVal },
        { 'skills.categoryName': catRegex },
        { specialty: catRegex },
      ];
    }

    if (minRating) {
      filter.ratingAvg = { $gte: Number(minRating) };
    }

    const providers = await Provider.find(filter)
      .select('-adminNotes -rejectionReason')
      .sort({ ratingAvg: -1, jobsDone: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/:id (public profile with reviews)
export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const provider = await Provider.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        ...(isObjectId ? [{ userId: id }] : []),
      ],
      status: 'approved',
    }).select('-adminNotes -rejectionReason');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Verified provider profile not found.',
      });
    }

    // Fetch public reviews for this provider
    const reviews = await Review.find({ providerId: provider._id, isHidden: false })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      provider,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/me (provider console: profile, live calculated earnings, ratings)
export const getMyProviderProfile = async (req, res, next) => {
  try {
    let provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      provider = await Provider.create({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        city: req.user.city || 'Mumbai',
        status: 'take_skill_test',
        isOnline: false,
      });
    }

    // Calculate real earnings from completed bookings
    const completedBookings = await Booking.find({
      providerId: provider._id,
      status: 'COMPLETED',
    });

    const settings = await Setting.getSettings();
    const commissionPercent = settings.platformCommissionPercent || 10;
    const fee = settings.platformFee || 20;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let earningsToday = 0;
    let earningsWeek = 0;
    let earningsMonth = 0;

    completedBookings.forEach((b) => {
      const gross = b.invoice?.totalAmount || b.basePrice || 0;
      // Net provider earning = gross minus platform commission & platform fee
      const net = Math.max(0, Math.round(gross * (1 - commissionPercent / 100) - fee));
      const jobDate = b.updatedAt || b.createdAt;

      if (jobDate >= todayStart) earningsToday += net;
      if (jobDate >= weekAgo) earningsWeek += net;
      if (jobDate >= monthAgo) earningsMonth += net;
    });

    provider.earningsToday = earningsToday;
    provider.earningsWeek = earningsWeek;
    provider.earningsMonth = earningsMonth;
    provider.jobsDone = completedBookings.length;
    await provider.save();

    const reviews = await Review.find({ providerId: provider._id, isHidden: false })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      provider,
      reviews,
      settings: {
        platformFee: fee,
        commissionPercent,
      },
      earnings: {
        today: earningsToday,
        week: earningsWeek,
        month: earningsMonth,
        totalJobs: completedBookings.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/providers/register (3-step provider onboarding)
export const registerProviderProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      city,
      serviceArea,
      specialty,
      categoryId,
      categoryName,
      experienceYears,
      idProofUrl,
      idProofPublicId,
      idProofResourceType,
      certificateUrl,
      certificatePublicId,
      certificateResourceType,
    } = req.body;

    // Fix 5: Validate publicIds belong to user's private folder
    const userFolderPrefix = `fixnear_kyc_private/${req.user._id}/`;
    if (idProofPublicId && !idProofPublicId.startsWith(userFolderPrefix)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID proof publicId. Document must be stored in your private folder '${userFolderPrefix}'.`,
      });
    }

    if (certificatePublicId && !certificatePublicId.startsWith(userFolderPrefix)) {
      return res.status(400).json({
        success: false,
        message: `Invalid certificate publicId. Document must be stored in your private folder '${userFolderPrefix}'.`,
      });
    }

    let provider = await Provider.findOne({ userId: req.user._id });

    const resolvedIdProofType =
      idProofResourceType ||
      (idProofUrl?.toLowerCase().includes('.pdf') || idProofPublicId?.toLowerCase().endsWith('.pdf') ? 'raw' : 'image');

    const resolvedCertType =
      certificateResourceType ||
      (certificateUrl?.toLowerCase().includes('.pdf') || certificatePublicId?.toLowerCase().endsWith('.pdf') ? 'raw' : 'image');

    const updateFields = {
      name: (name || req.user.name).trim(),
      phone: (phone || req.user.phone || '').trim(),
      city: (city || req.user.city || 'Mumbai').trim(),
      serviceArea: (serviceArea || '').trim(),
      specialty: specialty || categoryName || 'General Maintenance & Repairs',
      experienceYears: Number(experienceYears) || 3,
      idProofUrl: idProofUrl || '',
      idProofPublicId: idProofPublicId || '',
      idProofResourceType: resolvedIdProofType,
      certificateUrl: certificateUrl || '',
      certificatePublicId: certificatePublicId || '',
      certificateResourceType: resolvedCertType,
    };

    if (categoryId) {
      const existingSkills = provider ? provider.skills || [] : [];
      const skillIdx = existingSkills.findIndex((s) => s.categoryId === categoryId);
      if (skillIdx >= 0) {
        existingSkills[skillIdx].categoryName = categoryName || existingSkills[skillIdx].categoryName;
      } else {
        existingSkills.push({
          categoryId,
          categoryName: categoryName || specialty || 'Maintenance',
          passed: false,
          testScore: 0,
        });
      }
      updateFields.skills = existingSkills;
    }

    if (provider) {
      const hasPassedSkill = provider.skills?.some((s) => s.passed);
      if (provider.status === 'rejected' || provider.status === 'more_info_needed') {
        updateFields.status = hasPassedSkill ? 'waiting_for_approval' : 'take_skill_test';
        updateFields.rejectionReason = '';
      }
      provider = await Provider.findOneAndUpdate({ userId: req.user._id }, { $set: updateFields }, { new: true });
    } else {
      updateFields.userId = req.user._id;
      updateFields.email = req.user.email;
      updateFields.status = 'take_skill_test';
      provider = await Provider.create(updateFields);
    }

    res.status(200).json({
      success: true,
      message: 'Provider profile registered successfully.',
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/providers/me/status (Big Online/Offline switch)
export const updateProviderStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    if (provider.status !== 'approved') {
      const statusWords = {
        take_skill_test: 'Take the skill test',
        waiting_for_approval: 'Waiting for approval',
        rejected: 'Not approved',
        suspended: 'Suspended',
      };
      const displayStatus = statusWords[provider.status] || provider.status.replace(/_/g, ' ');
      return res.status(403).json({
        success: false,
        message: `Your account is currently "${displayStatus}". Only verified technicians can go online and receive jobs.`,
      });
    }

    provider.isOnline = Boolean(isOnline);
    await provider.save();

    res.status(200).json({
      success: true,
      message: `Status set to ${provider.isOnline ? 'Online' : 'Offline'}.`,
      isOnline: provider.isOnline,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/documents/:type (Private signed URL generation for ID proof & certificates)
export const getPrivateDocumentSignedUrl = async (req, res, next) => {
  try {
    const { type } = req.params; // 'idProof' or 'certificate'
    const providerId = req.query.providerId;

    let provider;
    if (req.user.role === 'admin' && providerId) {
      provider = await Provider.findById(providerId);
    } else {
      provider = await Provider.findOne({ userId: req.user._id });
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const publicIdField = type === 'certificate' ? 'certificatePublicId' : 'idProofPublicId';
    const urlField = type === 'certificate' ? 'certificateUrl' : 'idProofUrl';
    const resourceTypeField = type === 'certificate' ? 'certificateResourceType' : 'idProofResourceType';

    const publicId = provider[publicIdField];
    const rawUrl = provider[urlField];
    const resourceType = provider[resourceTypeField] || (rawUrl?.toLowerCase().includes('.pdf') ? 'raw' : 'image');

    if (!publicId && !rawUrl) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    let signedUrl = rawUrl;
    if (publicId && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        signedUrl = cloudinary.url(publicId, {
          sign_url: true,
          type: 'authenticated',
          resource_type: resourceType,
          expires_at: Math.floor(Date.now() / 1000) + 600, // 10 minutes expiry
        });
      } catch (signErr) {
        signedUrl = rawUrl;
      }
    } else if (publicId && publicId.startsWith('fixnear_kyc_private/')) {
      // Local dev/test fallback
      signedUrl = `/api/providers/documents/${type}/file${req.user.role === 'admin' && providerId ? `?providerId=${providerId}` : ''}`;
    }

    res.status(200).json({
      success: true,
      type,
      signedUrl,
      resourceType,
      expiresInSeconds: 600,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/documents/:type/file (Serves local private file if stored on disk)
export const servePrivateDocumentFile = async (req, res, next) => {
  try {
    const { type } = req.params;
    const providerId = req.query.providerId;

    let provider;
    if (req.user.role === 'admin' && providerId) {
      provider = await Provider.findById(providerId);
    } else {
      provider = await Provider.findOne({ userId: req.user._id });
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const isCert = type === 'certificate';
    const publicId = isCert ? provider.certificatePublicId : provider.idProofPublicId;

    if (!publicId) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const relativePath = publicId.replace(/^fixnear_kyc_private\//, '');
    const localDiskPath = path.resolve(__dirname, '../uploads-private', relativePath);

    if (!fs.existsSync(localDiskPath)) {
      return res.status(404).json({ success: false, message: 'Local document file not found.' });
    }

    const ext = path.extname(localDiskPath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(localDiskPath)}"`);
    return res.sendFile(localDiskPath);
  } catch (err) {
    next(err);
  }
};
