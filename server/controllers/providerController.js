import mongoose from 'mongoose';
import { Provider } from '../models/Provider.js';
import { Review } from '../models/Review.js';
import { escapeRegex } from '../utils/escapeRegex.js';

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

