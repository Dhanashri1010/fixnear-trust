import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    bookingId: {
      type: String,
      default: '',
    },
    resolutionNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;

