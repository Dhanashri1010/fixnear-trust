// ===================================================================
// FixNear Trust - Universal Complete i18n Compiler
// Merges all remaining provider and admin keys for en, hi, mr with strict parity
// ===================================================================

import fs from 'fs';
import path from 'path';

const providerAdditions = {
  loadingReg: {
    en: "Loading technician registration...",
    hi: "तकनीशियन पंजीकरण लोड हो रहा है...",
    mr: "तंत्रज्ञ नोंदणी लोड होत आहे..."
  },
  techAccountRequired: {
    en: "Technician Account Required",
    hi: "तकनीशियन खाता आवश्यक है",
    mr: "तंत्रज्ञ खाते आवश्यक आहे"
  },
  customerAccountNotice: {
    en: "You are currently signed in with a customer account. To offer home services and earn on FixNear, please create a Service Partner account.",
    hi: "आप वर्तमान में एक ग्राहक खाते से जुड़े हैं। फिक्सनियर पर सेवाएं देने और कमाने के लिए, कृपया सर्विस पार्टनर खाता बनाएं।",
    mr: "आपण सध्या ग्राहक खात्यासह साइन इन आहात. फिक्सनियरवर सेवा देण्यासाठी आणि कमावण्यासाठी, कृपया सर्व्हिस पार्टनर खाते तयार करा."
  },
  signUpPartnerBtn: {
    en: "Sign Up as Service Partner",
    hi: "सर्विस पार्टनर के रूप में साइन अप करें",
    mr: "सर्व्हिस पार्टनर म्हणून साइन अप करा"
  },
  backToHome: {
    en: "Back to Home",
    hi: "होम पर लौटें",
    mr: "मुख्यपृष्ठावर परत जा"
  },
  partnerNetwork: {
    en: "FIXNEAR PARTNER NETWORK",
    hi: "फिक्सनियर पार्टनर नेटवर्क",
    mr: "फिक्सनियर पार्टनर नेटवर्क"
  },
  regHeading: {
    en: "Technician Partner Registration",
    hi: "तकनीशियन पार्टनर पंजीकरण",
    mr: "तंत्रज्ञ पार्टनर नोंदणी"
  },
  regSubheading: {
    en: "Join our verified marketplace. Complete your profile, verify your identity, and pass the safety skill test.",
    hi: "हमारे सत्यापित मार्केटप्लेस से जुड़ें। अपनी प्रोफ़ाइल पूरी करें, पहचान सत्यापित करें और सुरक्षा कौशल परीक्षा पास करें।",
    mr: "आमच्या पडताळणीकृत बाजारपेठेत सामील व्हा. आपले प्रोफाइल पूर्ण करा, ओळख पडताळा आणि सुरक्षा कौशल्य चाचणी उत्तीर्ण व्हा."
  },
  step1Title: {
    en: "Personal Details",
    hi: "व्यक्तिगत विवरण",
    mr: "वैयक्तिक तपशील"
  },
  step2Title: {
    en: "Trade & Experience",
    hi: "कार्यक्षेत्र व अनुभव",
    mr: "व्यवसाय आणि अनुभव"
  },
  step3Title: {
    en: "ID Verification",
    hi: "पहचान सत्यापन (KYC)",
    mr: "ओळख पडताळणी (KYC)"
  },
  step1Heading: {
    en: "Step 1: Technician Identity & Service Area",
    hi: "चरण १: तकनीशियन पहचान व सेवा क्षेत्र",
    mr: "टप्पा १: तंत्रज्ञ ओळख आणि सेवा क्षेत्र"
  },
  fullNameLabel: {
    en: "Full Legal Name *",
    hi: "पूरा कानूनी नाम *",
    mr: "पूर्ण कायदेशीर नाव *"
  },
  mobileLabel: {
    en: "Direct Mobile Number *",
    hi: "सीधा मोबाइल नंबर *",
    mr: "थेट मोबाईल नंबर *"
  },
  cityLabel: {
    en: "Operating City *",
    hi: "कार्यकारी शहर *",
    mr: "कार्यरत शहर *"
  },
  areaLabel: {
    en: "Service Area / Localities *",
    hi: "सेवा क्षेत्र / इलाके *",
    mr: "सेवा क्षेत्र / परिसर *"
  },
  privacyNotice: {
    en: "Your direct contact number is kept private and will only be shared with customers after you accept their job request.",
    hi: "आपका मोबाइल नंबर सुरक्षित रखा जाता है और ग्राहक के साथ केवल तब साझा किया जाता है जब आप उनका कार्य स्वीकार करते हैं।",
    mr: "आपला मोबाईल क्रमांक गोपनीय ठेवला जातो आणि आपण ग्राहकाचे काम स्वीकारल्यानंतरच त्यांच्याशी शेअर केला जातो."
  },
  continueToSkills: {
    en: "Continue to Skills",
    hi: "कौशल्य विवरण पर जाएं",
    mr: "कौशल्यांकडे पुढे जा"
  },
  step2Heading: {
    en: "Step 2: Practical Trade & Experience",
    hi: "चरण २: व्यावहारिक कार्यक्षेत्र व अनुभव",
    mr: "टप्पा २: प्रात्यक्षिक व्यवसाय आणि अनुभव"
  },
  primaryCategoryLabel: {
    en: "Primary Service Category *",
    hi: "मुख्य सेवा श्रेणी *",
    mr: "प्राथमिक सेवा श्रेणी *"
  },
  specialtyLabel: {
    en: "Specialty & Scope of Work *",
    hi: "विशेषज्ञता व कार्य का दायरा *",
    mr: "विशेषज्ञता आणि कामाची व्याप्ती *"
  },
  experienceYearsLabel: {
    en: "Years of Practical Field Experience:",
    hi: "क्षेत्रीय अनुभव (वर्षों में):",
    mr: "क्षेत्रातील प्रत्यक्ष कामाचा अनुभव (वर्षे):"
  },
  yearsSuffix: {
    en: "Years",
    hi: "वर्ष",
    mr: "वर्षे"
  },
  beginner: {
    en: "Beginner (0 yrs)",
    hi: "शुरुआती (० वर्ष)",
    mr: "नवशिका (० वर्षे)"
  },
  skilled: {
    en: "Skilled (5 yrs)",
    hi: "कुशल (५ वर्ष)",
    mr: "कुशल (५ वर्षे)"
  },
  master: {
    en: "Master (15+ yrs)",
    hi: "अनुभवी मास्टर (१५+ वर्ष)",
    mr: "मास्टर (१५+ वर्षे)"
  },
  testNotice: {
    en: "You will need to complete a 10-question practical safety exam for your selected category with at least 70% to receive verified status.",
    hi: "सत्यापित स्थिति प्राप्त करने के लिए आपको अपनी चुनी हुई श्रेणी में १० प्रश्नों की व्यावहारिक सुरक्षा परीक्षा कम से कम ७०% अंकों के साथ उत्तीर्ण करनी होगी।",
    mr: "पडताळणीकृत दर्जा मिळविण्यासाठी आपल्याला निवडलेल्या श्रेणीसाठी १० प्रश्नांची प्रात्यक्षिक सुरक्षा परीक्षा किमान ७०% गुणांसह उत्तीर्ण करावी लागेल."
  },
  backBtn: {
    en: "Back",
    hi: "पीछे जाएं",
    mr: "मागे जा"
  },
  continueToDocs: {
    en: "Continue to Documents",
    hi: "दस्तावेज़ सत्यापन पर जाएं",
    mr: "कागदपत्रांकडे पुढे जा"
  },
  step3Heading: {
    en: "Step 3: Identity Verification (KYC)",
    hi: "चरण ३: पहचान सत्यापन (KYC)",
    mr: "टप्पा ३: ओळख पडताळणी (KYC)"
  },
  govtIdLabel: {
    en: "Government Photo ID (Aadhaar / Voter ID / PAN) *",
    hi: "सरकारी फोटो पहचान पत्र (आधार / वोटर आईडी / पैन) *",
    mr: "शासकीय फोटो ओळखपत्र (आधार / मतदार ओळखपत्र / पॅन) *"
  },
  uploadingDoc: {
    en: "Uploading private document securely...",
    hi: "दस्तावेज़ सुरक्षित रूप से अपलोड हो रहा है...",
    mr: "कागदपत्र सुरक्षितपणे अपलोड होत आहे..."
  },
  docSecureVault: {
    en: "Stored securely in your private KYC vault.",
    hi: "आपकी निजी केवाईसी तिजोरी में सुरक्षित संग्रहीत।",
    mr: "आपल्या खाजगी केवायसी व्हॉल्टमध्ये सुरक्षित साठवले आहे."
  },
  changeDoc: {
    en: "Change Document",
    hi: "दस्तावेज़ बदलें",
    mr: "कागदपत्र बदला"
  },
  uploadIdPrompt: {
    en: "Upload Clear Photo or PDF of Government ID",
    hi: "सरकारी आईडी का स्पष्ट फोटो या पीडीएफ अपलोड करें",
    mr: "शासकीय ओळखपत्राचा स्पष्ट फोटो किंवा पीडीएफ अपलोड करा"
  },
  formatLimit: {
    en: "JPG, PNG, WebP or PDF (Max 5 MB)",
    hi: "JPG, PNG, WebP या PDF (अधिकतम ५ एमबी)",
    mr: "JPG, PNG, WebP किंवा PDF (कमाल ५ एमबी)"
  },
  selectFileBtn: {
    en: "Select File",
    hi: "फ़ाइल चुनें",
    mr: "फाइल निवडा"
  },
  tradeCertLabel: {
    en: "Trade Certificate or Diploma (Optional)",
    hi: "ट्रेड प्रमाणपत्र या डिप्लोमा (वैकल्पिक)",
    mr: "व्यवसाय प्रमाणपत्र किंवा डिप्लोमा (पर्यायी)"
  },
  uploadingCert: {
    en: "Uploading certificate...",
    hi: "प्रमाणपत्र अपलोड हो रहा है...",
    mr: "प्रमाणपत्र अपलोड होत आहे..."
  },
  change: {
    en: "Change",
    hi: "बदलें",
    mr: "बदला"
  },
  uploadCertPrompt: {
    en: "Upload ITI, Polytechnic, or OEM Certificate",
    hi: "आईटीआई, पॉलिटेक्निक या ओईएम प्रमाणपत्र अपलोड करें",
    mr: "आयटीआय, पॉलिटेक्निक किंवा ओईएम प्रमाणपत्र अपलोड करा"
  },
  certBoost: {
    en: "Boosts customer confidence and profile ranking",
    hi: "ग्राहकों के विश्वास और प्रोफ़ाइल रैंकिंग को बढ़ाता है",
    mr: "ग्राहकांचा विश्वास आणि प्रोफाइल रँकिंग वाढवते"
  },
  uploadCertBtn: {
    en: "Upload Certificate",
    hi: "प्रमाणपत्र अपलोड करें",
    mr: "प्रमाणपत्र अपलोड करा"
  },
  agreementText: {
    en: "I agree to FixNear Trust safety standards, transparent rate card compliance, and identity verification. I understand that fraudulent finish codes or off-platform demands will result in permanent suspension.",
    hi: "मैं फिक्सनियर ट्रस्ट के सुरक्षा मानकों, पारदर्शी दर सूची और पहचान सत्यापन से सहमत हूं। मैं समझता हूं कि गलत फिनिश कोड या ऑफलाइन नकद मांगने पर स्थायी निलंबन होगा।",
    mr: "मी फिक्सनियर ट्रस्ट सुरक्षा मानके, पारदर्शक दर कार्ड आणि ओळख पडताळणीस सहमती दर्शवतो. खोटे फिनिश कोड किंवा ऑफलाइन पैशांची मागणी केल्यास कायमचे निलंबन होईल हे मला मान्य आहे."
  },
  savingProfile: {
    en: "Saving Profile...",
    hi: "प्रोफ़ाइल सहेजी जा रही है...",
    mr: "प्रोफाइल जतन होत आहे..."
  },
  completeAndStartTest: {
    en: "Complete & Start Skill Test",
    hi: "पंजीकरण पूरा करें व कौशल परीक्षा शुरू करें",
    mr: "पूर्ण करा आणि कौशल्य चाचणी सुरू करा"
  }
};

const providerTestAdditions = {
  loadingSession: {
    en: "Loading skill test session...",
    hi: "कौशल परीक्षा सत्र लोड हो रहा है...",
    mr: "कौशल्य चाचणी सत्र लोड होत आहे..."
  },
  cooldownActive: {
    en: "Skill Test Cooldown Active",
    hi: "कौशल परीक्षा कूलडाउन सक्रिय",
    mr: "कौशल्य चाचणी प्रतीक्षा कालावधी सक्रिय"
  },
  cooldownNotice: {
    en: "To uphold high workmanship and customer safety standards on FixNear Trust, a mandatory 24-hour study and preparation cooldown is enforced following an unsuccessful test attempt.",
    hi: "फिक्सनियर ट्रस्ट पर गुणवत्ता और सुरक्षा बनाए रखने के लिए, असफल प्रयास के बाद २४ घंटे का अध्ययन और तैयारी कूलडाउन लागू किया जाता है।",
    mr: "फिक्सनियर ट्रस्टवर दर्जा आणि सुरक्षितता टिकवण्यासाठी, अयशस्वी प्रयत्नानंतर २४ तासांचा अभ्यास आणि तयारीचा प्रतीक्षा कालावधी लागू केला जातो."
  },
  cooldownAdvice: {
    en: "Please review standard safety codes, manufacturer technical specifications, and diagnostic procedures. You will be able to retake the test once the cooldown timer elapses.",
    hi: "कृपया मानक सुरक्षा नियमों, तकनीकी विशिष्टताओं और प्रक्रियाओं की समीक्षा करें। समय समाप्त होने पर आप पुनः परीक्षा दे सकेंगे।",
    mr: "कृपया मानक सुरक्षा नियम, तांत्रिक तपशील आणि पद्धतींचा अभ्यास करा. वेळ संपल्यानंतर आपण पुन्हा परीक्षा देऊ शकाल."
  },
  goToDashboard: {
    en: "Go to Dashboard",
    hi: "डैशबोर्ड पर जाएं",
    mr: "डॅशबोर्डवर जा"
  },
  browseRateCards: {
    en: "Browse Service Rate Cards",
    hi: "सेवा दर सूची देखें",
    mr: "सेवा दर पत्रक पहा"
  },
  assessmentHeading: {
    en: "Practical Safety Skill Assessment",
    hi: "व्यावहारिक सुरक्षा कौशल मूल्यांकन",
    mr: "प्रात्यक्षिक सुरक्षा कौशल्य मूल्यमापन"
  },
  categoryLabel: {
    en: "Category:",
    hi: "श्रेणी:",
    mr: "श्रेणी:"
  },
  rulesHeading: {
    en: "Exam Structure & Anti-Cheat Rules:",
    hi: "परीक्षा संरचना और सुरक्षा नियम:",
    mr: "परीक्षा रचना आणि सुरक्षा नियम:"
  },
  rule1: {
    en: "10 Shuffled Questions pulled dynamically from the server question bank.",
    hi: "१० यादृच्छिक प्रश्न सीधे सर्वर प्रश्न बैंक से पूछे जाएंगे।",
    mr: "१० प्रश्न थेट सर्व्हर प्रश्नपेढीतून विचारले जातील."
  },
  rule2: {
    en: "15 Minutes Countdown (starts immediately when you click Start).",
    hi: "१५ मिनट की समय सीमा (स्टार्ट पर क्लिक करते ही शुरू होगी)।",
    mr: "१५ मिनिटांची वेळ (स्टार्टवर क्लिक करताच सुरू होईल)."
  },
  rule3: {
    en: "Pass Mark: 70% (at least 7 correct answers).",
    hi: "उत्तीर्ण अंक: ७०% (कम से कम ७ सही उत्तर)।",
    mr: "उत्तीर्ण गुण: ७०% (किमान ७ बरोबर उत्तरे)."
  },
  rule4: {
    en: "Badges: Bronze (70-79%), Silver (80-89%), Gold (90-100%).",
    hi: "बैज: कांस्य (७०-७९%), रजत (८०-८९%), स्वर्ण (९०-१००%)।",
    mr: "बॅज: कांस्य (७०-७९%), रौप्य (८०-८९%), सुवर्ण (९०-१००%)."
  },
  rule5: {
    en: "24-Hour Cooldown: Enforced automatically if the pass mark is not met.",
    hi: "२४ घंटे का कूलडाउन: अंक प्राप्त न होने पर स्वचालित रूप से लागू।",
    mr: "२४ तासांचा कूलडाउन: उत्तीर्ण न झाल्यास आपोआप लागू."
  },
  rule6: {
    en: "Browser Tab Switches: Recorded as informational integrity checks.",
    hi: "ब्राउज़र टैब परिवर्तन: सत्यनिष्ठा जांच के लिए दर्ज किया जाएगा।",
    mr: "टॅब बदलणे: सचोटी तपासणीसाठी नोंदवले जाईल."
  },
  startExamBtn: {
    en: "Start 15-Minute Exam",
    hi: "१५ मिनट की परीक्षा शुरू करें",
    mr: "१५ मिनिटांची परीक्षा सुरू करा"
  },
  correctLabel: {
    en: "Correct",
    hi: "सही उत्तर",
    mr: "बरोबर उत्तरे"
  },
  badgeLabel: {
    en: "Badge",
    hi: "बैज",
    mr: "बॅज"
  },
  verifiedRating: {
    en: "Verified Safety Rating",
    hi: "सत्यापित सुरक्षा रेटिंग",
    mr: "प्रमाणित सुरक्षा रेटिंग"
  },
  areasToImprove: {
    en: "Areas to Improve:",
    hi: "सुधार के क्षेत्र:",
    mr: "सुधारणेची क्षेत्रे:"
  },
  questionLabel: {
    en: "Question",
    hi: "प्रश्न",
    mr: "प्रश्न"
  },
  ofLabel: {
    en: "of",
    hi: "का",
    mr: "पैकी"
  },
  answeredLabel: {
    en: "Answered",
    hi: "उत्तर दिया",
    mr: "उत्तरे दिली"
  },
  previousBtn: {
    en: "Previous",
    hi: "पिछला",
    mr: "मागील"
  },
  nextBtn: {
    en: "Next",
    hi: "अगला",
    mr: "पुढील"
  },
  submittingExam: {
    en: "Submitting...",
    hi: "सबमिट किया जा रहा है...",
    mr: "सादर होत आहे..."
  },
  submitExamBtn: {
    en: "Submit Exam",
    hi: "परीक्षा सबमिट करें",
    mr: "परीक्षा सादर करा"
  },
  tabSwitchTitle: {
    en: "Tab Switch Detected",
    hi: "टैब परिवर्तन का पता चला",
    mr: "टॅब बदल आढळला"
  },
  tabSwitchNotice: {
    en: "You navigated away from the assessment window. Please keep this tab focused.",
    hi: "आप मूल्यांकन विंडो से दूर चले गए थे। कृपया इसी टैब पर ध्यान केंद्रित रखें।",
    mr: "आपण मूल्यमापन विंडोवरून दूर गेलात. कृपया याच टॅबवर लक्ष केंद्रित ठेवा."
  },
  returnToTestBtn: {
    en: "Return to Assessment",
    hi: "मूल्यांकन पर लौटें",
    mr: "मूल्यांकनावर परत जा"
  }
};

const providerDashboardAdditions = {
  verifiedPartner: {
    "en": "✓ Verified Partner",
    "hi": "✓ सत्यापित पार्टनर",
    "mr": "✓ पडताळलेले पार्टनर"
  },
  underReview: {
    "en": "⏳ Under Review",
    "hi": "⏳ समीक्षाधीन",
    "mr": "⏳ पुनरावलोकनाधीन"
  },
  moreInfoNeeded: {
    "en": "⚠️ More Info Needed",
    "hi": "⚠️ अतिरिक्त जानकारी आवश्यक",
    "mr": "⚠️ अधिक माहिती आवश्यक"
  },
  kycRejected: {
    "en": "❌ KYC Rejected",
    "hi": "❌ केवाईसी अस्वीकृत",
    "mr": "❌ केवायसी नाकारले"
  },
  testRequired: {
    "en": "📝 Test Required",
    "hi": "📝 परीक्षा आवश्यक",
    "mr": "📝 चाचणी आवश्यक"
  },
  onlineActive: {
    "en": "Online (Dispatches Active)",
    "hi": "ऑनलाइन (कार्य उपलब्ध)",
    "mr": "ऑनलाइन (कामे उपलब्ध)"
  },
  offline: {
    "en": "Offline",
    "hi": "ऑफलाइन",
    "mr": "ऑफलाइन"
  },
  toggleOnlineTooltip: {
    "en": "Toggle dispatch availability",
    "hi": "उपलब्धता बदलें",
    "mr": "उपलब्धता बदला"
  },
  onlyApprovedTooltip: {
    "en": "Only approved partners can go online",
    "hi": "केवल स्वीकृत पार्टनर ही ऑनलाइन हो सकते हैं",
    "mr": "केवळ मंजूर पार्टनरच ऑनलाइन होऊ शकतात"
  },
  defaultRejectionReason: {
    "en": "Uploaded documents could not be verified. Please ensure your Govt ID is clear and legible.",
    "hi": "अपलोड किए गए दस्तावेज़ सत्यापित नहीं किए जा सके। कृपया सुनिश्चित करें कि आपका पहचान पत्र स्पष्ट और पठनीय है।",
    "mr": "अपलोड केलेली कागदपत्रे पडताळली जाऊ शकली नाहीत. कृपया आपले ओळखपत्र स्पष्ट असल्याची खात्री करा."
  },
  adminMessage: {
    "en": "Admin Message:",
    "hi": "एडमिन संदेश:",
    "mr": "प्रशासक संदेश:"
  },
  defaultAdminMessage: {
    "en": "Please upload a clearer copy of your Govt ID proof or trade certificate.",
    "hi": "कृपया अपने पहचान पत्र या व्यापार प्रमाण पत्र की अधिक स्पष्ट प्रति अपलोड करें।",
    "mr": "कृपया आपल्या ओळखपत्राची किंवा प्रमाणपत्राची स्पष्ट प्रत अपलोड करा."
  },
  defaultSuspensionReason: {
    "en": "Account flagged due to customer disputes or quality reviews below platform standards.",
    "hi": "ग्राहक विवादों या गुणवत्ता मानकों से कम होने के कारण खाता निलंबित किया गया।",
    "mr": "ग्राहक तक्रारी किंवा दर्जा मानकांनुसार नसल्यामुळे खाते निलंबित करण्यात आले."
  },
  customerPlaceholder: {
    "en": "Customer",
    "hi": "ग्राहक",
    "mr": "ग्राहक"
  },
  contactRevealedNotice: {
    "en": "Contact revealed upon arrival",
    "hi": "पहुंचने पर संपर्क प्रदर्शित होगा",
    "mr": "पोहोचल्यानंतर संपर्क दिसेल"
  },
  standardNotes: {
    "en": "Standard service request",
    "hi": "मानक सेवा अनुरोध",
    "mr": "सर्वसाधारण सेवा विनंती"
  },
  verifiedCustomer: {
    "en": "Verified Customer",
    "hi": "सत्यापित ग्राहक",
    "mr": "पडताळलेले ग्राहक"
  },
  receiptIssued: {
    "en": "Receipt Issued",
    "hi": "रसीद जारी की गई",
    "mr": "पावती दिली"
  },
  confirming: {
    "en": "Confirming...",
    "hi": "पुष्टि हो रही है...",
    "mr": "पुष्टी करत आहे..."
  },
  confirmCashReceived: {
    "en": "Confirm Cash Received",
    "hi": "नकद प्राप्त होने की पुष्टि करें",
    "mr": "रोख रक्कम मिळाल्याची पुष्टी करा"
  },
  feeDeductionNotice: {
    "en": "Platform fee & commission deducted",
    "hi": "प्लेटफॉर्म शुल्क व कमीशन काटकर",
    "mr": "प्लॅटफॉर्म फी आणि कमिशन वजा करून"
  },
  rollingWeeklyTotal: {
    "en": "Active rolling weekly total",
    "hi": "चालू साप्ताहिक कुल",
    "mr": "चालू आठवड्याची एकूण कमाई"
  },
  acrossCompletedJobs: {
    "en": "Across completed jobs",
    "hi": "पूर्ण किए गए कार्यों से",
    "mr": "पूर्ण केलेल्या कामांमधून"
  },
  viewGovtId: {
    "en": "View Govt ID Proof (Private)",
    "hi": "पहचान पत्र देखें (निजी)",
    "mr": "सरकारी ओळखपत्र पहा (खाजगी)"
  },
  viewTradeCert: {
    "en": "View Trade Certificate (Private)",
    "hi": "व्यापार प्रमाण पत्र देखें (निजी)",
    "mr": "व्यावसायिक प्रमाणपत्र पहा (खाजगी)"
  },
  generatingUrl: {
    "en": "Generating Signed URL...",
    "hi": "सुरक्षित लिंक बनाई जा रही है...",
    "mr": "सुरक्षित लिंक तयार करत आहे..."
  },
  sendQuoteToCustomer: {
    "en": "Send Quote to Customer",
    "hi": "ग्राहक को कोटेशन भेजें",
    "mr": "ग्राहकाला कोटेशन पाठवा"
  },
  sending: {
    "en": "Sending...",
    "hi": "भेज रहे हैं...",
    "mr": "पाठवत आहे..."
  },
  verifyAndFinish: {
    "en": "Verify Code & Finish Job",
    "hi": "कोड सत्यापित करें और काम पूरा करें",
    "mr": "कोड तपासा आणि काम पूर्ण करा"
  },
  verifying: {
    "en": "Verifying...",
    "hi": "सत्यापित हो रहा है...",
    "mr": "तपासत आहे..."
  },
  verifiedSkillBadge: {
    "en": "Verified Skill Badge",
    "hi": "सत्यापित कौशल बैज",
    "mr": "प्रमाणित कौशल्य बॅज"
  },
  certPending: {
    "en": "Certification Pending",
    "hi": "प्रमाणन लंबित",
    "mr": "प्रमाणन प्रलंबित"
  },
  passedExam: {
    "en": "(Passed anti-cheat exam)",
    "hi": "(परीक्षा उत्तीर्ण)",
    "mr": "(परीक्षा उत्तीर्ण)"
  },
  requires70: {
    "en": "(Requires 70% to pass)",
    "hi": "(उत्तीर्ण के लिए 70% आवश्यक)",
    "mr": "(उत्तीर्ण होण्यासाठी ७०% आवश्यक)"
  },
  uploaded: {
    "en": "✓ Uploaded",
    "hi": "✓ अपलोड किया गया",
    "mr": "✓ अपलोड केले"
  },
  missing: {
    "en": "Missing",
    "hi": "अनुपलब्ध",
    "mr": "अनुपलब्ध"
  },
  onFile: {
    "en": "On file",
    "hi": "दर्ज है",
    "mr": "नोंदणीकृत"
  },
  citywide: {
    "en": "Citywide",
    "hi": "पूरे शहर में",
    "mr": "संपूर्ण शहरात"
  },
  generalSpecialist: {
    "en": "General Service Specialist",
    "hi": "सामान्य सेवा विशेषज्ञ",
    "mr": "सर्वसाधारण सेवा तज्ज्ञ"
  },
  currentlyOnline: {
    "en": "Currently Online",
    "hi": "वर्तमान में ऑनलाइन",
    "mr": "सध्या ऑनलाइन"
  },
  goOnlineNow: {
    "en": "Go Online Now",
    "hi": "अभी ऑनलाइन जाएं",
    "mr": "आता ऑनलाइन व्हा"
  },

  portalLoading: {
    en: "Loading Service Partner Portal...",
    hi: "सर्विस पार्टनर पोर्टल लोड हो रहा है...",
    mr: "सर्व्हिस पार्टनर पोर्टल लोड होत आहे..."
  },
  skillCertified: {
    en: "Skill Certified",
    hi: "कौशल प्रमाणित",
    mr: "कौशल्य प्रमाणित"
  },
  partnerConsole: {
    en: "Specialist Partner Console",
    hi: "विशेषज्ञ पार्टनर कंसोल",
    mr: "विशेषज्ञ पार्टनर कन्सोल"
  },
  ratingPrefix: {
    en: "Rating:",
    hi: "रेटिंग:",
    mr: "रेटिंग:"
  },
  jobsCompletedSuffix: {
    en: "jobs completed)",
    hi: "कार्य पूर्ण)",
    mr: "कामे पूर्ण)"
  },
  password: {
    en: "Password",
    hi: "पासवर्ड",
    mr: "पासवर्ड"
  },
  signOut: {
    en: "Sign Out",
    hi: "साइन आउट",
    mr: "साइन आउट"
  },
  testRequiredBanner: {
    en: "Skill Certification Test Required",
    hi: "कौशल प्रमाणन परीक्षा आवश्यक है",
    mr: "कौशल्य प्रमाणीकरण चाचणी आवश्यक आहे"
  },
  testRequiredDesc: {
    en: "Complete the 15-minute, 10-question technical test (70% pass mark) to unlock incoming job dispatches.",
    hi: "आने वाले नए कार्य अनुरोध प्राप्त करने के लिए १५ मिनट की तकनीकी परीक्षा (७०% अंक) पूरी करें।",
    mr: "नवीन कामाच्या विनंत्या मिळवण्यासाठी १५ मिनिटांची तांत्रिक चाचणी (७०% गुण) पूर्ण करा."
  },
  startTestBtn: {
    en: "Start 15-Min Skill Test",
    hi: "१५ मिनट की कौशल परीक्षा शुरू करें",
    mr: "१५ मिनिटांची चाचणी सुरू करा"
  },
  underVerificationBanner: {
    en: "Application Under Verification: You have passed your skill test! Your KYC documents are currently in the Admin Approval queue. Dispatches will activate upon admin sign-off.",
    hi: "आवेदन सत्यापन जारी है: आपने परीक्षा पास कर ली है! आपके दस्तावेज़ व्यवस्थापक समीक्षा में हैं। स्वीकृति मिलते ही कार्य आवंटन शुरू होगा।",
    mr: "अर्ज पडताळणी सुरू आहे: आपण परीक्षा उत्तीर्ण झाला आहात! आपली कागदपत्रे प्रशासक पडताळणीत आहेत. मंजुरी मिळताच कामे सुरू होतील."
  },
  kycUnsuccessful: {
    en: "KYC Verification Unsuccessful",
    hi: "केवाईसी सत्यापन असफल",
    mr: "केवायसी पडताळणी अयशस्वी"
  },
  adminReason: {
    en: "Admin Reason:",
    hi: "व्यवस्थापक की टिप्पणी:",
    mr: "प्रशासकाचे कारण:"
  },
  fixResubmitKyc: {
    en: "Fix & Resubmit KYC",
    hi: "दस्तावेज़ ठीक कर पुनः भेजें",
    mr: "दुरुस्त करून पुन्हा सादर करा"
  },
  moreInfoRequested: {
    en: "Additional Information Requested",
    hi: "अतिरिक्त जानकारी का अनुरोध",
    mr: "अतिरिक्त माहितीची विनंती"
  },
  updateDocs: {
    en: "Update Documents",
    hi: "दस्तावेज़ अद्यतन करें",
    mr: "कागदपत्रे अद्यतन करा"
  },
  accountSuspended: {
    en: "Account Suspended by FixNear Trust & Safety",
    hi: "फिक्सनियर ट्रस्ट एवं सुरक्षा द्वारा खाता निलंबित",
    mr: "फिक्सनियर ट्रस्ट व सुरक्षेद्वारे खाते निलंबित"
  },
  reasonPrefix: {
    en: "Reason:",
    hi: "कारण:",
    mr: "कारण:"
  },
  newOfferTitle: {
    en: "⚡ New Incoming Dispatch Offer",
    hi: "⚡ नया कार्य अनुरोध उपलब्ध",
    mr: "⚡ नवीन कामाची विनंती उपलब्ध"
  },
  nearestTechMatch: {
    en: "Nearest verified technician match in",
    hi: "निकटतम सत्यापित तकनीशियन मिलान:",
    mr: "परिसरातील सर्वात जवळचे तंत्रज्ञ मिलान:"
  },
  offerExpiresInPrefix: {
    en: "Offer expires in",
    hi: "अनुरोध समाप्त होने में शेष:",
    mr: "विनंतीची मुदत संपण्यास शिल्लक:"
  },
  dateLabel: {
    en: "Date:",
    hi: "दिनांक:",
    mr: "दिनांक:"
  },
  slotLabel: {
    en: "Slot:",
    hi: "समय:",
    mr: "वेळ:"
  },
  estimatedPayout: {
    en: "Estimated Payout",
    hi: "अनुमानित कमाई",
    mr: "अंदाजे कमाई"
  },
  acceptJobBtn: {
    en: "Accept Job",
    hi: "कार्य स्वीकारें",
    mr: "काम स्वीकारा"
  },
  passBtn: {
    en: "Pass",
    hi: "छोड़ें",
    mr: "सोडा"
  },
  tabActiveJobs: {
    en: "Active Jobs",
    hi: "सक्रिय कार्य",
    mr: "सक्रिय कामे"
  },
  tabHistory: {
    en: "Completed History",
    hi: "पूर्ण कार्यों का इतिहास",
    mr: "पूर्ण झालेल्या कामांचा इतिहास"
  },
  tabEarnings: {
    en: "Live Earnings",
    hi: "लाइव कमाई",
    mr: "थेट कमाई"
  },
  tabCredentials: {
    en: "Credentials & KYC",
    hi: "प्रमाणपत्र व केवाईसी",
    mr: "प्रमाणपत्रे आणि केवायसी"
  },
  noActiveJobs: {
    en: "No Active Jobs In Progress",
    hi: "वर्तमान में कोई सक्रिय कार्य नहीं है",
    mr: "सध्या कोणतेही सक्रिय काम नाही"
  },
  keepOnlineNotice: {
    en: "Keep your status set to Online to receive instant customer dispatch requests matching your verified skills.",
    hi: "अपने कौशल से मेल खाते नए ग्राहक अनुरोध प्राप्त करने के लिए अपनी स्थिति ऑनलाइन रखें।",
    mr: "आपल्या कौशल्यांनुसार नवीन ग्राहकांच्या विनंत्या मिळवण्यासाठी आपली स्थिती ऑनलाइन ठेवा."
  },
  bookingRef: {
    en: "Booking #",
    hi: "बुकिंग #",
    mr: "बुकिंग #"
  },
  complaintOpen: {
    en: "⚠️ Complaint Open",
    hi: "⚠️ शिकायत लंबित",
    mr: "⚠️ तक्रार प्रलंबित"
  },
  customerNameLabel: {
    en: "Customer Name",
    hi: "ग्राहक का नाम",
    mr: "ग्राहकाचे नाव"
  },
  doorstepAddressLabel: {
    en: "Doorstep Address",
    hi: "घर का पता",
    mr: "घराचा पत्ता"
  },
  problemDescLabel: {
    en: "Problem Description",
    hi: "समस्या का विवरण",
    mr: "समस्येचे वर्णन"
  },
  sparePartsQuoteLabel: {
    en: "Spare Parts Quotation:",
    hi: "स्पेयर पार्ट्स कोटेशन:",
    mr: "सुट्या भागांचे कोटेशन:"
  },
  statusIs: {
    en: "Status is",
    hi: "स्थिति है",
    mr: "स्थिती आहे"
  },
  extraSuffix: {
    en: "Extra).",
    hi: "अतिरिक्त)।",
    mr: "अतिरिक्त)."
  },
  onTheWayBtn: {
    en: "I'm On The Way",
    hi: "मैं रास्ते में हूं",
    mr: "मी निघालो आहे"
  },
  arrivedBtn: {
    en: "Arrived / Start Work",
    hi: "पहुंच गए / कार्य शुरू करें",
    mr: "पोहोचलो / काम सुरू करा"
  },
  sendQuoteBtn: {
    en: "Send Extra Parts Quote",
    hi: "अतिरिक्त पुर्जों का कोटेशन भेजें",
    mr: "अतिरिक्त भागांचे कोटेशन पाठवा"
  },
  finishWithCodeBtn: {
    en: "Finish with Customer Code",
    hi: "ग्राहक कोड द्वारा कार्य पूरा करें",
    mr: "ग्राहक कोड टाकून काम पूर्ण करा"
  },
  codeSecurityNotice: {
    en: "The 4-digit completion code is held securely by the customer until repair satisfaction.",
    hi: "४-अंकीय समापन कोड कार्य से संतुष्ट होने तक ग्राहक के पास सुरक्षित रहता है।",
    mr: "४-अंकी काम पूर्णत्व कोड ग्राहकाचे समाधान होईपर्यंत त्यांच्याकडे सुरक्षित असतो."
  },
  completedRecords: {
    en: "Completed Workmanship Records",
    hi: "पूर्ण कार्यों का रिकॉर्ड",
    mr: "पूर्ण झालेल्या कामांची नोंद"
  },
  noCompletedJobs: {
    en: "No completed jobs yet. Complete jobs using customer code to build your verified trust score.",
    hi: "अभी तक कोई पूर्ण कार्य नहीं। अपना ट्रस्ट स्कोर बढ़ाने के लिए ग्राहक कोड द्वारा कार्य पूरा करें।",
    mr: "अद्याप कोणतीही कामे पूर्ण झालेली नाहीत. आपला विश्वास निर्देशांक वाढवण्यासाठी ग्राहक कोड वापरून कामे पूर्ण करा."
  },
  warrantedBadge: {
    en: "✓ Warranted",
    hi: "✓ वारंटी युक्त",
    mr: "✓ हमीसह"
  },
  customerLabel: {
    en: "Customer:",
    hi: "ग्राहक:",
    mr: "ग्राहक:"
  },
  bookingNumLabel: {
    en: "· Booking #",
    hi: "· बुकिंग #",
    mr: "· बुकिंग #"
  },
  ratedLabel: {
    en: "Rated",
    hi: "रेटिंग",
    mr: "रेटिंग"
  },
  amountBilled: {
    en: "Amount Billed",
    hi: "कुल बिल राशि",
    mr: "एकूण बिल रक्कम"
  },
  paidBadge: {
    en: "✓ Paid",
    hi: "✓ भुगतान संपन्न",
    mr: "✓ पेमेंट झाले"
  },
  todayNet: {
    en: "Today's Net Earnings",
    hi: "आज की शुद्ध कमाई",
    mr: "आजची निव्वळ कमाई"
  },
  weekNet: {
    en: "Last 7 Days (Week)",
    hi: "पिछले ७ दिन (सप्ताह)",
    mr: "मागील ७ दिवस (आठवडा)"
  },
  monthNet: {
    en: "Last 30 Days (Month)",
    hi: "पिछले ३० दिन (माह)",
    mr: "मागील ३० दिवस (महिना)"
  },
  commissionTitle: {
    en: "FixNear Fair Partner Commission Structure",
    hi: "फिक्सनियर पारदर्शी पार्टनर कमीशन संरचना",
    mr: "फिक्सनियर पारदर्शक पार्टनर कमिशन रचना"
  },
  commissionNotice: {
    en: "FixNear deducts a flat commission and platform security fee per completed order. Technicians keep all approved parts and labor with zero surprise deductions.",
    hi: "फिक्सनियर प्रत्येक पूर्ण ऑर्डर पर एक निश्चित कमीशन और सुरक्षा शुल्क लेता है। तकनीशियनों को बिना किसी अज्ञात कटौती के सभी स्वीकृत भागों और श्रम का पूरा भुगतान मिलता है।",
    mr: "फिक्सनियर प्रत्येक पूर्ण झालेल्या ऑर्डरवर एक निश्चित कमिशन आणि सुरक्षा शुल्क घेते. तंत्रज्ञांना कोणत्याही अनपेक्षित कपातीशिवाय सर्व मंजूर भाग आणि मजुरीची पूर्ण रक्कम मिळते."
  },
  credentialsTitle: {
    en: "Your Verified Technical Credentials & KYC",
    hi: "आपके सत्यापित तकनीकी प्रमाण व केवाईसी",
    mr: "आपली प्रमाणित तांत्रिक प्रमाणपत्रे आणि केवायसी"
  },
  specialtyAndCity: {
    en: "Specialty & City",
    hi: "विशेषज्ञता व शहर",
    mr: "विशेषज्ञता आणि शहर"
  },
  experienceLabel: {
    en: "Experience",
    hi: "अनुभव",
    mr: "अनुभव"
  },
  fieldExp: {
    en: "+ Years Working Field Experience",
    hi: "+ वर्ष कार्यक्षेत्रीय अनुभव",
    mr: "+ वर्षे प्रत्यक्ष कामाचा अनुभव"
  },
  kycStatusLabel: {
    en: "KYC Status",
    hi: "केवाईसी स्थिति",
    mr: "केवायसी स्थिती"
  },
  idProofLabel: {
    en: "ID Proof:",
    hi: "पहचान प्रमाण:",
    mr: "ओळख पुरावा:"
  },
  skillsCert: {
    en: "Skills Certification",
    hi: "कौशल्य प्रमाणन",
    mr: "कौशल्य प्रमाणीकरण"
  },
  scoreLabel: {
    en: "Score:",
    hi: "प्राप्तांक:",
    mr: "गुण:"
  },
  noSkills: {
    en: "No verified skills recorded yet. Complete your trade craft test to receive incoming dispatches.",
    hi: "अभी तक कोई कौशल दर्ज नहीं। कार्य अनुरोध प्राप्त करने के लिए अपनी कौशल परीक्षा पूरी करें।",
    mr: "अद्याप कोणतीही कौशल्ये नोंदवलेली नाहीत. नवीन कामे मिळवण्यासाठी आपली कौशल्य चाचणी पूर्ण करा."
  },
  privateKycDocs: {
    en: "Private KYC Documents",
    hi: "निजी केवाईसी दस्तावेज़",
    mr: "खाजगी केवायसी कागदपत्रे"
  },
  idNotUploaded: {
    en: "Govt ID proof not uploaded",
    hi: "सरकारी पहचान पत्र अपलोड नहीं है",
    mr: "शासकीय ओळखपत्र अपलोड केलेले नाही"
  },
  testAnotherCraft: {
    en: "Test for Another Trade Craft",
    hi: "अन्य कौशल्य के लिए परीक्षा दें",
    mr: "दुसऱ्या कौशल्यासाठी चाचणी द्या"
  },
  updateKycDetails: {
    en: "Update KYC Details",
    hi: "केवाईसी विवरण अद्यतन करें",
    mr: "केवायसी तपशील अद्यतन करा"
  },
  digitalQuoteTitle: {
    en: "Submit Itemized Digital Quotation",
    hi: "मदवार डिजिटल कोटेशन सबमिट करें",
    mr: "तपशीलवार डिजिटल कोटेशन सादर करा"
  },
  quoteWarning: {
    en: "FixNear prevents verbal estimates. The customer must tap 'Approve' on their phone before you install any spare parts.",
    hi: "फिक्सनियर मौखिक अनुमानों को रोकता है। कोई भी पुर्जा लगाने से पहले ग्राहक को अपने फोन पर 'स्वीकार' करना होगा।",
    mr: "फिक्सनियर तोंडी अंदाजे रोखते. कोणतेही सुटे भाग बसवण्यापूर्वी ग्राहकाने त्यांच्या फोनवर 'मंजूर' केले पाहिजे."
  },
  defectReasonLabel: {
    en: "Diagnostic Finding / Defect Reason *",
    hi: "जांच रिपोर्ट / खराबी का कारण *",
    mr: "तपासणी निष्कर्ष / दोषाचे कारण *"
  },
  partNameLabel: {
    en: "Replacement Part Name & Brand *",
    hi: "स्पेयर पार्ट का नाम व ब्रांड *",
    mr: "सुट्या भागाचे नाव आणि ब्रँड *"
  },
  partCostLabel: {
    en: "Part Cost (₹) *",
    hi: "पुर्जे की लागत (₹) *",
    mr: "भागाची किंमत (₹) *"
  },
  installLaborLabel: {
    en: "Installation Labor (₹)",
    hi: "स्थापना मजदूरी (₹)",
    mr: "बसवण्याची मजुरी (₹)"
  },
  totalAddlQuote: {
    en: "Total Additional Quotation:",
    hi: "कुल अतिरिक्त कोटेशन:",
    mr: "एकूण अतिरिक्त कोटेशन:"
  },
  enterFinishCodeTitle: {
    en: "Enter Customer 4-Digit Completion Code",
    hi: "ग्राहक का ४-अंकीय समापन कोड दर्ज करें",
    mr: "ग्राहकाचा ४-अंकी काम पूर्णत्व कोड प्रविष्ट करा"
  },
  enterFinishCodeDesc: {
    en: "Ask the customer for the 4-digit code displayed on their FixNear tracking screen once the repair has been tested and demonstrated.",
    hi: "मरम्मत की जांच और प्रदर्शन के बाद ग्राहक की ट्रैकिंग स्क्रीन पर प्रदर्शित ४-अंकीय कोड मांगें।",
    mr: "दुरुस्तीची चाचणी आणि प्रात्यक्षिक दाखवल्यानंतर ग्राहकांच्या ट्रॅकिंग स्क्रीनवर दिसणारा ४-अंकी कोड विचारा."
  }
};

const adminAdditions = {
  aggregatingOps: {
    "en": "Aggregating Live Platform Operations...",
    "hi": "लाइव प्लेटफॉर्म ऑपरेशंस संकलित हो रहे हैं...",
    "mr": "थेट प्लॅटफॉर्म ऑपरेशन्स एकत्रित करत आहे..."
  },
  aggregatingOpsDesc: {
    "en": "Querying MongoDB bookings, verification queues, and dispute escrow balances.",
    "hi": "डेटाबेस, सत्यापन कतार और विवाद शेष की जांच की जा रही है।",
    "mr": "डेटाबेस, पडताळणी रांगा आणि वाद शिल्लक तपासत आहे."
  },
  failedToLoadOps: {
    "en": "Failed to Load Central Operations",
    "hi": "केंद्रीय संचालन लोड करने में विफल",
    "mr": "मध्यवर्ती ऑपरेशन्स लोड करण्यात अयशस्वी"
  },
  retryOpsSync: {
    "en": "Retry Operations Sync",
    "hi": "पुनः प्रयास करें",
    "mr": "पुन्हा प्रयत्न करा"
  },
  liveDbSync: {
    "en": "✓ Live database sync",
    "hi": "✓ लाइव डेटाबेस सिंक",
    "mr": "✓ थेट डेटाबेस सिंक"
  },
  inProgressRightNow: {
    "en": "In progress right now",
    "hi": "इस समय प्रगति पर है",
    "mr": "सध्या चालू आहे"
  },
  prosOnline: {
    "en": "Pros Online",
    "hi": "ऑनलाइन तकनीशियन",
    "mr": "ऑनलाइन तंत्रज्ञ"
  },
  ofRegistered: {
    "en": "registered",
    "hi": "पंजीकृत में से",
    "mr": "नोंदणीकृत पैकी"
  },
  waitingApprovals: {
    "en": "Waiting Approvals",
    "hi": "स्वीकृति हेतु प्रतीक्षारत",
    "mr": "मंजुरीसाठी प्रलंबित"
  },
  kycReviewReady: {
    "en": "KYC review ready",
    "hi": "केवाईसी समीक्षा तैयार",
    "mr": "केवायसी पुनरावलोकनासाठी तयार"
  },
  openDisputes: {
    "en": "Open Disputes",
    "hi": "सक्रिय शिकायतें",
    "mr": "सक्रिय तक्रारी"
  },
  requiresMediation: {
    "en": "Requires mediation",
    "hi": "मध्यस्थता आवश्यक",
    "mr": "मध्यस्थता आवश्यक"
  },
  zeroDisputes: {
    "en": "Zero disputes",
    "hi": "शून्य शिकायतें",
    "mr": "शून्य तक्रारी"
  },
  grossVolume: {
    "en": "Gross Volume",
    "hi": "सकल कारोबार",
    "mr": "एकूण उलाढाल"
  },
  escrowProtected: {
    "en": "Escrow protected",
    "hi": "एस्क्रो संरक्षित",
    "mr": "एस्क्रो संरक्षित"
  },
  platformFees: {
    "en": "Platform Fees",
    "hi": "प्लेटफॉर्म शुल्क",
    "mr": "प्लॅटफॉर्म फी"
  },
  fixnearCommission: {
    "en": "FixNear commission & fee",
    "hi": "फिक्सनियर कमीशन व शुल्क",
    "mr": "फिक्सनियर कमिशन व फी"
  },
  averageRating: {
    "en": "Average Rating",
    "hi": "औसत रेटिंग",
    "mr": "सरासरी रेटिंग"
  },
  acrossApprovedPros: {
    "en": "Across approved specialists",
    "hi": "स्वीकृत विशेषज्ञों में",
    "mr": "मान्य तज्ज्ञांमधून"
  },
  needsActionDesk: {
    "en": "Needs Your Action Desk",
    "hi": "कार्यवाही आवश्यक डेस्क",
    "mr": "तातडीच्या कृतींचा कक्ष"
  },
  operationalItemsNotice: {
    "en": "Operational items requiring administrator review or intervention",
    "hi": "प्रशासक समीक्षा या हस्तक्षेप की आवश्यकता वाले मामले",
    "mr": "प्रशासकीय पुनरावलोकन आवश्यक असलेल्या बाबी"
  },
  providerApprovalsAction: {
    "en": "Provider Approvals",
    "hi": "तकनीशियन स्वीकृति",
    "mr": "तंत्रज्ञ मंजुरी"
  },
  waitingSuffix: {
    "en": "Waiting",
    "hi": "प्रतीक्षारत",
    "mr": "प्रलंबित"
  },
  kycReadyReview: {
    "en": "KYC and skill test ready for review",
    "hi": "केवाईसी और परीक्षा समीक्षा हेतु तैयार",
    "mr": "केवायसी आणि चाचणी पुनरावलोकनासाठी तयार"
  },
  complaintsDisputesAction: {
    "en": "Complaints & Disputes",
    "hi": "शिकायतें और विवाद",
    "mr": "तक्रारी आणि वाद"
  },
  disputesActionDesc: {
    "en": "Customer / Provider escrow arbitration",
    "hi": "ग्राहक / तकनीशियन विवाद समाधान",
    "mr": "ग्राहक / तंत्रज्ञ वाद निवारण"
  },
  qualityWatchdogAction: {
    "en": "Quality Watchdog",
    "hi": "गुणवत्ता निगरानी",
    "mr": "दर्जा नियंत्रण"
  },
  needsAttentionSuffix: {
    "en": "Needs Attention",
    "hi": "ध्यान देने योग्य",
    "mr": "लक्ष देणे आवश्यक"
  },
  flaggedDesc: {
    "en": "Rating < 3.5 with ≥ 5 completed jobs",
    "hi": "कम से कम 5 कार्यों के साथ 3.5 से कम रेटिंग",
    "mr": "किमान ५ कामांसह ३.५ पेक्षा कमी रेटिंग"
  },
  dispatchFallbacks: {
    "en": "Dispatch Fallbacks",
    "hi": "अनिर्दिष्ट कार्य",
    "mr": "असाइन न झालेली कामे"
  },
  unassignedSuffix: {
    "en": "Unassigned",
    "hi": "अनिर्दिष्ट",
    "mr": "असाइन नाही"
  },
  noTechFoundDesc: {
    "en": "No technician found in time window",
    "hi": "निर्धारित समय में कोई तकनीशियन नहीं मिला",
    "mr": "वेळेत तंत्रज्ञ सापडला नाही"
  },
  sevenDayVolume: {
    "en": "7-Day Booking Volume",
    "hi": "7-दिवसीय बुकिंग मात्रा",
    "mr": "७ दिवसांचे बुकिंग प्रमाण"
  },
  customerDemandTrend: {
    "en": "Customer demand trend over the last 7 calendar days",
    "hi": "पिछले 7 दिनों में ग्राहक मांग की प्रवृत्ति",
    "mr": "गेल्या ७ दिवसांतील मागणीचा कल"
  },
  liveAggregate: {
    "en": "Live Aggregate",
    "hi": "लाइव आंकड़े",
    "mr": "थेट आकडेवारी"
  },
  weeklyTotal: {
    "en": "Weekly Total:",
    "hi": "साप्ताहिक कुल:",
    "mr": "साप्ताहिक एकूण:"
  },
  servicesCount: {
    "en": "services",
    "hi": "सेवाएं",
    "mr": "सेवा"
  },
  customersRegistered: {
    "en": "Customers Registered:",
    "hi": "पंजीकृत ग्राहक:",
    "mr": "नोंदणीकृत ग्राहक:"
  },
  topSpecialists: {
    "en": "Top 5 Certified Specialists",
    "hi": "शीर्ष 5 प्रमाणित तकनीशियन",
    "mr": "अव्वल ५ प्रमाणित तंत्रज्ञ"
  },
  rankedByRating: {
    "en": "Ranked by rating average & completed jobs",
    "hi": "रेटिंग और पूर्ण कार्यों के अनुसार रैंक",
    "mr": "रेटिंग आणि पूर्ण केलेल्या कामांनुसार क्रमवारी"
  },
  directoryLink: {
    "en": "Directory →",
    "hi": "निर्देशिका →",
    "mr": "निर्देशिका →"
  },
  noRatedSpecialists: {
    "en": "No rated specialists yet.",
    "hi": "अभी तक कोई मूल्यांकित तकनीशियन नहीं है।",
    "mr": "अद्याप कोणतेही मानांकित तंत्रज्ञ नाहीत."
  },
  jobsDoneSuffix: {
    "en": "jobs done",
    "hi": "कार्य पूर्ण",
    "mr": "कामे पूर्ण"
  },
  loadingApprovals: {
    "en": "Loading Approvals Queue...",
    "hi": "स्वीकृति कतार लोड हो रही है...",
    "mr": "मंजुरी रांग लोड होत आहे..."
  },
  retrievingApplications: {
    "en": "Retrieving submitted partner applications awaiting verification.",
    "hi": "सत्यापन हेतु जमा किए गए आवेदन प्राप्त हो रहे हैं।",
    "mr": "पडताळणीसाठी सादर केलेले अर्ज आणत आहे."
  },
  candidate: {
    "en": "Candidate",
    "hi": "उम्मीदवार",
    "mr": "उमेदवार"
  },
  awaitingReview: {
    "en": "Awaiting Review",
    "hi": "समीक्षा हेतु प्रतीक्षारत",
    "mr": "पुनरावलोकनाची वाट पाहत आहे"
  },
  allSubmissionsProcessed: {
    "en": "All Verification Submissions Processed",
    "hi": "सभी आवेदनों पर कार्रवाई हो चुकी है",
    "mr": "सर्व अर्ज तपासले गेले आहेत"
  },
  noTechsWaiting: {
    "en": "No technicians waiting for approval. As soon as a provider completes registration and skill testing, their dossier will appear here for review.",
    "hi": "अनुमोदन हेतु कोई तकनीशियन प्रतीक्षारत नहीं है। जैसे ही कोई पार्टनर पंजीकरण और परीक्षा पूरी करेगा, उसका विवरण यहां दिखाई देगा।",
    "mr": "मंजुरीसाठी कोणताही तंत्रज्ञ प्रलंबित नाही. तंत्रज्ञाने नोंदणी व चाचणी पूर्ण केल्यावर त्यांचे अर्ज येथे पुनरावलोकनासाठी दिसतील."
  },
  pendingCandidates: {
    "en": "Pending Candidates",
    "hi": "प्रतीक्षारत उम्मीदवार",
    "mr": "प्रलंबित अर्जदार"
  },
  govtIdProof: {
    "en": "Govt ID Proof",
    "hi": "पहचान पत्र",
    "mr": "सरकारी ओळखपत्र"
  },
  tradeCertificate: {
    "en": "Trade Certificate",
    "hi": "व्यापार प्रमाण पत्र",
    "mr": "व्यावसायिक प्रमाणपत्र"
  },
  skillExamScore: {
    "en": "Skill Exam Score",
    "hi": "कौशल परीक्षा अंक",
    "mr": "कौशल्य चाचणी गुण"
  },
  testAttempts: {
    "en": "Test Attempts",
    "hi": "परीक्षा प्रयास",
    "mr": "चाचणी प्रयत्न"
  },
  warningCount: {
    "en": "Warning Count",
    "hi": "चेतावनी संख्या",
    "mr": "इशारे संख्या"
  },
  requestMoreInfo: {
    "en": "Request More Info",
    "hi": "अतिरिक्त जानकारी मांगें",
    "mr": "अधिक माहिती मागा"
  },
  totalAuditRecords: {
    "en": "Total Audit Records",
    "hi": "कुल ऑडिट रिकॉर्ड",
    "mr": "एकूण ऑडिट नोंदी"
  },
  allActions: {
    "en": "All Actions",
    "hi": "सभी कार्रवाइयां",
    "mr": "सर्व कृती"
  },
  noAuditLogs: {
    "en": "No Audit Logs Found",
    "hi": "कोई ऑडिट रिकॉर्ड नहीं मिला",
    "mr": "कोणतीही ऑडिट नोंद सापडली नाही"
  },
  operator: {
    "en": "Operator",
    "hi": "ऑपरेटर",
    "mr": "ऑपरेटर"
  },
  action: {
    "en": "Action",
    "hi": "कार्रवाई",
    "mr": "कृती"
  },
  target: {
    "en": "Target",
    "hi": "लक्ष्य",
    "mr": "लक्ष्य"
  },
  details: {
    "en": "Details",
    "hi": "विवरण",
    "mr": "तपशील"
  },
  timestamp: {
    "en": "Timestamp",
    "hi": "समय",
    "mr": "वेळ"
  },
  reassign: {
    "en": "Reassign",
    "hi": "पुनः असाइन करें",
    "mr": "पुन्हा नियुक्त करा"
  },
  noBookingsFound: {
    "en": "No Bookings Found",
    "hi": "कोई बुकिंग नहीं मिली",
    "mr": "कोणतेही बुकिंग सापडले नाही"
  },
  customerDetails: {
    "en": "Customer Details",
    "hi": "ग्राहक विवरण",
    "mr": "ग्राहक तपशील"
  },
  assignedProvider: {
    "en": "Assigned Technician",
    "hi": "आवंटित तकनीशियन",
    "mr": "नियुक्त तंत्रज्ञ"
  },
  pricingBreakdown: {
    "en": "Pricing Breakdown",
    "hi": "मूल्य विवरण",
    "mr": "दर तपशील"
  },
  activeAccounts: {
    "en": "Active Accounts",
    "hi": "सक्रिय खाते",
    "mr": "सक्रिय खाती"
  },
  suspendedAccounts: {
    "en": "Suspended / Blocked",
    "hi": "निलंबित / अवरुद्ध खाते",
    "mr": "निलंबित / ब्लॉक खाती"
  },
  noCustomersFound: {
    "en": "No Customers Found",
    "hi": "कोई ग्राहक नहीं मिला",
    "mr": "कोणताही ग्राहक सापडला नाही"
  },
  totalSpent: {
    "en": "Total Spent",
    "hi": "कुल खर्च",
    "mr": "एकूण खर्च"
  },
  joinDate: {
    "en": "Join Date",
    "hi": "शामिल होने की तिथि",
    "mr": "नोंदणी तारीख"
  },
  openRequiresAction: {
    "en": "Open (Requires Action)",
    "hi": "सक्रिय (कार्रवाई आवश्यक)",
    "mr": "सक्रिय (कार कारवाई आवश्यक)"
  },
  resolvedDisputes: {
    "en": "Resolved",
    "hi": "सुलझाए गए",
    "mr": "निवारण झालेले"
  },
  ticketBooking: {
    "en": "Ticket / Booking",
    "hi": "शिकायत / बुकिंग",
    "mr": "तक्रार / बुकिंग"
  },
  refundAmount: {
    "en": "Refund to Customer (₹)",
    "hi": "ग्राहक को धनवापसी (₹)",
    "mr": "ग्राहकाला परतावा (₹)"
  },
  providerPayout: {
    "en": "Technician Payout (₹)",
    "hi": "तकनीशियन भुगतान (₹)",
    "mr": "तंत्रज्ञाचे मानधन (₹)"
  },
  decisionReason: {
    "en": "Arbitration Ruling / Decision Notes *",
    "hi": "फैसले का कारण व विवरण *",
    "mr": "निर्णयाचे कारण व नोंदी *"
  },
  recordDecision: {
    "en": "Record Binding Decision",
    "hi": "अंतिम फैसला दर्ज करें",
    "mr": "निर्णय नोंदवा"
  },
  noDisputesFound: {
    "en": "No Disputes Found",
    "hi": "कोई विवाद नहीं मिला",
    "mr": "कोणतीही तक्रार सापडली नाही"
  },
  approvedActive: {
    "en": "Approved & Active",
    "hi": "स्वीकृत और सक्रिय",
    "mr": "मंजूर आणि सक्रिय"
  },
  waitingApproval: {
    "en": "Waiting Approval",
    "hi": "स्वीकृति प्रतीक्षारत",
    "mr": "मंजुरीची प्रतीक्षा"
  },
  suspendedStatus: {
    "en": "Suspended",
    "hi": "निलंबित",
    "mr": "निलंबित"
  },
  rejectedStatus: {
    "en": "Rejected",
    "hi": "अस्वीकृत",
    "mr": "नाकारलेले"
  },
  qualityWatchdogFilter: {
    "en": "Quality Watchdog (Rating < 3.5)",
    "hi": "गुणवत्ता निगरानी (रेटिंग < 3.5)",
    "mr": "दर्जा नियंत्रण (रेटिंग < ३.५)"
  },
  noProvidersFound: {
    "en": "No Technicians Found",
    "hi": "कोई तकनीशियन नहीं मिला",
    "mr": "कोणताही तंत्रज्ञ सापडला नाही"
  },
  addQuestion: {
    "en": "Add Question",
    "hi": "नया प्रश्न जोड़ें",
    "mr": "नवीन प्रश्न जोडा"
  },
  examBankWarning: {
    "en": "Exam Bank Warning:",
    "hi": "प्रश्न बैंक चेतावनी:",
    "mr": "प्रश्नपेढी चेतावणी:"
  },
  examBankWarningDesc: {
    "en": "The following trade categories have fewer than 12 questions:",
    "hi": "निम्नलिखित श्रेणियों में 12 से कम प्रश्न हैं:",
    "mr": "खालील श्रेणींमध्ये १२ पेक्षा कमी प्रश्न आहेत:"
  },
  noQuestionsFound: {
    "en": "No Questions Found",
    "hi": "कोई प्रश्न नहीं मिला",
    "mr": "कोणतेही प्रश्न सापडले नाहीत"
  },
  visibleReviews: {
    "en": "Visible",
    "hi": "दृश्यमान",
    "mr": "दृश्यमान"
  },
  moderatedReviews: {
    "en": "Moderated / Hidden",
    "hi": "छिपे हुए / मॉडरेट",
    "mr": "लपवलेले / नियंत्रित"
  },
  allFeedback: {
    "en": "All Feedback",
    "hi": "सभी समीक्षाएं",
    "mr": "सर्व अभिप्राय"
  },
  publicOnly: {
    "en": "Public Only",
    "hi": "केवल सार्वजनिक",
    "mr": "फक्त सार्वजनिक"
  },
  hiddenOnly: {
    "en": "Hidden / Moderated Only",
    "hi": "केवल छिपी हुई",
    "mr": "फक्त लपवलेले"
  },
  hideReview: {
    "en": "Hide Review",
    "hi": "समीक्षा छिपाएं",
    "mr": "अभिप्राय लपवा"
  },
  unhideReview: {
    "en": "Restore Review",
    "hi": "समीक्षा पुनर्स्थापित करें",
    "mr": "अभिप्राय पूर्ववत करा"
  },
  noReviewsFound: {
    "en": "No Reviews Found",
    "hi": "कोई समीक्षा नहीं मिली",
    "mr": "कोणतीही समीक्षा सापडली नाही"
  },
  addNewService: {
    "en": "Add New Service",
    "hi": "नई सेवा जोड़ें",
    "mr": "नवीन सेवा जोडा"
  },
  noServicesListed: {
    "en": "No Services Listed",
    "hi": "कोई सेवा सूचीबद्ध नहीं है",
    "mr": "कोणतीही सेवा उपलब्ध नाही"
  },
  serviceName: {
    "en": "Service Name",
    "hi": "सेवा का नाम",
    "mr": "सेवेचे नाव"
  },
  standardBasePrice: {
    "en": "Standard Base Price",
    "hi": "मानक आधार मूल्य",
    "mr": "मानक मूळ दर"
  },
  warrantyPeriod: {
    "en": "Warranty Period",
    "hi": "वारंटी अवधि",
    "mr": "वॉरंटी कालावधी"
  },
  loadingSettings: {
    "en": "Loading platform operational settings...",
    "hi": "प्लेटफॉर्म सेटिंग्स लोड हो रही हैं...",
    "mr": "प्लॅटफॉर्म सेटिंग्ज लोड होत आहेत..."
  },
  financialParameters: {
    "en": "Financial & Fee Parameters",
    "hi": "वित्तीय और शुल्क पैरामीटर",
    "mr": "आर्थिक आणि शुल्क नियम"
  },
  financialParametersDesc: {
    "en": "These values calculate booking receipts for customers and platform commissions for providers.",
    "hi": "ये दर ग्राहकों की रसीदें और तकनीशियन का कमीशन तय करते हैं।",
    "mr": "हे दर ग्राहकांची बिले आणि तंत्रज्ञांचे कमिशन मोजण्यासाठी वापरले जातात."
  },
  convenienceFeeLabel: {
    "en": "Customer Platform Convenience Fee (₹)",
    "hi": "ग्राहक सुविधा शुल्क (₹)",
    "mr": "ग्राहक प्लॅटफॉर्म सुविधा शुल्क (₹)"
  },
  commissionRateLabel: {
    "en": "Platform Commission Rate (%)",
    "hi": "प्लेटफॉर्म कमीशन दर (%)",
    "mr": "प्लॅटफॉर्म कमिशन दर (%)"
  },
  convenienceFeeRange: {
    "en": "Allowed range: ₹0 to ₹500",
    "hi": "स्वीकार्य सीमा: ₹0 से ₹500",
    "mr": "स्वीकार्य मर्यादा: ₹० ते ₹५००"
  },
  commissionRateDesc: {
    "en": "Deducted from technician payout (0% to 40%)",
    "hi": "तकनीशियन भुगतान से कटौती (0% से 40%)",
    "mr": "तंत्रज्ञांच्या मानधनातून वजा (०% ते ४०%)"
  },
  addNewAdmin: {
    "en": "Add New Admin",
    "hi": "नया एडमिन जोड़ें",
    "mr": "नवीन प्रशासक जोडा"
  },
  administrator: {
    "en": "Administrator",
    "hi": "प्रशासक",
    "mr": "प्रशासक"
  },
  emailAddress: {
    "en": "Email Address",
    "hi": "ईमेल पता",
    "mr": "ईमेल पत्ता"
  },
  roleAndStatus: {
    "en": "Role & Status",
    "hi": "भूमिका और स्थिति",
    "mr": "भूमिका आणि स्थिती"
  },
  provisionedDate: {
    "en": "Provisioned Date",
    "hi": "पंजीकरण तिथि",
    "mr": "नोंदणी दिनांक"
  },
  securityPolicy: {
    "en": "Security Policy",
    "hi": "सुरक्षा नीति",
    "mr": "सुरक्षा धोरण"
  },
  noAdminsFound: {
    "en": "No Administrators Found",
    "hi": "कोई एडमिन नहीं मिला",
    "mr": "कोणताही प्रशासक सापडला नाही"
  },
  actions: {
    "en": "Actions",
    "hi": "कार्रवाइयां",
    "mr": "कृती"
  },
  status: {
    "en": "Status",
    "hi": "स्थिति",
    "mr": "स्थिती"
  },
  rating: {
    "en": "Rating",
    "hi": "रेटिंग",
    "mr": "रेटिंग"
  },
  city: {
    "en": "City",
    "hi": "शहर",
    "mr": "शहर"
  },
  phone: {
    "en": "Phone",
    "hi": "फ़ोन",
    "mr": "फोन"
  },
  address: {
    "en": "Address",
    "hi": "पता",
    "mr": "पत्ता"
  },
  category: {
    "en": "Category",
    "hi": "श्रेणी",
    "mr": "श्रेणी"
  },
  amount: {
    "en": "Amount",
    "hi": "राशि",
    "mr": "रक्कम"
  },
  date: {
    "en": "Date",
    "hi": "दिनांक",
    "mr": "दिनांक"
  },
  view: {
    "en": "View",
    "hi": "देखें",
    "mr": "पहा"
  },
  edit: {
    "en": "Edit",
    "hi": "संपादित करें",
    "mr": "संपादित करा"
  },
  delete: {
    "en": "Delete",
    "hi": "हटाएं",
    "mr": "हटवा"
  },

  brandTitle: {
    en: "FixNear Administration",
    hi: "फिक्सनियर प्रशासन",
    mr: "फिक्सनियर प्रशासन"
  },
  staffSignIn: {
    en: "Authorized Staff Sign-In",
    hi: "अधिकृत कर्मचारी साइन-इन",
    mr: "अधिकृत कर्मचारी साइन-इन"
  },
  emailLabel: {
    en: "Administrator Email",
    hi: "प्रशासक ईमेल",
    mr: "प्रशासक ईमेल"
  },
  passwordLabel: {
    en: "Secret Password",
    hi: "गुप्त पासवर्ड",
    mr: "गुप्त पासवर्ड"
  },
  securityNotice: {
    en: "This console is strictly monitored. All access attempts are cryptographically logged.",
    hi: "यह कंसोल कड़ाई से मॉनिटर किया जाता है। सभी पहुंच प्रयासों को क्रिप्टोग्राफिक रूप से लॉग किया जाता है।",
    mr: "या कन्सोलवर कडक नजर ठेवली जाते. सर्व प्रवेश प्रयत्न क्रिप्टोग्राफिकली नोंदवले जातात."
  },
  centralOps: {
    en: "Central Ops",
    hi: "केंद्रीय संचालन",
    mr: "मध्यवर्ती संचालन"
  },
  governanceTitle: {
    en: "Central Operations & Trust Mediation Desk • FixNear Trust Platform Governance",
    hi: "केंद्रीय संचालन और ट्रस्ट मध्यस्थता डेस्क • फिक्सनियर ट्रस्ट प्लेटफ़ॉर्म गवर्नेंस",
    mr: "मध्यवर्ती संचालन आणि ट्रस्ट निवारण कक्ष • फिक्सनियर ट्रस्ट प्लॅटफॉर्म प्रशासन"
  },
  changePassword: {
    en: "Change Password",
    hi: "पासवर्ड बदलें",
    mr: "पासवर्ड बदला"
  },
  signOut: {
    en: "Sign Out",
    hi: "साइन आउट",
    mr: "साइन आउट"
  },
  refresh: {
    en: "Refresh",
    hi: "ताज़ा करें",
    mr: "रिफ्रेश करा"
  },
  search: {
    en: "Search",
    hi: "खोजें",
    mr: "शोधा"
  },
  allStatuses: {
    en: "All Statuses",
    hi: "सभी स्थितियां",
    mr: "सर्व स्थिती"
  },
  allCategories: {
    en: "All Categories",
    hi: "सभी श्रेणियां",
    mr: "सर्व श्रेणी"
  },
  allAccounts: {
    en: "All Accounts",
    hi: "सभी खाते",
    mr: "सर्व खाती"
  },
  overview: {
    en: "Operations Overview",
    hi: "संचालन अवलोकन",
    mr: "संचालन आढावा"
  },
  approvals: {
    en: "Technician Approvals",
    hi: "तकनीशियन अनुमोदन",
    mr: "तंत्रज्ञ मंजुरी"
  },
  auditLog: {
    en: "Audit Trail",
    hi: "ऑडिट लॉग",
    mr: "ऑडिट नोंदी"
  },
  bookings: {
    en: "Dispatched Bookings",
    hi: "प्रेषित बुकिंग",
    mr: "पाठवलेली बुकिंग"
  },
  customers: {
    en: "Customer Accounts",
    hi: "ग्राहक खाते",
    mr: "ग्राहक खाती"
  },
  disputes: {
    en: "Dispute Mediation",
    hi: "विवाद मध्यस्थता",
    mr: "तक्रार निवारण"
  },
  providers: {
    en: "Specialist Partners",
    hi: "विशेषज्ञ भागीदार",
    mr: "तंत्रज्ञ भागीदार"
  },
  questions: {
    en: "Skill Question Bank",
    hi: "कौशल प्रश्न बैंक",
    mr: "कौशल्य प्रश्नपेढी"
  },
  reviews: {
    en: "Review Moderation",
    hi: "समीक्षा मॉडरेशन",
    mr: "अभिप्राय नियंत्रण"
  },
  services: {
    en: "Services & Pricing",
    hi: "सेवाएं एवं मूल्य निर्धारण",
    mr: "सेवा आणि दर"
  },
  settings: {
    en: "Platform Settings",
    hi: "प्लेटफ़ॉर्म सेटिंग्स",
    mr: "प्लॅटफॉर्म सेटिंग्ज"
  },
  users: {
    en: "Admin Access",
    hi: "प्रशासक पहुंच",
    mr: "प्रशासक प्रवेश"
  },
  // Admin Disputes Desk additions
  claimReason: { en: "Claim Reason", hi: "दावे का कारण", mr: "दाव्याचे कारण" },
  disputedAmt: { en: "Disputed Amt", hi: "विवादित राशि", mr: "वादग्रस्त रक्कम" },
  inspectAndRule: { en: "Inspect & Rule", hi: "जांचें व निर्णय लें", mr: "तपासा आणि निर्णय घ्या" },
  dossierLoading: { en: "Loading dispute dossier and booking timeline...", hi: "विवाद विवरण लोड हो रहा है...", mr: "तक्रार तपशील लोड होत आहे..." },
  customerGrievance: { en: "Customer Grievance Statement", hi: "ग्राहक शिकायत विवरण", mr: "ग्राहक तक्रार विधान" },
  claimAmountLabel: { en: "Claim Amount", hi: "दावा राशि", mr: "दावा रक्कम" },
  complainantCustomer: { en: "Complainant (Customer)", hi: "शिकायतकर्ता (ग्राहक)", mr: "तक्रारदार (ग्राहक)" },
  assignedTechnician: { en: "Assigned Technician", hi: "नियुक्त तकनीशियन", mr: "नियुक्त तंत्रज्ञ" },
  associatedBooking: { en: "Associated Booking", hi: "संबंधित बुकिंग", mr: "संबंधित बुकिंग" },
  adjudicationDecision: { en: "Adjudication Decision", hi: "मध्यस्थता निर्णय", mr: "मध्यस्थता निर्णय" },
  adminNoteLabel: { en: "Admin Note", hi: "व्यवस्थापक टिप्पणी", mr: "प्रशासक टीप" },
  adjudicateRuling: { en: "Adjudicate & Issue Ruling", hi: "निर्णय जारी करें", mr: "निर्णय जारी करा" },
  adminMediationRuling: { en: "Administrative Mediation Ruling", hi: "प्रशासनिक मध्यस्थता निर्णय", mr: "प्रशासकीय मध्यस्थता निर्णय" },
  decideDisbursement: { en: "Decide on fund disbursement between customer and technician.", hi: "राशि वितरण का निर्णय लें।", mr: "निधी वितरणाचा निर्णय घ्या." },
  rulingDecision: { en: "Ruling Decision", hi: "मध्यस्थता निर्णय", mr: "मध्यस्थता निर्णय" },
  rulingRefundCustomer: { en: "100% Refund Customer", hi: "१००% ग्राहक को धनवापसी", mr: "१००% ग्राहकाला परतावा" },
  rulingFaultTechnician: { en: "Fault lies with technician", hi: "तकनीशियन की गलती", mr: "तंत्रज्ञाची चूक" },
  rulingPayTechnician: { en: "100% Pay Technician", hi: "१००% तकनीशियन को भुगतान", mr: "१००% तंत्रज्ञाला देयक" },
  rulingServiceCompleted: { en: "Service completed properly", hi: "कार्य ठीक से पूरा हुआ", mr: "काम योग्यरित्या पूर्ण झाले" },
  rulingSplitDisputed: { en: "Split Disputed Amount", hi: "विवादित राशि का बंटवारा", mr: "वादग्रस्त रक्कमेची विभागणी" },
  rulingCompromise: { en: "Compromise settlement", hi: "आपसी समझौता", mr: "परस्पर समझोता" },
  rulingRejectGrievance: { en: "Reject Grievance", hi: "शिकायत खारिज करें", mr: "तक्रार नाकारा" },
  rulingInvalidClaim: { en: "Invalid or frivolous claim", hi: "अमान्य दावा", mr: "अवैध दावा" },
  rulingJustification: { en: "Ruling Justification Note (Sent to both parties)", hi: "निर्णय का कारण (दोनों पक्षों को भेजा जाएगा)", mr: "निर्णयाचे कारण (दोन्ही पक्षांना पाठवले जाईल)" },
  recordingRuling: { en: "Recording Ruling...", hi: "निर्णय दर्ज हो रहा है...", mr: "निर्णय नोंदवत आहे..." },

  // Admin Providers Desk additions
  specialistDirectory: { en: "Querying specialist directory...", hi: "तकनीशियन निर्देशिका खोजी जा रही है...", mr: "तंत्रज्ञ निर्देशिका शोधत आहे..." },
  allCities: { en: "All Cities", hi: "सभी शहर", mr: "सर्व शहरे" },
  cityAndArea: { en: "City & Area", hi: "शहर व क्षेत्र", mr: "शहर आणि क्षेत्र" },
  specialty: { en: "Specialty", hi: "विशेषज्ञता", mr: "विशेषज्ञता" },
  ratingAndJobs: { en: "Rating & Jobs", hi: "रेटिंग व कार्य", mr: "रेटिंग आणि कामे" },
  jobsCompleted: { en: "jobs completed", hi: "कार्य पूर्ण", mr: "कामे पूर्ण" },
  reinstateSpecialist: { en: "Reinstate Specialist", hi: "तकनीशियन पुनर्बहाल करें", mr: "तंत्रज्ञ पुन्हा सक्रिय करा" },
  reinstateNotice: { en: "Restore this partner to approved status so they can toggle online and receive customer job dispatches again.", hi: "इस साथी को स्वीकृत स्थिति में पुनर्बहाल करें ताकि वे ऑनलाइन आ सकें।", mr: "या जोडीदाराला पुन्हा स्वीकृत स्थितीत आणा जेणेकरून ते ऑनलाइन येऊ शकतील." },
  suspendSpecialist: { en: "Suspend Specialist", hi: "तकनीशियन निलंबित करें", mr: "तंत्रज्ञ निलंबित करा" },
  suspendNotice: { en: "Suspending this specialist immediately forces them offline and cancels any open job offers so they are immediately re-dispatched to the next eligible partner.", hi: "निलंबन करने पर तुरंत ऑफलाइन किया जाता है और नए साथी को कार्य दिया जाता है।", mr: "निलंबित केल्यावर त्वरित ऑफलाइन केले जाईल आणि इतर तंत्रज्ञाला काम दिले जाईल." },

  // Admin Questions Desk additions
  topic: { en: "Topic", hi: "विषय", mr: "विषय" },
  questionText: { en: "Question Text", hi: "प्रश्न विवरण", mr: "प्रश्न मजकूर" },
  optionsPrompt: { en: "Options (Mark the single correct option)", hi: "विकल्प (एक सही विकल्प चुनें)", mr: "पर्याय (एक योग्य पर्याय निवडा)" },
  explanationPrompt: { en: "Explanation & Reference Rationale (Admin internal)", hi: "स्पष्टीकरण व संदर्भ (व्यवस्थापक आंतरिक)", mr: "स्पष्टीकरण आणि संदर्भ (प्रशासकीय अंतर्गत)" },
  keyRationale: { en: "Key Rationale:", hi: "मुख्य औचित्य:", mr: "मुख्य कारण:" },

  // Admin Reviews Desk additions
  customerReviewsDesk: { en: "Customer Reviews & Ratings Moderation Desk", hi: "ग्राहक समीक्षा व रेटिंग नियंत्रण डेस्क", mr: "ग्राहक पुनरावलोकन आणि रेटिंग नियंत्रण डेस्क" },
  customerReviewsDesc: { en: "Audit public feedback. Moderating or hiding offensive reviews instantly recalculates the technician's rating score.", hi: "समीक्षाओं का ऑडिट करें। अनुचित समीक्षाएं छिपाने पर रेटिंग स्वतः पुनर्गणना होगी।", mr: "अभिप्राय तपासा. आक्षेपार्ह पुनरावलोकने लपविल्यावर रेटिंगची पुन्हा गणना केली जाईल." },
  visible: { en: "Visible", hi: "दृश्यमान", mr: "दृश्यमान" },
  moderated: { en: "Moderated", hi: "नियंत्रित", mr: "नियंत्रित" },
  customerAndService: { en: "Customer & Service", hi: "ग्राहक व सेवा", mr: "ग्राहक आणि सेवा" },
  reviewContent: { en: "Review Content", hi: "समीक्षा सामग्री", mr: "अभिप्राय मजकूर" },
  moderation: { en: "Moderation", hi: "नियंत्रण", mr: "नियंत्रण" },
  loadingReviews: { en: "Loading verified reviews...", hi: "सत्यापित समीक्षाएं लोड हो रही हैं...", mr: "सत्यापित पुनरावलोकने लोड होत आहेत..." },
  noReviewsCriteria: { en: "No reviews matching the criteria.", hi: "शर्तों के अनुसार कोई समीक्षा नहीं मिली।", mr: "निकषांनुसार पुनरावलोकने आढळली नाहीत." },
  moderationNote: { en: "Moderation note:", hi: "नियंत्रण टिप्पणी:", mr: "नियंत्रण टीप:" },
  hidden: { en: "Hidden", hi: "छिपा हुआ", mr: "लपवलेले" },
  public: { en: "Public", hi: "सार्वजनिक", mr: "सार्वजनिक" },
  hideReviewTitle: { en: "Hide Review from Public View", hi: "समीक्षा सार्वजनिक दृष्टि से छिपाएं", mr: "पुनरावलोकन सार्वजनिक दृश्यातून लपवा" },
  hideReviewNotice: { en: "This review will be immediately hidden from customer apps and excluded from the technician's average rating calculation.", hi: "यह समीक्षा ग्राहक ऐप से छिपा दी जाएगी और औसत रेटिंग से हटा दी जाएगी।", mr: "हे पुनरावलोकन ग्राहकांच्या ॲपवरून लपवले जाईल आणि सरासरी रेटिंगमधून वगळले जाईल." },
  reviewBy: { en: "Review by", hi: "द्वारा समीक्षा", mr: "यांचे पुनरावलोकन" },
  reasonModeration: { en: "Reason for Moderation (Audit Logged)", hi: "नियंत्रण का कारण (ऑडिट लॉग होगा)", mr: "नियंत्रणाचे कारण (ऑडिट नोंद होईल)" },
  hiding: { en: "Hiding...", hi: "छिपाया जा रहा है...", mr: "लपवत आहे..." },
  confirmHide: { en: "Confirm Hide", hi: "छिपाना सुनिश्चित करें", mr: "लपवण्याची खात्री करा" },

  // Admin Services Desk additions
  serviceCatalogTitle: { en: "Service Catalog & Transparent Price Schedule", hi: "सेवा सूची व पारदर्शी दर अनुसूची", mr: "सेवा कॅटलॉग आणि पारदर्शक दर पत्रक" },
  serviceCatalogDesc: { en: "Standardize diagnostic pricing, warranty commitments, and toggle service availability across customer apps.", hi: "मूल्य निर्धारण, वारंटी और सेवा उपलब्धता को मानकीकृत करें।", mr: "किंमत, हमी आणि सेवा उपलब्धता प्रमाणित करा." },
  duration: { en: "Duration", hi: "अवधि", mr: "कालावधी" },
  serviceTitle: { en: "Service Title", hi: "सेवा का नाम", mr: "सेवेचे नाव" },
  startingPrice: { en: "Starting Price", hi: "प्रारंभिक मूल्य", mr: "प्रारंभिक किंमत" },
  originalPrice: { en: "Original Price", hi: "मूल मूल्य", mr: "मूळ किंमत" },
  featuresList: { en: "Features (One per line)", hi: "विशेषताएं (प्रति पंक्ति एक)", mr: "वैशिष्ट्ये (प्रति ओळ एक)" },

  // Admin Settings Desk additions
  globalPlatformSettings: { en: "Global Platform Settings", hi: "वैश्विक प्लेटफॉर्म सेटिंग्स", mr: "ग्लोबल प्लॅटफॉर्म सेटिंग्ज" },
  globalPlatformDesc: { en: "Configure financial parameters, technician qualification thresholds, and operational rules.", hi: "वित्तीय मानक, योग्यता सीमा और संचालन नियमों को कॉन्फ़िगर करें।", mr: "आर्थिक मापदंड, पात्रता मर्यादा आणि कार्य नियमावली कॉन्फिगर करा." },
  financialFeeParameters: { en: "Financial & Fee Parameters", hi: "वित्तीय व शुल्क पैरामीटर", mr: "आर्थिक आणि शुल्क मापदंड" },
  financialFeeDesc: { en: "These values calculate booking receipts for customers and platform commissions for providers.", hi: "यह मूल्य रसीदों और कमीशन की गणना करते हैं।", mr: "हे मूल्य पावत्या आणि कमिशन मोजतात." },
  allowedRange: { en: "Allowed range:", hi: "अनुमत सीमा:", mr: "अनुमत मर्यादा:" },
  deductedFromPayout: { en: "Deducted from technician payout (0% to 40%)", hi: "तकनीशियन भुगतान से काटा गया (०% से ४०%)", mr: "तंत्रज्ञाच्या देयकातून वजा केले (०% ते ४०%)" },
  techAssessmentVerification: { en: "Technician Skill Assessment & Verification", hi: "तकनीशियन कौशल मूल्यांकन व सत्यापन", mr: "तंत्रज्ञ कौशल्य मूल्यमापन आणि पडताळणी" },
  governsDifficulty: { en: "Governs qualification difficulty, timing constraints, and retake frequency.", hi: "कठिनाई, समय सीमा और पुनः प्रयास को नियंत्रित करता है।", mr: "काठिन्य, वेळ मर्यादा आणि पुनर्प्रयत्न नियंत्रित करतो." },
  passMarkThreshold: { en: "Pass Mark Threshold (%)", hi: "उत्तीर्ण अंक सीमा (%)", mr: "उत्तीर्ण गुण मर्यादा (%)" },
  minScoreToQualify: { en: "Minimum score to qualify (50% - 100%)", hi: "पात्रता हेतु न्यूनतम अंक (५०% - १००%)", mr: "पात्रतेसाठी किमान गुण (५०% - १००%)" },
  examTimeLimit: { en: "Exam Time Limit (Minutes)", hi: "परीक्षा समय सीमा (मिनट)", mr: "परीक्षा वेळ मर्यादा (मिनिटे)" },
  allowedDuration: { en: "Allowed duration (5 - 60 minutes)", hi: "अनुमत अवधि (५ - ६० मिनट)", mr: "अनुमत कालावधी (५ - ६० मिनिटे)" },
  retakeCooldown: { en: "Retake Cooldown (Hours)", hi: "पुनः प्रयास कूलडाउन (घंटे)", mr: "पुनर्प्रयत्न प्रतीक्षा वेळ (तास)" },
  waitTimeFailing: { en: "Wait time after failing (1 - 168 hours)", hi: "अनुत्तीर्ण होने के बाद प्रतीक्षा समय (१ - १६८ घंटे)", mr: "अयशस्वी झाल्यानंतर प्रतीक्षा वेळ (१ - १६८ तास)" },
  auditLoggingNotice: { en: "Audit Logging Notice:", hi: "ऑडिट लॉगिंग सूचना:", mr: "ऑडिट नोंद सूचना:" },
  auditNoticeDesc: { en: "Any adjustment to global parameters will be recorded in the system audit log with your administrative user credentials, timestamp, and IP address for compliance and governance tracking.", hi: "कोई भी बदलाव व्यवस्थापक विवरण, समय और आईपी के साथ ऑडिट लॉग में दर्ज किया जाएगा।", mr: "कोणताही बदल प्रशासक तपशील, वेळ आणि आयपीसह ऑडिट लॉगमध्ये नोंदवला जाईल." },
  saveApplySettings: { en: "Save & Apply Settings", hi: "सेटिंग्स सहेजें व लागू करें", mr: "सेटिंग्ज जतन करा आणि लागू करा" },

  // Admin Users Desk additions
  adminAccessGovernance: { en: "Administrator Access & Governance", hi: "व्यवस्थापक पहुंच व शासन", mr: "प्रशासक प्रवेश आणि प्रशासन" },
  adminAccessDesc: { en: "Manage administrative privilege holders, audit credentials, and provision verified administrative personnel.", hi: "व्यवस्थापकीय पहुंच, क्रेडेंशियल्स और कर्मियों का प्रबंधन करें।", mr: "प्रशासकीय अधिकार, ओळखपत्रे आणि कर्मचाऱ्यांचे व्यवस्थापन करा." },
  youLabel: { en: "You", hi: "आप", mr: "तुम्ही" },
  activeAdmin: { en: "Active Admin", hi: "सक्रिय व्यवस्थापक", mr: "सक्रिय प्रशासक" },
  deactivated: { en: "Deactivated", hi: "निष्क्रिय", mr: "निष्क्रिय" },
  changeRequired: { en: "Change Required", hi: "पासवर्ड बदलना अनिवार्य", mr: "पासवर्ड बदलणे आवश्यक" },
  standardPolicy: { en: "Standard", hi: "मानक", mr: "मानक" },
  selfAccount: { en: "Self Account", hi: "स्वयं खाता", mr: "स्वतःचे खाते" },
  revoked: { en: "Revoked", hi: "रद्द", mr: "रद्द" },
  provisionNewAdmin: { en: "Provision New Administrator", hi: "नया व्यवस्थापक जोड़ें", mr: "नवीन प्रशासक जोडा" },
  provisionAdminDesc: { en: "Create an administrative user with full governance access. The new user will be prompted to choose a new password upon first login.", hi: "पूर्ण पहुंच के साथ एक व्यवस्थापक बनाएं। पहली बार लॉगिन पर नया पासवर्ड चुनना होगा।", mr: "पूर्ण प्रवेशासह प्रशासक तयार करा. पहिल्या लॉगिनवर नवीन पासवर्ड निवडावा लागेल." },
  corporateEmail: { en: "Corporate Email", hi: "कॉर्पोरेट ईमेल", mr: "कॉर्पोरेट ईमेल" },
  temporaryPassword: { en: "Temporary Password", hi: "अस्थायी पासवर्ड", mr: "तात्पुरता पासवर्ड" },
  tempPasswordHint: { en: "Must contain at least 8 characters with at least one letter and one number.", hi: "कम से कम ८ अक्षर, जिसमें कम से कम एक अक्षर और एक संख्या हो।", mr: "किमान ८ अक्षरे, ज्यामध्ये किमान एक अक्षर आणि एक संख्या असावी." },
  creating: { en: "Creating...", hi: "बनाया जा रहा है...", mr: "तयार करत आहे..." },
  createAdminAccount: { en: "Create Admin Account", hi: "व्यवस्थापक खाता बनाएं", mr: "प्रशासक खाते तयार करा" }
};

// Compile into translations
const translationsPath = path.resolve('src/i18n/translations.js');
let src = fs.readFileSync(translationsPath, 'utf-8');

// Parse out i18n
const jsonStart = src.indexOf('export const i18n = ') + 'export const i18n = '.length;
const marker = src.indexOf('export const translations = i18n;') !== -1 
  ? src.indexOf('export const translations = i18n;') 
  : src.indexOf('// Locale mapping');
const jsonStr = src.slice(jsonStart, marker).trim().replace(/;$/, '');

let i18n;
try {
  i18n = JSON.parse(jsonStr);
} catch (e) {
  console.error('Failed to parse i18n JSON:', e.message);
  process.exit(1);
}

// Add provider keys
for (const [key, tr] of Object.entries(providerAdditions)) {
  for (const lang of ['en', 'hi', 'mr']) {
    if (!i18n[lang].provider) i18n[lang].provider = {};
    i18n[lang].provider[key] = tr[lang];
  }
}

// Add providerTest keys
for (const [key, tr] of Object.entries(providerTestAdditions)) {
  for (const lang of ['en', 'hi', 'mr']) {
    if (!i18n[lang].providerTest) i18n[lang].providerTest = {};
    i18n[lang].providerTest[key] = tr[lang];
  }
}

// Add providerDashboard keys
for (const [key, tr] of Object.entries(providerDashboardAdditions)) {
  for (const lang of ['en', 'hi', 'mr']) {
    if (!i18n[lang].providerDashboard) i18n[lang].providerDashboard = {};
    i18n[lang].providerDashboard[key] = tr[lang];
  }
}

// Add admin keys
for (const [key, tr] of Object.entries(adminAdditions)) {
  for (const lang of ['en', 'hi', 'mr']) {
    if (!i18n[lang].admin) i18n[lang].admin = {};
    i18n[lang].admin[key] = tr[lang];
  }
}

// Add error keys
const errorAdditions = {
  NO_ACTIVE_OFFER: {
    en: "No active dispatch offer found for this job.",
    hi: "इस कार्य के लिए कोई सक्रिय प्रेषण प्रस्ताव नहीं मिला।",
    mr: "या कामासाठी कोणतीही सक्रिय पाठवणी ऑफर आढळली नाही."
  }
};
for (const [key, tr] of Object.entries(errorAdditions)) {
  for (const lang of ['en', 'hi', 'mr']) {
    if (!i18n[lang].errors) i18n[lang].errors = {};
    i18n[lang].errors[key] = tr[lang];
  }
}

// Verify 100% key and content parity across en, hi, mr
let missingCount = 0;
for (const section of Object.keys(i18n.en)) {
  for (const k of Object.keys(i18n.en[section])) {
    for (const lang of ['hi', 'mr']) {
      if (!i18n[lang][section] || i18n[lang][section][k] === undefined) {
        console.error(`Missing ${lang}.${section}.${k}`);
        missingCount++;
      } else if (typeof i18n[lang][section][k] === 'string' && i18n[lang][section][k].trim() === '') {
        console.error(`Empty string at ${lang}.${section}.${k}`);
        missingCount++;
      }
    }
  }
}

if (missingCount > 0) {
  console.error(`Found ${missingCount} translation discrepancies!`);
  process.exit(1);
}

// Re-write file cleanly
const newSrc = `// ===================================================================
// FixNear Trust - Structured UI Text & Internationalization (i18n)
// Complete English (en), Hindi (hi), and Marathi (mr) translation matrix
// Generated with 100% key parity and complete non-empty translations
// ===================================================================

let activeLanguage = typeof window !== 'undefined' ? (localStorage.getItem('fixnear_lang') || 'en') : 'en';
const listeners = new Set();

// Synchronize html lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = activeLanguage;
}

export const setLanguage = (lang) => {
  if (i18n[lang]) {
    activeLanguage = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fixnear_lang', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    listeners.forEach((fn) => fn(lang));
  }
};

export const getLanguage = () => activeLanguage;

export const subscribeLanguageChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const i18n = ${JSON.stringify(i18n, null, 2)};

export const translations = i18n;

export const t = (pathStr, fallback = '') => {
  if (!pathStr) return fallback;
  const parts = pathStr.split('.');
  let val = i18n[activeLanguage];
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      val = undefined;
      break;
    }
  }
  if (val !== undefined && val !== null && val !== '') {
    return val;
  }
  // Fallback to English
  let enVal = i18n.en;
  for (const part of parts) {
    if (enVal && typeof enVal === 'object' && part in enVal) {
      enVal = enVal[part];
    } else {
      enVal = undefined;
      break;
    }
  }
  if (enVal !== undefined && enVal !== null && enVal !== '') {
    return enVal;
  }
  return fallback || pathStr;
};

export const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const locale = activeLanguage === 'hi' ? 'hi-IN' : activeLanguage === 'mr' ? 'mr-IN' : 'en-IN';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (timeVal) => {
  if (!timeVal) return '';
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return String(timeVal);
  const locale = activeLanguage === 'hi' ? 'hi-IN' : activeLanguage === 'mr' ? 'mr-IN' : 'en-IN';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const locale = activeLanguage === 'hi' ? 'hi-IN' : activeLanguage === 'mr' ? 'mr-IN' : 'en-IN';
  return d.toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  const locale = activeLanguage === 'hi' ? 'hi-IN' : activeLanguage === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export const formatNumber = (num) => {
  const n = Number(num) || 0;
  const locale = activeLanguage === 'hi' ? 'hi-IN' : activeLanguage === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.NumberFormat(locale).format(n);
};

export const getStatusLabel = (status) => {
  if (!status) return '';
  const statusKey = String(status).toUpperCase();
  const found = i18n[activeLanguage]?.status?.[statusKey] || i18n.en?.status?.[statusKey];
  return found || status;
};

export const getErrorMessage = (codeOrErr, fallback = '') => {
  if (!codeOrErr) return fallback;
  if (typeof codeOrErr === 'object') {
    const code = codeOrErr.code || codeOrErr.response?.data?.code;
    const msg = codeOrErr.response?.data?.message || codeOrErr.message || fallback;
    if (code) {
      const found = i18n[activeLanguage]?.errors?.[code] || i18n.en?.errors?.[code];
      if (found) return found;
    }
    return msg;
  }
  const found = i18n[activeLanguage]?.errors?.[codeOrErr] || i18n.en?.errors?.[codeOrErr];
  return found || fallback || codeOrErr;
};

export default {
  i18n,
  setLanguage,
  getLanguage,
  subscribeLanguageChange,
  t,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatNumber,
  getStatusLabel,
  getErrorMessage
};
`;

fs.writeFileSync(translationsPath, newSrc, 'utf-8');
console.log('✅ Successfully compiled and updated translations with 100% key parity across en, hi, mr!');
