/**
 * Centralized booking serialization helper.
 * Converts a booking document to a plain object with an explicit allow-list of fields.
 *
 * Security & Privacy Rules:
 * 1. completionOtp appears ONLY when viewer is 'customer' (the booking owner).
 * 2. Provider payloads hide the customer's phone and full address until the booking is ACCEPTED.
 * 3. Provider payloads never include offer lists (offeredTo), payment ids (razorpayOrderId, razorpayPaymentId),
 *    or finish-code counters (failedFinishCodeAttempts, finishCodeBlockedUntil).
 * 4. Customer payloads hide technician contact info (providerName, providerPhone) when status is 'REQUESTED'.
 *
 * @param {Object} booking - Mongoose Booking document or plain object
 * @param {'customer' | 'provider' | 'admin'} [viewer='provider'] - Viewer role
 * @returns {Object|null} Serialized booking payload safe for the viewer
 */
export const toBookingPayload = (booking, viewer = 'provider') => {
  if (!booking) return null;

  const b = typeof booking.toObject === 'function' ? booking.toObject() : { ...booking };

  const isAccepted = ['ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED', 'DISPUTED'].includes(b.status);
  const isCustomerViewer = viewer === 'customer';
  const isProviderViewer = viewer === 'provider';
  const isAdminViewer = viewer === 'admin';

  // Base allow-listed fields common to all roles
  const payload = {
    _id: b._id,
    id: b._id,
    bookingId: b.bookingId,
    customerId: b.customerId,
    serviceId: b.serviceId,
    serviceTitle: b.serviceTitle,
    basePrice: b.basePrice,
    city: b.city,
    scheduledDate: b.scheduledDate,
    timeSlot: b.timeSlot,
    notes: b.notes || '',
    photos: Array.isArray(b.photos) ? b.photos : [],
    status: b.status,
    disputeStatus: b.disputeStatus || 'NONE',
    timeline: Array.isArray(b.timeline)
      ? b.timeline.map((t) => ({
          step: t.step,
          time: t.time || 'Pending',
          done: Boolean(t.done),
          current: Boolean(t.current),
        }))
      : [],
    quotation: b.quotation
      ? {
          items: Array.isArray(b.quotation.items)
            ? b.quotation.items.map((it) => ({
                desc: it.desc,
                amount: it.amount,
                partNo: it.partNo || '',
              }))
            : [],
          total: b.quotation.total || 0,
          status: b.quotation.status || 'NONE',
          reason: b.quotation.reason || '',
          updatedAt: b.quotation.updatedAt,
        }
      : null,
    approvedQuotationsCount: b.approvedQuotationsCount || 0,
    invoice: b.invoice
      ? {
          invoiceNo: b.invoice.invoiceNo,
          status: b.invoice.status || 'UNPAID',
          baseAmount: b.invoice.baseAmount,
          extraAmount: b.invoice.extraAmount || 0,
          totalAmount: b.invoice.totalAmount,
          issuedAt: b.invoice.issuedAt,
          paidAt: b.invoice.paidAt,
        }
      : null,
    platformFeeSnapshot: b.platformFeeSnapshot ?? 20,
    commissionRateSnapshot: b.commissionRateSnapshot ?? 10,
    paymentMethod: b.paymentMethod || 'UNPAID',
    paymentStatus: b.paymentStatus || 'PENDING',
    invoiceNumber: b.invoiceNumber || (b.invoice && b.invoice.invoiceNo) || '',
    cancellationReason: b.cancellationReason || '',
    cancelledBy: b.cancelledBy || '',
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };

  // Customer Contact & Address Privacy Rules:
  if (isProviderViewer) {
    if (isAccepted) {
      payload.customerName = b.customerName;
      payload.customerPhone = b.customerPhone || '';
      payload.address = b.address || '';
      payload.pincode = b.pincode || '';
    } else {
      payload.customerName = b.customerName;
      payload.customerPhone = '';
      payload.address = b.city || 'Local area';
      payload.pincode = '';
    }
  } else {
    payload.customerName = b.customerName;
    payload.customerPhone = b.customerPhone || '';
    payload.address = b.address || '';
    payload.pincode = b.pincode || '';
  }

  // Provider Identity Privacy Rules:
  if (isCustomerViewer && b.status === 'REQUESTED') {
    payload.providerId = null;
    payload.providerName = '';
    payload.providerPhone = '';
  } else {
    payload.providerId = b.providerId || null;
    payload.providerName = b.providerName || '';
    payload.providerPhone = b.providerPhone || '';
  }

  // Finish Code Secrecy:
  // The completionOtp field appears ONLY when viewer is 'customer' (the booking owner).
  if (isCustomerViewer && b.completionOtp) {
    payload.completionOtp = b.completionOtp;
  }

  // Dispatch offer tracking (Customer and Admin viewers; never shown to provider)
  if (!isProviderViewer) {
    if (Array.isArray(b.offeredTo)) {
      payload.offeredTo = b.offeredTo.map((o) => ({
        providerId: o.providerId,
        offeredAt: o.offeredAt,
        status: o.status,
      }));
    }
    payload.currentOfferExpiresAt = b.currentOfferExpiresAt || null;
  }

  // Admin-only operational fields
  if (isAdminViewer) {
    payload.failedFinishCodeAttempts = b.failedFinishCodeAttempts || 0;
    payload.finishCodeBlockedUntil = b.finishCodeBlockedUntil || null;
    payload.razorpayOrderId = b.razorpayOrderId || '';
    payload.razorpayPaymentId = b.razorpayPaymentId || '';
  }

  return payload;
};

export default toBookingPayload;

