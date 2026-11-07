import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Atomically generates the next sequential invoice number for a given calendar year.
 * Format: INV-YYYY-000001
 * Uses MongoDB findOneAndUpdate with $inc and upsert to guarantee uniqueness under concurrency.
 */
export const getNextInvoiceNumber = async (year = new Date().getFullYear()) => {
  const counterId = `invoice_${year}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(6, '0');
  return `INV-${year}-${padded}`;
};

