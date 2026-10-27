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
      enum: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'REQUESTED',
    },
    completionOtp: {
      type: String,
      required: true,
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
    invoice: {
      invoiceNo: String,
      status: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
      baseAmount: Number,
      extraAmount: { type: Number, default: 0 },
      totalAmount: Number,
      issuedAt: Date,
      paidAt: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['pay_after_service', 'razorpay'],
      default: 'pay_after_service',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    cancellationReason: String,
    cancelledBy: String,
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
