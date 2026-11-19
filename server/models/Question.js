import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: [true, 'categoryId is required'],
      index: true,
    },
    categoryName: {
      type: String,
      required: [true, 'categoryName is required'],
    },
    topic: {
      type: String,
      required: [true, 'topic is required'],
      trim: true,
      default: 'Safety',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard'],
      default: 'intermediate',
    },
    questionText: {
      type: String,
      required: [true, 'questionText is required and cannot be empty'],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length === 4 && val.every((opt) => typeof opt === 'string' && opt.trim().length > 0),
        'Each question must have exactly 4 non-empty options',
      ],
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
      select: false, // Never send to client during exam questions fetch
    },
    explanation: {
      type: String,
      default: '',
      select: false,
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

questionSchema.index({ categoryId: 1, isActive: 1 });

export const Question = mongoose.model('Question', questionSchema);
export default Question;
