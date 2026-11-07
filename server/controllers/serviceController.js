import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import mongoose from 'mongoose';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const { category, categoryId, search } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.$or = [{ categoryId: category }, { category: category }];
    } else if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = filter.$or
        ? [{ $and: [filter, { $or: [{ title: regex }, { category: regex }, { features: regex }] }] }]
        : [{ title: regex }, { category: regex }, { features: regex }];
    }

    const services = await Service.find(filter).sort({ startingPrice: 1 });
    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);
    const service = await Service.findOne({
      $or: [{ serviceId: id }, ...(isObjectId ? [{ _id: id }] : [])],
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or is currently inactive.',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isHidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('providerId', 'name specialty avatar');
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

