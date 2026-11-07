import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    disputeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    bookingNumber: {
      type: String,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null,
    },
    providerName: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
    },
    claimAmount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED', 'RESOLVED_REFUND', 'RESOLVED_PAY_PROVIDER', 'RESOLVED_SPLIT', 'REJECTED'],
      default: 'OPEN',
    },
    decision: {
      type: String,
      default: '',
    },
    adminNote: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    providerPayout: {
      type: Number,
      default: 0,
    },
    adminResolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
