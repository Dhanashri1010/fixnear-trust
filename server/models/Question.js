import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [val => val.length === 4, 'Each question must have exactly 4 options'],
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

export const Question = mongoose.model('Question', questionSchema);
export default Question;
