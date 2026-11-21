import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Provider } from '../models/Provider.js';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Setting } from '../models/Setting.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Upload } from '../models/Upload.js';
import { notifyUser } from './notificationController.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import {
  deletePrivateDocument,
  isValidKycPublicId,
  resolveLocalKycPath,
  isCloudinaryConfigured,
} from '../utils/documentStorage.js';
import { serializePublicProvider } from '../utils/publicProviderSerializer.js';

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
      filter.skills = {
        $elemMatch: {
          $or: [
            { categoryId: catVal },
            { categoryName: catRegex },
          ],
          passed: true,
          status: 'approved',
        },
      };
    }

    if (minRating) {
      filter.ratingAvg = { $gte: Number(minRating) };
    }

    const providers = await Provider.find(filter)
      .select('-adminNotes -rejectionReason -email -phone -idProofUrl -idProofPublicId -idProofResourceType -certificateUrl -certificatePublicId -certificateResourceType')
      .sort({ ratingAvg: -1, jobsDone: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers: providers.map((p) => serializePublicProvider(p, { includeUserId: true })),
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
    }).select('-adminNotes -rejectionReason -email -phone -idProofUrl -idProofPublicId -idProofResourceType -certificateUrl -certificatePublicId -certificateResourceType');

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
      provider: serializePublicProvider(provider, { includeUserId: true }),
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
    let earningsLifetime = 0;

    completedBookings.forEach((b) => {
      const gross = b.invoice?.totalAmount || b.basePrice || 0;
      // Net provider earning = gross minus platform commission & platform fee
      const net = Math.max(0, Math.round(gross * (1 - commissionPercent / 100) - fee));
      const jobDate = b.updatedAt || b.createdAt;

      earningsLifetime += net;
      if (jobDate >= todayStart) earningsToday += net;
      if (jobDate >= weekAgo) earningsWeek += net;
      if (jobDate >= monthAgo) earningsMonth += net;
    });

    provider.earningsToday = earningsToday;
    provider.earningsWeek = earningsWeek;
    provider.earningsMonth = earningsMonth;
    provider.earningsLifetime = earningsLifetime;
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
        lifetime: earningsLifetime,
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
      selectedCategories,
      skills: inputSkills,
      experienceYears,
      idProofUrl,
      idProofPublicId,
      idProofResourceType,
      certificateUrl,
      certificatePublicId,
      certificateResourceType,
    } = req.body;

    // Validate publicIds belong to user's private folder, match strict pattern and exist in Upload collection
    const userFolderPrefix = `fixnear_kyc_private/${req.user._id}/`;
    if (idProofPublicId) {
      if (!isValidKycPublicId(idProofPublicId, req.user._id)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_PUBLIC_ID',
          message: `Invalid ID proof publicId. Document must be stored in your private folder '${userFolderPrefix}'.`,
        });
      }
      const uploadDoc = await Upload.findOne({ publicId: idProofPublicId, userId: req.user._id });
      if (!uploadDoc) {
        return res.status(400).json({
          success: false,
          code: 'UPLOAD_NOT_FOUND',
          message: 'ID proof document upload record not found. Please upload your document again.',
        });
      }
    }

    if (certificatePublicId) {
      if (!isValidKycPublicId(certificatePublicId, req.user._id)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_PUBLIC_ID',
          message: `Invalid certificate publicId. Document must be stored in your private folder '${userFolderPrefix}'.`,
        });
      }
      const uploadDoc = await Upload.findOne({ publicId: certificatePublicId, userId: req.user._id });
      if (!uploadDoc) {
        return res.status(400).json({
          success: false,
          code: 'UPLOAD_NOT_FOUND',
          message: 'Certificate document upload record not found. Please upload your document again.',
        });
      }
    }

    let provider = await Provider.findOne({ userId: req.user._id });

    // Clean up previous documents if replaced
    if (provider) {
      if (idProofPublicId && provider.idProofPublicId && idProofPublicId !== provider.idProofPublicId) {
        await deletePrivateDocument(provider.idProofPublicId, provider.idProofResourceType, req.user._id);
      }
      if (certificatePublicId && provider.certificatePublicId && certificatePublicId !== provider.certificatePublicId) {
        await deletePrivateDocument(provider.certificatePublicId, provider.certificateResourceType, req.user._id);
      }
    }

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
      specialty: specialty || 'General Maintenance & Repairs',
      experienceYears: Number(experienceYears) || 3,
      idProofUrl: idProofUrl || '',
      idProofPublicId: idProofPublicId || '',
      idProofResourceType: resolvedIdProofType,
      certificateUrl: certificateUrl || '',
      certificatePublicId: certificatePublicId || '',
      certificateResourceType: resolvedCertType,
    };

    // Requirement 6: Save every selected category in skills[] with passed: false
    const existingSkills = provider ? provider.skills || [] : [];
    const skillMap = new Map();
    existingSkills.forEach((s) => skillMap.set(s.categoryId, s));

    const catsToProcess =
      Array.isArray(selectedCategories) && selectedCategories.length > 0
        ? selectedCategories
        : Array.isArray(inputSkills) && inputSkills.length > 0
        ? inputSkills.map((s) => (typeof s === 'string' ? s : s.categoryId)).filter(Boolean)
        : categoryId
        ? [categoryId]
        : [];

    if (catsToProcess.length > 0) {
      const dbCategories = await Category.find({ categoryId: { $in: catsToProcess } });
      const nameMap = new Map(dbCategories.map((c) => [c.categoryId, c.name]));

      catsToProcess.forEach((catId) => {
        if (!skillMap.has(catId)) {
          const catName = nameMap.get(catId) || categoryName || catId;
          skillMap.set(catId, {
            categoryId: catId,
            categoryName: catName,
            passed: false,
            testScore: 0,
            badge: '',
            status: 'not_taken',
          });
        }
      });
      updateFields.skills = Array.from(skillMap.values());
    }

    if (provider) {
      const hasPassedSkill = (updateFields.skills || provider.skills)?.some((s) => s.passed);
      if (
        provider.status === 'rejected' ||
        provider.status === 'more_info_needed' ||
        provider.status === 'needs_info'
      ) {
        updateFields.status = hasPassedSkill ? 'waiting_for_approval' : 'take_skill_test';
        updateFields.rejectionReason = '';
        updateFields.adminNotes = '';
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

// POST /api/providers/skills/add (Requirement 9: Add another service)
export const addProviderSkill = async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' });
    }

    const categoryDoc = await Category.findOne({ categoryId });
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: `Category '${categoryId}' not found` });
    }

    let provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const existing = provider.skills?.find((s) => s.categoryId === categoryId);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: `${categoryDoc.name} is already in your skills list.`,
        provider,
        skill: existing,
      });
    }

    provider.skills = provider.skills || [];
    const newSkill = {
      categoryId,
      categoryName: categoryDoc.name,
      passed: false,
      testScore: 0,
      badge: '',
      status: 'not_taken',
    };
    provider.skills.push(newSkill);
    await provider.save();

    // If provider is already approved, notify admins that provider added a new skill
    if (provider.status === 'approved') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await notifyUser({
          userId: admin._id,
          role: 'admin',
          title: 'New Service Added',
          message: `Provider ${provider.name} added '${categoryDoc.name}' to their profile.`,
          code: 'NEW_SKILL_ADDED',
          type: 'approval',
          link: '/admin/approvals',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Added ${categoryDoc.name} to your skills list. Take the skill test to verify.`,
      provider,
      skill: newSkill,
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
    if (type !== 'idProof' && type !== 'certificate') {
      return res.status(400).json({ success: false, message: 'Invalid document type requested.' });
    }

    const providerId = req.query.providerId;

    let provider;
    if (req.user.role === 'admin' && providerId) {
      if (!mongoose.isValidObjectId(providerId)) {
        return res.status(400).json({ success: false, message: 'Invalid provider ID.' });
      }
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

    // Validate publicId if present
    if (publicId) {
      if (!isValidKycPublicId(publicId, provider.userId)) {
        return res.status(400).json({ success: false, message: 'Invalid document public ID format.' });
      }
      const uploadDoc = await Upload.findOne({ publicId, userId: provider.userId });
      if (!uploadDoc) {
        return res.status(400).json({ success: false, message: 'Document upload record not found.' });
      }
    }

    let signedUrl = rawUrl;
    if (publicId && isCloudinaryConfigured()) {
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
    } else if (publicId) {
      // Local dev/test fallback
      signedUrl = `/api/providers/documents/${type}/file${req.user.role === 'admin' && providerId ? `?providerId=${providerId}` : ''}`;
    }

    const isPdf = resourceType === 'raw' || (rawUrl && rawUrl.toLowerCase().includes('.pdf')) || (publicId && publicId.toLowerCase().endsWith('.pdf'));
    const contentType = isPdf ? 'pdf' : 'image';

    res.status(200).json({
      success: true,
      type,
      signedUrl,
      url: signedUrl,
      resourceType,
      contentType,
      expiresInSeconds: 600,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/documents/:type/file (Serves local private file if stored on disk)
export const servePrivateDocumentFile = async (req, res, next) => {
  try {
    // 1. Refuse in production or when Cloudinary is configured
    if (process.env.NODE_ENV === 'production' || isCloudinaryConfigured()) {
      return res.status(404).json({
        success: false,
        message: 'Local document serving is not available.',
      });
    }

    const { type } = req.params;
    if (type !== 'idProof' && type !== 'certificate') {
      return res.status(400).json({ success: false, message: 'Invalid document type requested.' });
    }

    const providerId = req.query.providerId;

    let provider;
    if (req.user.role === 'admin' && providerId) {
      if (!mongoose.isValidObjectId(providerId)) {
        return res.status(400).json({ success: false, message: 'Invalid provider ID.' });
      }
      provider = await Provider.findById(providerId);
    } else if (req.user.role === 'provider') {
      provider = await Provider.findOne({ userId: req.user._id });
    } else {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const isCert = type === 'certificate';
    const publicId = isCert ? provider.certificatePublicId : provider.idProofPublicId;

    if (!publicId) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // 2. Validate strict format against provider.userId
    if (!isValidKycPublicId(publicId, provider.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid document public ID format.' });
    }

    // 3. Verify ownership in Upload collection
    const uploadDoc = await Upload.findOne({ publicId, userId: provider.userId });
    if (!uploadDoc) {
      return res.status(400).json({ success: false, message: 'Document upload record not found.' });
    }

    // 4. Resolve local path safely
    let localDiskPath;
    try {
      localDiskPath = resolveLocalKycPath(publicId, provider.userId);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid document path.' });
    }

    if (!fs.existsSync(localDiskPath)) {
      return res.status(404).json({ success: false, message: 'Local document file not found.' });
    }

    const ext = path.extname(localDiskPath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(localDiskPath)}"`);
    return res.sendFile(localDiskPath);
  } catch (err) {
    next(err);
  }
};
