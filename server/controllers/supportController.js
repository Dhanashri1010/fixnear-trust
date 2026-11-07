import { SupportTicket } from '../models/SupportTicket.js';

export const createSupportTicket = async (req, res, next) => {
  try {
    const { subject, message, bookingId } = req.body;

    const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await SupportTicket.create({
      ticketId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      subject: subject.trim(),
      message: message.trim(),
      bookingId: bookingId || '',
      status: 'OPEN',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will review it shortly.',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

export const getMySupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

