import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
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
    customerPhone: {
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
    providerPhone: {
      type: String,
      default: '',
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    pincode: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'NO_PROVIDER_FOUND'],
      default: 'REQUESTED',
    },
    completionOtp: {
      type: String,
      required: true,
    },
    failedFinishCodeAttempts: {
      type: Number,
      default: 0,
    },
    finishCodeBlockedUntil: {
      type: Date,
      default: null,
    },
    disputeStatus: {
      type: String,
      enum: ['NONE', 'OPEN', 'RESOLVED', 'REJECTED'],
      default: 'NONE',
    },
    offeredTo: [
      {
        providerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Provider',
        },
        offeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
          default: 'PENDING',
        },
      },
    ],
    currentOfferExpiresAt: {
      type: Date,
      default: null,
    },
    timeline: [
      {
        step: { type: String, required: true },
        time: { type: String, default: 'Pending' },
        done: { type: Boolean, default: false },
        current: { type: Boolean, default: false },
      },
    ],
    quotation: {
      items: [
        {
          desc: String,
          amount: Number,
          partNo: String,
        },
      ],
      total: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['NONE', 'PENDING_CUSTOMER_APPROVAL', 'APPROVED', 'REJECTED'],
        default: 'NONE',
      },
      reason: String,
      updatedAt: Date,
    },
    approvedQuotationsCount: {
      type: Number,
      default: 0,
    },
    invoice: {
      invoiceNo: String,
      status: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
      baseAmount: Number,
      extraAmount: { type: Number, default: 0 },
      totalAmount: Number,
      issuedAt: Date,
      paidAt: Date,
    },
    platformFeeSnapshot: {
      type: Number,
      default: 20,
    },
    commissionRateSnapshot: {
      type: Number,
      default: 10,
    },
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'CASH', 'UNPAID', 'PAY_ON_SERVICE', 'RAZORPAY'],
      default: 'UNPAID',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'CASH_RECEIVED', 'PAID', 'REFUNDED'],
      default: 'PENDING',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    cancellationReason: String,
    cancelledBy: String,
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ city: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ disputeStatus: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
