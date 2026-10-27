import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 10,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    cooldownUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
export default TestAttempt;
