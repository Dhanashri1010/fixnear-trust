import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Wrench',
    },
    startingPrice: {
      type: Number,
      default: 299,
    },
    badge: {
      type: String,
      default: '',
    },
    accentBg: {
      type: String,
      default: 'var(--forest-50)',
    },
    accentText: {
      type: String,
      default: 'var(--forest-800)',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model('Category', categorySchema);
export default Category;
