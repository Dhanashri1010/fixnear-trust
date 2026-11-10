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

const getEmailFooterHtml = (lang = 'en') => {
  if (lang === 'hi') {
    return `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">FixNear Trust • सत्यापित स्थानीय गृह सेवाएं</p>
  <p style="margin: 0;">सहायता चाहिए? सीधे इस ईमेल का उत्तर दें या सहायता केंद्र पर जाएं। कृपया पासवर्ड या ओटीपी कोड किसी से साझा न करें।</p>
</div>
`;
  }
  if (lang === 'mr') {
    return `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">FixNear Trust • विश्वसनीय स्थानिक घरगुती सेवा</p>
  <p style="margin: 0;">मदत हवी आहे? थेट या ईमेलला उत्तर द्या किंवा मदत केंद्राला भेट द्या. कृपया पासवर्ड किंवा ओटीपी तंत्रज्ञांशी शेअर करू नका.</p>
</div>
`;
  }
  return `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">FixNear Trust • Verified Local Home Services</p>
  <p style="margin: 0;">Need assistance? Reply directly to this email or visit our help center. Please do not share passwords or OTP codes with technicians.</p>
</div>
`;
};

/**
 * Core send helper with retry and error safety
 * Guaranteed never to throw an unhandled rejection that breaks calling requests.
 */
export const sendEmailWithRetry = async ({ to, subject, html, text, maxRetries = 2, lang = 'en' }) => {
  if (!to) return { success: false, reason: 'No recipient' };

  const footer = getEmailFooterHtml(lang);
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    replyTo: EMAIL_REPLY_TO,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        ${html}
        ${footer}
      </div>
    `,
    text: text ? `${text}\n\n---\nFixNear Trust • Reply to ${EMAIL_REPLY_TO}` : undefined,
  };

  const currentTransporter = getTransporter();

  // If SMTP is not configured or in test mode, safely log and succeed
  if (!currentTransporter || process.env.NODE_ENV === 'test') {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Email Simulation (${lang})] To: ${to} | Subject: ${subject}`);
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
export const sendBookingPlacedEmail = async ({ customerEmail, customerName, bookingId, serviceTitle, scheduledDate, timeSlot, price, lang = 'en' }) => {
  let subject = `Booking Confirmed: ${serviceTitle} (#${bookingId})`;
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = `बुकिंग पुष्ट: ${serviceTitle} (#${bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">नमस्ते ${customerName}, आपका सेवा अनुरोध दर्ज हो गया है!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        हमें <strong>${serviceTitle}</strong> के लिए आपकी बुकिंग प्राप्त हुई है। हम आपके नजदीकी सत्यापित तकनीशियन को असाइन कर रहे हैं।
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>बुकिंग संख्या:</strong> ${bookingId}</p>
        <p style="margin: 4px 0;"><strong>निर्धारित तिथि:</strong> ${scheduledDate}</p>
        <p style="margin: 4px 0;"><strong>समय स्लॉट:</strong> ${timeSlot}</p>
        <p style="margin: 4px 0;"><strong>मूल शुल्क:</strong> ₹${price}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        आप अपने FixNear ग्राहक पोर्टल से तकनीशियन के आगमन को लाइव ट्रैक कर सकते हैं।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = `बुकिंग निश्चित: ${serviceTitle} (#${bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">नमस्कार ${customerName}, तुमची सेवा विनंती नोंदवली गेली आहे!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        आम्हाला <strong>${serviceTitle}</strong> साठी तुमचे बुकिंग मिळाले आहे. आम्ही तुमच्या परिसरातील प्रमाणित तंत्रज्ञ शोधत आहोत.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>बुकिंग क्रमांक:</strong> ${bookingId}</p>
        <p style="margin: 4px 0;"><strong>नियोजित तारीख:</strong> ${scheduledDate}</p>
        <p style="margin: 4px 0;"><strong>वेळेची वेळ:</strong> ${timeSlot}</p>
        <p style="margin: 4px 0;"><strong>मूळ दर:</strong> ₹${price}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        तुम्ही FixNear पोर्टलवरून तंत्रज्ञांचे आगमन थेट ट्रॅक करू शकता.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: customerEmail,
    subject,
    html,
    lang,
  });
};

// 2. Provider Accepted Job
export const sendProviderAcceptedEmail = async ({ customerEmail, customerName, providerName, providerPhone, bookingId, serviceTitle, lang = 'en' }) => {
  let subject = `Technician Assigned: ${providerName} is on your booking (#${bookingId})`;
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = `तकनीशियन असाइन: ${providerName} आपकी सेवा के लिए तैयार हैं (#${bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">शुभ समाचार, ${customerName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        सत्यापित तकनीशियन <strong>${providerName}</strong> ने <strong>${serviceTitle}</strong> के लिए आपका अनुरोध स्वीकार कर लिया है।
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #166534;"><strong>तकनीशियन:</strong> ${providerName}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>संपर्क फोन:</strong> ${providerPhone}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>बुकिंग संख्या:</strong> ${bookingId}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        कृपया अपना 4-अंकीय समापन कोड केवल काम पूरा होने और संतुष्ट होने के बाद ही साझा करें।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = `तंत्रज्ञ नियुक्त: ${providerName} आपल्या सेवेसाठी येत आहेत (#${bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">आनंदाची बातमी, ${customerName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        प्रमाणित तंत्रज्ञ <strong>${providerName}</strong> यांनी <strong>${serviceTitle}</strong> साठी आपली विनंती स्वीकारली आहे.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #166534;"><strong>तंत्रज्ञ:</strong> ${providerName}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>संपर्क फोन:</strong> ${providerPhone}</p>
        <p style="margin: 4px 0; color: #166534;"><strong>बुकिंग क्रमांक:</strong> ${bookingId}</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        कृपया काम पूर्ण समाधानकारक झाल्यानंतरच आपला 4-अंकी कोड शेअर करा.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: customerEmail,
    subject,
    html,
    lang,
  });
};

// 3. Job Completed + Receipt
export const sendJobCompletedEmail = async ({ customerEmail, customerName, bookingId, serviceTitle, totalAmount, invoiceNumber, paymentMethod, lang = 'en' }) => {
  let subject = `Service Completed & Receipt: #${bookingId} (Invoice #${invoiceNumber || bookingId})`;
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = `सेवा पूर्ण और रसीद: #${bookingId} (चालान #${invoiceNumber || bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">सेवा सफलतापूर्वक पूर्ण हुई!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्ते ${customerName}, <strong>${serviceTitle}</strong> के लिए आपकी सेवा पूर्ण चिह्नित कर दी गई है। FixNear Trust चुनने के लिए धन्यवाद!
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>चालान संख्या:</strong> ${invoiceNumber || `INV-${bookingId}`}</p>
        <p style="margin: 4px 0;"><strong>कुल राशि:</strong> ₹${totalAmount}</p>
        <p style="margin: 4px 0;"><strong>भुगतान विधि:</strong> ${paymentMethod || 'ऑनलाइन / नकद'}</p>
        <p style="margin: 4px 0;"><strong>स्थिति:</strong> भुगतान संपन्न और सुरक्षित</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        सभी पूर्ण कार्यों पर 30-दिन की FixNear वारंटी लागू है। कृपया अपने अनुभव की समीक्षा दें।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = `सेवा पूर्ण आणि पावती: #${bookingId} (चलन #${invoiceNumber || bookingId})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">सेवा यशस्वीरीत्या पूर्ण झाली!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्कार ${customerName}, <strong>${serviceTitle}</strong> साठी आपली सेवा पूर्ण झाली आहे. FixNear Trust निवडल्याबद्दल धन्यवाद!
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>चलन क्रमांक:</strong> ${invoiceNumber || `INV-${bookingId}`}</p>
        <p style="margin: 4px 0;"><strong>एकूण रक्कम:</strong> ₹${totalAmount}</p>
        <p style="margin: 4px 0;"><strong>पेमेंट पद्धत:</strong> ${paymentMethod || 'ऑनलाइन / रोख'}</p>
        <p style="margin: 4px 0;"><strong>स्थिती:</strong> पेमेंट यशस्वी</p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        सर्व कामांवर आमची 30 दिवसांची वॉरंटी उपलब्ध आहे. कृपया आपल्या तंत्रज्ञाचे पुनरावलोकन करा.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: customerEmail,
    subject,
    html,
    lang,
  });
};

// 4. Provider Approval Status
export const sendProviderStatusEmail = async ({ providerEmail, providerName, status, reason = '', lang = 'en' }) => {
  let subject = 'FixNear Verification Update';
  let body = '';

  if (lang === 'hi') {
    if (status === 'approved') {
      subject = 'बधाई हो! आपका FixNear तकनीशियन खाता स्वीकृत हो गया है';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #166534;">
          FixNear Trust में आपका स्वागत है! आपके क्रेडेंशियल्स और कौशल का सत्यापन पूर्ण हो गया है। अब आप ऑनलाइन होकर ग्राहकों के काम स्वीकार कर सकते हैं।
        </p>
      `;
    } else if (status === 'rejected') {
      subject = 'आवेदन स्थिति अपडेट: FixNear तकनीशियन कार्यक्रम';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #991b1b;">
          FixNear में रुचि लेने के लिए धन्यवाद। दुर्भाग्यवश, आपका आवेदन इस समय स्वीकृत नहीं किया जा सका।
        </p>
        ${reason ? `<p style="font-size: 14px; color: #7f1d1d; background: #fef2f2; padding: 12px; border-radius: 6px;">कारण: ${reason}</p>` : ''}
      `;
    } else {
      subject = 'कार्रवाई आवश्यक: FixNear सत्यापन के लिए अतिरिक्त जानकारी चाहिए';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #854d0e;">
          हमारी टीम ने आपके विवरण की समीक्षा की है और खाता सक्रिय करने के लिए कुछ और जानकारी की आवश्यकता है।
        </p>
        ${reason ? `<p style="font-size: 14px; color: #713f12; background: #fefce8; padding: 12px; border-radius: 6px;">समीक्षक टिप्पणी: "${reason}"</p>` : ''}
        <p style="font-size: 14px; color: #475569;">कृपया अपनी जानकारी अपडेट करने के लिए प्रदाता पोर्टल पर लॉग इन करें।</p>
      `;
    }
  } else if (lang === 'mr') {
    if (status === 'approved') {
      subject = 'अभिनंदन! आपले FixNear तंत्रज्ञ खाते मंजूर झाले आहे';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #166534;">
          FixNear Trust मध्ये आपले स्वागत आहे! आपली कौशल्ये व कागदपत्रे पडताळली गेली आहेत. आता आपण ऑनलाइन होऊन कामे स्वीकारू शकता.
        </p>
      `;
    } else if (status === 'rejected') {
      subject = 'अर्जाची स्थिती: FixNear तंत्रज्ञ कार्यक्रम';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #991b1b;">
          FixNear शी जोडल्याबद्दल धन्यवाद. दुर्दैवाने, आपला अर्ज या वेळी मंजूर करता आला नाही.
        </p>
        ${reason ? `<p style="font-size: 14px; color: #7f1d1d; background: #fef2f2; padding: 12px; border-radius: 6px;">कारण: ${reason}</p>` : ''}
      `;
    } else {
      subject = 'कारवाई आवश्यक: FixNear पडताळणीसाठी अतिरिक्त माहिती हवी आहे';
      body = `
        <p style="font-size: 15px; line-height: 1.6; color: #854d0e;">
          आमच्या टीमने आपल्या माहितीचे पुनरावलोकन केले आहे आणि खाते सक्रिय करण्यासाठी अधिक माहिती आवश्यक आहे.
        </p>
        ${reason ? `<p style="font-size: 14px; color: #713f12; background: #fefce8; padding: 12px; border-radius: 6px;">पुनरावलोकन टिप्पणी: "${reason}"</p>` : ''}
        <p style="font-size: 14px; color: #475569;">कृपया माहिती अद्यतनित करण्यासाठी प्रदाता पोर्टलवर लॉग इन करा.</p>
      `;
    }
  } else {
    // English default
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
  }

  const greeting = lang === 'hi' ? `नमस्ते ${providerName},` : lang === 'mr' ? `नमस्कार ${providerName},` : `Hello ${providerName},`;

  return sendEmailWithRetry({
    to: providerEmail,
    subject,
    html: `
      <h2 style="color: #0f172a; margin-top: 0;">${greeting}</h2>
      ${body}
    `,
    lang,
  });
};

// 5. Password Reset
export const sendPasswordResetEmail = async ({ userEmail, userName, resetUrl, lang = 'en' }) => {
  let subject = 'Reset Your FixNear Account Password';
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = 'अपना FixNear खाता पासवर्ड रीसेट करें';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">पासवर्ड रीसेट अनुरोध</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्ते ${userName}, हमें आपका पासवर्ड रीसेट करने का अनुरोध मिला है। नया पासवर्ड सेट करने के लिए नीचे दिए गए सुरक्षित लिंक पर क्लिक करें:
      </p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          पासवर्ड रीसेट करें
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        यह लिंक 1 घंटे में समाप्त हो जाएगा। यदि आपने यह अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = 'आपला FixNear पासवर्ड रीसेट करा';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">पासवर्ड रीसेट विनंती</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्कार ${userName}, आम्हाला आपला पासवर्ड रीसेट करण्याची विनंती मिळाली आहे. नवीन पासवर्ड सेट करण्यासाठी खालील लिंकवर क्लिक करा:
      </p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          पासवर्ड रीसेट करा
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        ही लिंक 1 तासात कालबाह्य होईल. आपण ही विनंती केली नसल्यास आपण दुर्लक्ष करू शकता.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: userEmail,
    subject,
    html,
    lang,
  });
};

// 6. Password Changed Notification
export const sendPasswordChangedEmail = async ({ userEmail, userName, lang = 'en' }) => {
  let subject = 'Security Alert: Your FixNear Password Was Changed';
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = 'सुरक्षा चेतावनी: आपका FixNear पासवर्ड बदला गया है';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">पासवर्ड सफलतापूर्वक बदल दिया गया</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्ते ${userName}, यह पुष्टि है कि आपका FixNear खाता पासवर्ड हाल ही में अपडेट किया गया है।
      </p>
      <p style="font-size: 14px; color: #475569;">
        सुरक्षा सावधानी के रूप में अन्य सभी सक्रिय सत्र समाप्त कर दिए गए हैं।
      </p>
      <p style="font-size: 13px; color: #dc2626; margin-top: 16px;">
        यदि आपने यह बदलाव नहीं किया है, तो कृपया तुरंत सहायता टीम से संपर्क करें।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = 'सुरक्षा इशारा: आपला FixNear पासवर्ड बदलला गेला आहे';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">पासवर्ड यशस्वीरीत्या बदलला</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्कार ${userName}, आपल्या FixNear खात्याचा पासवर्ड नुकताच बदलला गेला आहे.
      </p>
      <p style="font-size: 14px; color: #475569;">
        सुरक्षेसाठी इतर सर्व ब्राउझर सत्रांमधून लॉग आउट केले गेले आहे.
      </p>
      <p style="font-size: 13px; color: #dc2626; margin-top: 16px;">
        जर आपण हा बदल केला नसेल तर कृपया लगेच ग्राहक सेवेशी संपर्क साधा.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: userEmail,
    subject,
    html,
    lang,
  });
};

// 7. Dispute / Complaint Resolved
export const sendComplaintResolvedEmail = async ({ userEmail, userName, disputeId, decision, note, refundAmount = 0, lang = 'en' }) => {
  const cleanDecision = decision ? String(decision).replace(/_/g, ' ').toLowerCase() : 'resolved';
  let subject = `Complaint Decision Recorded: Ticket #${disputeId}`;
  let html = `
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
  `;

  if (lang === 'hi') {
    subject = `शिकायत निर्णय दर्ज: टिकट #${disputeId}`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">मध्यस्थता निर्णय दर्ज किया गया</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्ते ${userName}, FixNear प्रशासन ने विवाद टिकट <strong>#${disputeId}</strong> की समीक्षा कर समाधान कर दिया है।
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>समाधान निर्णय:</strong> ${cleanDecision}</p>
        ${refundAmount > 0 ? `<p style="margin: 4px 0;"><strong>ग्राहक धनवापसी राशि:</strong> ₹${refundAmount}</p>` : ''}
        ${note ? `<p style="margin: 8px 0 0 0; color: #475569;"><strong>समीक्षक टिप्पणी:</strong> "${note}"</p>` : ''}
      </div>
      <p style="font-size: 14px; color: #475569;">
        यह निर्णय अब आपके पोर्टल इतिहास में दर्ज है।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = `तक्रार निर्णय नोंदवला: तिकीट #${disputeId}`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">मध्यस्थता निर्णय नोंदवला गेला</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्कार ${userName}, FixNear प्रशासनाने विवाद तिकीट <strong>#${disputeId}</strong> चे पुनरावलोकन करून निर्णय घेतला आहे.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>निर्णय:</strong> ${cleanDecision}</p>
        ${refundAmount > 0 ? `<p style="margin: 4px 0;"><strong>परतावा रक्कम:</strong> ₹${refundAmount}</p>` : ''}
        ${note ? `<p style="margin: 8px 0 0 0; color: #475569;"><strong>पुनरावलोकन नोंद:</strong> "${note}"</p>` : ''}
      </div>
      <p style="font-size: 14px; color: #475569;">
        हा निर्णय आपल्या खात्याच्या नोंदीत सुरक्षित आहे.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: userEmail,
    subject,
    html,
    lang,
  });
};

// 8. Welcome Email
export const sendWelcomeEmail = async ({ userEmail, userName, role = 'customer', lang = 'en' }) => {
  let subject = 'Welcome to FixNear Trust!';
  let html = `
    <h2 style="color: #0f172a; margin-top: 0;">Welcome to FixNear Trust, ${userName}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155;">
      Thank you for joining FixNear. Your trusted destination for verified home repair specialists with transparent pricing and 30-day workmanship guarantee.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Account Email:</strong> ${userEmail}</p>
      <p style="margin: 4px 0;"><strong>Account Type:</strong> ${role === 'provider' ? 'Service Partner' : 'Customer'}</p>
    </div>
  `;

  if (lang === 'hi') {
    subject = 'FixNear Trust में आपका स्वागत है!';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">FixNear Trust में आपका स्वागत है, ${userName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        FixNear से जुड़ने के लिए धन्यवाद। पारदर्शी दरों और 30-दिन की कार्य वारंटी के साथ सत्यापित घरेलू सेवाओं के लिए आपका विश्वसनीय मंच।
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>खाता ईमेल:</strong> ${userEmail}</p>
        <p style="margin: 4px 0;"><strong>खाता प्रकार:</strong> ${role === 'provider' ? 'सर्विस पार्टनर' : 'ग्राहक'}</p>
      </div>
    `;
  } else if (lang === 'mr') {
    subject = 'FixNear Trust मध्ये आपले स्वागत आहे!';
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">FixNear Trust मध्ये आपले स्वागत आहे, ${userName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        FixNear शी जोडल्याबद्दल धन्यवाद. पारदर्शक दर आणि 30 दिवसांच्या वॉरंटीसह सत्यापित घरगुती सेवांसाठी आपली विश्वसनीय बाजारपेठ.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>ईमेल:</strong> ${userEmail}</p>
        <p style="margin: 4px 0;"><strong>खाते प्रकार:</strong> ${role === 'provider' ? 'सर्व्हिस पार्टनर' : 'ग्राहक'}</p>
      </div>
    `;
  }

  return sendEmailWithRetry({
    to: userEmail,
    subject,
    html,
    lang,
  });
};

// 9. Booking Cancelled Email
export const sendBookingCancelledEmail = async ({ customerEmail, customerName, bookingId, serviceTitle, reason = '', lang = 'en' }) => {
  let subject = `Booking Cancelled: #${bookingId} (${serviceTitle})`;
  let html = `
    <h2 style="color: #0f172a; margin-top: 0;">Booking Cancelled</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155;">
      Hi ${customerName}, your booking for <strong>${serviceTitle}</strong> (#${bookingId}) has been cancelled.
    </p>
    ${reason ? `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b;"><strong>Reason for Cancellation:</strong> ${reason}</p>
    </div>` : ''}
    <p style="font-size: 14px; color: #475569;">
      If any advance payment was made, it has been initiated for refund back to your original payment method.
    </p>
  `;

  if (lang === 'hi') {
    subject = `बुकिंग रद्द: #${bookingId} (${serviceTitle})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">बुकिंग रद्द की गई</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्ते ${customerName}, <strong>${serviceTitle}</strong> (#${bookingId}) के लिए आपकी बुकिंग रद्द कर दी गई है।
      </p>
      ${reason ? `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b;"><strong>रद्दीकरण का कारण:</strong> ${reason}</p>
      </div>` : ''}
      <p style="font-size: 14px; color: #475569;">
        यदि कोई अग्रिम भुगतान किया गया था, तो धनवापसी प्रक्रिया शुरू कर दी गई है।
      </p>
    `;
  } else if (lang === 'mr') {
    subject = `बुकिंग रद्द केली: #${bookingId} (${serviceTitle})`;
    html = `
      <h2 style="color: #0f172a; margin-top: 0;">बुकिंग रद्द करण्यात आली</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        नमस्कार ${customerName}, <strong>${serviceTitle}</strong> (#${bookingId}) साठीचे आपले बुकिंग रद्द केले आहे.
      </p>
      ${reason ? `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b;"><strong>रद्द करण्याचे कारण:</strong> ${reason}</p>
      </div>` : ''}
      <p style="font-size: 14px; color: #475569;">
        काही आगाऊ रक्कम भरली असल्यास मूळ खात्यात परतावा सुरू करण्यात आला आहे.
      </p>
    `;
  }

  return sendEmailWithRetry({
    to: customerEmail,
    subject,
    html,
    lang,
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
  sendWelcomeEmail,
  sendBookingCancelledEmail,
};
