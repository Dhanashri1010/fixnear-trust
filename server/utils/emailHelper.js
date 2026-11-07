import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
};

const EMAIL_FROM = process.env.EMAIL_FROM || '"FixNear Trust" <no-reply@fixnear.com>';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@fixnear.com';

const emailFooterHtml = `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">FixNear Trust • Verified Local Home Services</p>
  <p style="margin: 0;">Need assistance? Reply directly to this email or visit our help center. Please do not share passwords or OTP codes with technicians.</p>
</div>
`;

/**
 * Core send helper with retry and error safety
 * Guaranteed never to throw an unhandled rejection that breaks calling requests.
 */
export const sendEmailWithRetry = async ({ to, subject, html, text, maxRetries = 2 }) => {
  if (!to) return { success: false, reason: 'No recipient' };

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    replyTo: EMAIL_REPLY_TO,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        ${html}
        ${emailFooterHtml}
      </div>
    `,
    text: text ? `${text}\n\n---\nFixNear Trust • Reply to ${EMAIL_REPLY_TO}` : undefined,
  };

  const currentTransporter = getTransporter();

  // If SMTP is not configured or in test mode, safely log and succeed
  if (!currentTransporter || process.env.NODE_ENV === 'test') {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    }
    return { success: true, simulated: true };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Warning] Delivery attempt ${attempt} to ${to} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error(`[Email Error] All ${maxRetries} delivery attempts to ${to} failed.`);
        return { success: false, error: err.message };
      }
      // Brief pause before retry
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return { success: false };
};

// 1. Booking Placed
export const sendBookingPlacedEmail = async ({ customerEmail, customerName, bookingId, serviceTitle, scheduledDate, timeSlot, price }) => {
  return sendEmailWithRetry({
    to: customerEmail,
    subject: `Booking Confirmed: ${serviceTitle} (#${bookingId})`,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Hi ${customerName}, your service request is placed!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        We have received your booking for <strong>${serviceTitle}</strong>. We are matching you with a qualified, background-verified technician near your area.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Booking Number:</strong> ${bookingId}</p>
        <p style="margin: 4px 0;"><strong>Scheduled Date:</strong> ${scheduledDate}</p>
        <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${timeSlot}</p>
        <p style="margin: 4px 0;"><strong>Base Price:</strong> ₹${price}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        You can track the technician's arrival live from your FixNear customer portal.
      </p>
    `,
  });
};

// 2. Provider Accepted Job
export const sendProviderAcceptedEmail = async ({ customerEmail, customerName, providerName, providerPhone, bookingId, serviceTitle }) => {
  return sendEmailWithRetry({
    to: customerEmail,
    subject: `Technician Assigned: ${providerName} is on your booking (#${bookingId})`,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Great news, ${customerName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Verified technician <strong>${providerName}</strong> has accepted your request for <strong>${serviceTitle}</strong>.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #166534;"><strong>Technician:</strong> ${providerName}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>Contact Phone:</strong> ${providerPhone}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>Booking ID:</strong> ${bookingId}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Please share your 4-digit completion code ONLY after the job has been completed to your satisfaction.
      </p>
    `,
  });
};

// 3. Job Completed + Receipt
export const sendJobCompletedEmail = async ({ customerEmail, customerName, bookingId, serviceTitle, totalAmount, invoiceNumber, paymentMethod }) => {
  return sendEmailWithRetry({
    to: customerEmail,
    subject: `Service Completed & Receipt: #${bookingId} (Invoice #${invoiceNumber || bookingId})`,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Service Completed!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Hi ${customerName}, your service for <strong>${serviceTitle}</strong> has been marked complete. Thank you for choosing FixNear Trust!
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoiceNumber || `INV-${bookingId}`}</p>
        <p style="margin: 4px 0;"><strong>Total Billed:</strong> ₹${totalAmount}</p>
        <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${paymentMethod || 'Online / Cash'}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Paid & Verified</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        All completed jobs carry our 30-day FixNear satisfaction warranty. Please rate your technician to help your neighbors find top service.
      </p>
    `,
  });
};

// 4. Provider Approval Status
export const sendProviderStatusEmail = async ({ providerEmail, providerName, status, reason = '' }) => {
  let subject = 'FixNear Verification Update';
  let body = '';

  if (status === 'approved') {
    subject = 'Congratulations! Your FixNear Technician Account is Approved';
    body = `
      <p style="font-size: 15px; line-height: 1.6; color: #166534;">
        Welcome to FixNear Trust! Your professional credentials and skill assessment have been verified. You can now go online in your technician console to receive customer job offers.
      </p>
    `;
  } else if (status === 'rejected') {
    subject = 'Application Status Update: FixNear Technician Program';
    body = `
      <p style="font-size: 15px; line-height: 1.6; color: #991b1b;">
        Thank you for your interest in joining FixNear. Unfortunately, your application could not be approved at this time.
      </p>
      ${reason ? `<p style="font-size: 14px; color: #7f1d1d; background: #fef2f2; padding: 12px; border-radius: 6px;">Reason: ${reason}</p>` : ''}
    `;
  } else {
    subject = 'Action Required: Additional Information Needed for FixNear Verification';
    body = `
      <p style="font-size: 15px; line-height: 1.6; color: #854d0e;">
        Our compliance team reviewed your submission and needs a little more information before activating your account.
      </p>
      ${reason ? `<p style="font-size: 14px; color: #713f12; background: #fefce8; padding: 12px; border-radius: 6px;">Note from reviewer: "${reason}"</p>` : ''}
      <p style="font-size: 14px; color: #475569;">Please log in to your provider portal to update your details.</p>
    `;
  }

  return sendEmailWithRetry({
    to: providerEmail,
    subject,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Hello ${providerName},</h2>
      ${body}
    `,
  });
};

// 5. Password Reset
export const sendPasswordResetEmail = async ({ userEmail, userName, resetUrl }) => {
  return sendEmailWithRetry({
    to: userEmail,
    subject: 'Reset Your FixNear Account Password',
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Hi ${userName}, we received a request to reset your password. Click the secure link below to set a new password:
      </p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        This link will expire in 1 hour. If you did not request this, you can safely ignore this email; your account remains secure.
      </p>
    `,
  });
};

// 6. Password Changed Notification
export const sendPasswordChangedEmail = async ({ userEmail, userName }) => {
  return sendEmailWithRetry({
    to: userEmail,
    subject: 'Security Alert: Your FixNear Password Was Changed',
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Password Changed Successfully</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Hi ${userName}, this is a confirmation that your FixNear account password was just updated.
      </p>
      <p style="font-size: 14px; color: #475569;">
        All other active browser sessions have been logged out as a security precaution.
      </p>
      <p style="font-size: 13px; color: #dc2626; margin-top: 16px;">
        If you did not make this change, please contact our emergency support team immediately.
      </p>
    `,
  });
};

// 7. Dispute / Complaint Resolved
export const sendComplaintResolvedEmail = async ({ userEmail, userName, disputeId, decision, note, refundAmount = 0 }) => {
  const cleanDecision = decision ? String(decision).replace(/_/g, ' ').toLowerCase() : 'resolved';
  return sendEmailWithRetry({
    to: userEmail,
    subject: `Complaint Decision Recorded: Ticket #${disputeId}`,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">Mediation Decision Recorded</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Hello ${userName}, FixNear Administration has reviewed and resolved dispute ticket <strong>#${disputeId}</strong>.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Resolution Decision:</strong> ${cleanDecision}</p>
        ${refundAmount > 0 ? `<p style="margin: 4px 0;"><strong>Customer Refund Amount:</strong> ₹${refundAmount}</p>` : ''}
        ${note ? `<p style="margin: 8px 0 0 0; color: #475569;"><strong>Reviewer Note:</strong> "${note}"</p>` : ''}
      </div>
      <p style="font-size: 14px; color: #475569;">
        The decision is now recorded in your console history.
      </p>
    `,
  });
};

export default {
  sendEmailWithRetry,
  sendBookingPlacedEmail,
  sendProviderAcceptedEmail,
  sendJobCompletedEmail,
  sendProviderStatusEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendComplaintResolvedEmail,
};
