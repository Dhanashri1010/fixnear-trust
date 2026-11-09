// ===================================================================
// FixNear Trust - Structured UI Text & Internationalization (i18n)
// Complete English (en), Hindi (hi), and Marathi (mr) translation matrix
// ===================================================================

let activeLanguage = localStorage.getItem('fixnear_lang') || 'en';
const listeners = new Set();

export const setLanguage = (lang) => {
  if (i18n[lang]) {
    activeLanguage = lang;
    localStorage.setItem('fixnear_lang', lang);
    listeners.forEach(fn => fn(lang));
  }
};

export const getLanguage = () => activeLanguage;

export const subscribeLanguageChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const i18n = {
  en: {
    brand: {
      name: "FixNear",
      tagline: "Trust",
      subtitle: "Verified Home Services Marketplace"
    },
    common: {
      loading: "Loading...",
      saving: "Saving...",
      back: "Back",
      next: "Next",
      cancel: "Cancel",
      confirm: "Confirm",
      close: "Close",
      submit: "Submit",
      apply: "Apply",
      clear: "Clear",
      searchPlaceholder: "Search services, repairs, technicians...",
      errorGeneral: "Something went wrong. Try again.",
      successGeneral: "Action completed successfully.",
      online: "Online",
      offline: "Offline",
      verifiedBadge: "Verified Skill",
      warrantyBadge: "30-Day FixNear Warranty",
      paymentProtection: "Payment protection",
      bookingDetails: "Booking details",
      newJobRequests: "New job requests",
      emptyStateTitle: "No records found",
      emptyStateText: "Nothing matches your criteria right now.",
      viewDetails: "View Details",
      learnMore: "Learn More",
      bookNow: "Book Now",
      status: "Status",
      actions: "Actions"
    },
    roles: {
      customer: "Customer",
      provider: "Service Provider (Technician)",
      admin: "Administrator"
    },
    nav: {
      home: "Home",
      catalog: "Services",
      track: "Track Job",
      experts: "Verified Experts",
      help: "Help & Support",
      myBookings: "My Bookings",
      bookNow: "Book Service",
      login: "Log In",
      signup: "Sign Up",
      logout: "Sign Out",
      dashboard: "Dashboard",
      joinPartner: "Join as Partner"
    },
    auth: {
      loginTitle: "Log In to FixNear",
      loginSubtitle: "Access your bookings, technician dashboard, or admin desk",
      signupTitle: "Create Your Account",
      signupSubtitle: "Join thousands who trust FixNear for verified home care",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter minimum 8 characters (letters + numbers)",
      passwordReq: "Password must be at least 8 characters long and include both letters and numbers.",
      fullNameLabel: "Full Name",
      phoneLabel: "Phone Number",
      cityLabel: "City",
      roleSelectLabel: "I want to join FixNear as:",
      customerChoice: "I need home repair services (Customer)",
      providerChoice: "I am a skilled technician (Service Provider)",
      googleBtn: "Continue with Google",
      alreadyAccount: "Already have an account? Log In",
      noAccount: "Don't have an account? Sign Up"
    },
    home: {
      heroTitle: "Intelligent, Honest Home Services.",
      heroSubtitle: "Fixed Right the First Time.",
      heroDesc: "Explore transparent service rates, certified local specialists, and a 30-day workmanship guarantee. Zero hidden callout fees, zero surprise pricing.",
      searchPlaceholder: "What needs repair? (e.g. Split AC, Pipe leak, MCB tripping)",
      searchBtn: "Find Specialist",
      browseCategories: "Browse Essential Home Services",
      browseSubtitle: "Fair, transparent starting prices with verified technician background checks",
      popularServices: "Popular Services in Your Area",
      howItWorks: "How FixNear Works",
      howItWorksSub: "Simple, transparent, and protected from start to finish",
    },
    categories: {
      'ac-cooling': "Air Conditioner",
      'plumbing': "Plumbing Repairs",
      'electrical': "Electrical Safety",
      'appliances': "Home Appliances",
      'cleaning': "Home Deep Cleaning",
      'carpentry': "Carpentry & Woodwork",
    },
    bookingStatus: {
      REQUESTED: "Requested",
      ACCEPTED: "Provider Accepted",
      ON_THE_WAY: "On the Way",
      WORKING: "Working",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      DISPUTED: "Disputed"
    },
    provider: {
      regTitle: "Provider Registration",
      step1: "Personal Details",
      step2: "Skills & Experience",
      step3: "Identity Verification",
      testTitle: "Mandatory Skill Verification Test",
      testSubtitle: "Prove your hands-on practical safety knowledge to earn your Verified Skill badge",
      passMarkInfo: "Passing mark: 70%. Shuffled questions. 15 minutes limit.",
      dashboardTitle: "Technician Service Console",
      incomingRequests: "Incoming Requests",
      activeJobs: "Active Jobs",
      earningsToday: "Today's Earnings",
      jobsDone: "Jobs Completed",
      acceptJob: "Accept Job",
      declineJob: "Decline",
      onTheWayBtn: "I'm on the way",
      extraQuoteBtn: "Send extra parts quote",
      completeJobBtn: "Finish with customer code",
      statusReview: "Waiting for approval",
      newJobRequests: "new job requests",
      bookingDetails: "booking details"
    },
    admin: {
      deskTitle: "Admin Console",
      liveCounts: "Live System Numbers",
      approvalDesk: "Provider Verification Desk",
      manageProviders: "Technicians & Status",
      manageServices: "Services & Rate Cards",
      questionBank: "Skill Test Questions",
      disputes: "Complaints & Payment Holds",
      reviews: "Reviews Moderation"
    },
    payment: {
      payOnline: "Pay Online",
      payCash: "Pay in Cash",
      totalDue: "Total Due",
      invoice: "Warranty Tax Invoice",
      paid: "Paid",
      cashConfirmed: "Cash Confirmed",
      platformFee: "Platform Convenience Fee"
    },
    changePassword: {
      title: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      submitBtn: "Update Password",
      successMsg: "Password updated successfully."
    }
  },

  hi: {
    brand: {
      name: "FixNear",
      tagline: "Trust",
      subtitle: "सत्यापित होम सर्विसेज मार्केटप्लेस"
    },
    common: {
      loading: "लोड हो रहा है...",
      saving: "सहेज रहा है...",
      back: "पीछे",
      next: "आगे",
      cancel: "रद्द करें",
      confirm: "पुष्टि करें",
      close: "बंद करें",
      submit: "जमा करें",
      apply: "लागू करें",
      clear: "साफ़ करें",
      searchPlaceholder: "सेवाएं, मरम्मत, तकनीशियन खोजें...",
      errorGeneral: "कुछ गलत हो गया। पुनः प्रयास करें।",
      successGeneral: "कार्य सफलतापूर्वक पूरा हुआ।",
      online: "ऑनलाइन",
      offline: "ऑफ़लाइन",
      verifiedBadge: "सत्यापित कौशल",
      warrantyBadge: "30-दिन फिक्सनियर वारंटी",
      paymentProtection: "भुगतान सुरक्षा",
      bookingDetails: "बुकिंग विवरण",
      newJobRequests: "नए कार्य अनुरोध",
      emptyStateTitle: "कोई रिकॉर्ड नहीं मिला",
      emptyStateText: "फिलहाल कोई मिलान नहीं है।",
      viewDetails: "विवरण देखें",
      learnMore: "और जानें",
      bookNow: "अभी बुक करें",
      status: "स्थिति",
      actions: "कार्रवाई"
    },
    roles: {
      customer: "ग्राहक",
      provider: "सेवा प्रदाता (तकनीशियन)",
      admin: "प्रशासक"
    },
    nav: {
      home: "होम",
      catalog: "सेवाएं",
      track: "ट्रैक करें",
      experts: "विशेषज्ञ",
      help: "सहायता",
      myBookings: "मेरी बुकिंग्स",
      bookNow: "सेवा बुक करें",
      login: "लॉग इन",
      signup: "साइन अप",
      logout: "साइन आउट",
      dashboard: "डैशबोर्ड",
      joinPartner: "पार्टनर बनें"
    },
    auth: {
      loginTitle: "FixNear में लॉग इन करें",
      loginSubtitle: "अपनी बुकिंग्स या तकनीशियन कंसोल तक पहुंचें",
      signupTitle: "अपना खाता बनाएं",
      signupSubtitle: "सत्यापित गृह सेवा के लिए FixNear से जुड़ें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "name@example.com",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "कम से कम 8 अक्षर (अक्षर + संख्या)",
      passwordReq: "पासवर्ड कम से कम 8 अक्षर लंबा होना चाहिए और उसमें अक्षर और संख्या दोनों होने चाहिए।",
      fullNameLabel: "पूरा नाम",
      phoneLabel: "फ़ोन नंबर",
      cityLabel: "शहर",
      roleSelectLabel: "आप किस रूप में जुड़ना चाहते हैं:",
      customerChoice: "मुझे गृह मरम्मत सेवा चाहिए (ग्राहक)",
      providerChoice: "मैं एक कुशल तकनीशियन हूँ (सेवा प्रदाता)",
      googleBtn: "Google के साथ जारी रखें",
      alreadyAccount: "पहले से खाता है? लॉग इन करें",
      noAccount: "खाता नहीं है? साइन अप करें"
    },
    home: {
      heroTitle: "ईमानदार और समझदार गृह सेवाएं।",
      heroSubtitle: "पहली बार में ही सही समाधान।",
      heroDesc: "पारदर्शी सेवा दरें, प्रमाणित स्थानीय विशेषज्ञ और 30 दिनों की वारंटी। कोई छिपा हुआ शुल्क नहीं।",
      searchPlaceholder: "क्या मरम्मत करवानी है? (जैसे स्प्लिट एसी, पाइप लीक, स्विचबोर्ड)",
      searchBtn: "विशेषज्ञ खोजें",
      browseCategories: "आवश्यक गृह सेवाएं ब्राउज़ करें",
      browseSubtitle: "उचित, पारदर्शी दरें और प्रमाणित तकनीशियन",
      popularServices: "आपके क्षेत्र में लोकप्रिय सेवाएं",
      howItWorks: "FixNear कैसे काम करता है",
      howItWorksSub: "शुरू से अंत तक सरल, पारदर्शी और सुरक्षित",
    },
    categories: {
      'ac-cooling': "एयर कंडीशनर",
      'plumbing': "प्लंबिंग मरम्मत",
      'electrical': "इलेक्ट्रिकल सुरक्षा",
      'appliances': "घरेलू उपकरण",
      'cleaning': "घर की गहरी सफाई",
      'carpentry': "बढ़ईगीरी व काष्ठकार्य",
    },
    bookingStatus: {
      REQUESTED: "अनुरोधित",
      ACCEPTED: "प्रदाता स्वीकृत",
      ON_THE_WAY: "रास्ते में",
      WORKING: "कार्य प्रगति पर",
      COMPLETED: "पूर्ण",
      CANCELLED: "रद्द",
      DISPUTED: "विवादित"
    },
    provider: {
      regTitle: "प्रदाता पंजीकरण",
      step1: "व्यक्तिगत विवरण",
      step2: "कौशल एवं अनुभव",
      step3: "पहचान सत्यापन",
      testTitle: "अनिवार्य कौशल सत्यापन परीक्षा",
      testSubtitle: "सत्यापित कौशल बैज प्राप्त करने के लिए व्यावहारिक सुरक्षा ज्ञान सिद्ध करें",
      passMarkInfo: "उत्तीर्ण अंक: 70%. प्रश्न फेरबदल. 15 मिनट की सीमा.",
      dashboardTitle: "तकनीशियन सेवा कंसोल",
      incomingRequests: "आने वाले अनुरोध",
      activeJobs: "सक्रिय कार्य",
      earningsToday: "आज की कमाई",
      jobsDone: "पूर्ण कार्य",
      acceptJob: "कार्य स्वीकारें",
      declineJob: "अस्वीकार करें",
      onTheWayBtn: "मैं रास्ते में हूँ",
      extraQuoteBtn: "अतिरिक्त सामान का कोटेशन भेजें",
      completeJobBtn: "ग्राहक कोड से पूर्ण करें",
      statusReview: "स्वीकृति की प्रतीक्षा",
      newJobRequests: "नए कार्य अनुरोध",
      bookingDetails: "बुकिंग विवरण"
    },
    admin: {
      deskTitle: "प्रशासक कंसोल",
      liveCounts: "लाइव संख्याएं",
      approvalDesk: "प्रदाता सत्यापन डेस्क",
      manageProviders: "तकनीशियन प्रबंधन",
      manageServices: "सेवाएं एवं दरें",
      questionBank: "कौशल प्रश्न बैंक",
      disputes: "शिकायतें एवं भुगतान सुरक्षा",
      reviews: "समीक्षा मॉडरेशन"
    },
    payment: {
      payOnline: "ऑनलाइन भुगतान करें",
      payCash: "नकद भुगतान करें",
      totalDue: "कुल देय राशि",
      invoice: "वारंटी टैक्स चालान",
      paid: "भुगतान हुआ",
      cashConfirmed: "नकद प्राप्त हुआ",
      platformFee: "प्लेटफ़ॉर्म सुविधा शुल्क"
    },
    changePassword: {
      title: "पासवर्ड बदलें",
      currentPassword: "वर्तमान पासवर्ड",
      newPassword: "नया पासवर्ड",
      confirmPassword: "नए पासवर्ड की पुष्टि करें",
      submitBtn: "पासवर्ड अपडेट करें",
      successMsg: "पासवर्ड सफलतापूर्वक अपडेट किया गया।"
    }
  },

  mr: {
    brand: {
      name: "FixNear",
      tagline: "Trust",
      subtitle: "विश्वसनीय होम सर्व्हिसेस मार्केटप्लेस"
    },
    common: {
      loading: "लोड होत आहे...",
      saving: "जतन करत आहे...",
      back: "मागे",
      next: "पुढे",
      cancel: "रद्द करा",
      confirm: "निश्चित करा",
      close: "बंद करा",
      submit: "सादर करा",
      apply: "लागू करा",
      clear: "साफ करा",
      searchPlaceholder: "सेवा, दुरुस्ती, तंत्रज्ञ शोधा...",
      errorGeneral: "काहीतरी चूक झाली. पुन्हा प्रयत्न करा.",
      successGeneral: "कृती यशस्वीरित्या पूर्ण झाली.",
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      verifiedBadge: "प्रमाणित कौशल्य",
      warrantyBadge: "30-दिवस फिक्सनियर वॉरंटी",
      paymentProtection: "पेमेंट संरक्षण",
      bookingDetails: "बुकिंग तपशील",
      newJobRequests: "नवीन कामाच्या विनंत्या",
      emptyStateTitle: "कोणताही डेटा सापडला नाही",
      emptyStateText: "सध्या कोणतीही नोंद उपलब्ध नाही.",
      viewDetails: "तपशील पहा",
      learnMore: "अधिक जाणून घ्या",
      bookNow: "आता बुक करा",
      status: "स्थिती",
      actions: "कृती"
    },
    roles: {
      customer: "ग्राहक",
      provider: "सेवा प्रदाता (तंत्रज्ञ)",
      admin: "प्रशासक"
    },
    nav: {
      home: "मुख्यपृष्ठ",
      catalog: "सेवा",
      track: "ट्रॅक करा",
      experts: "तज्ज्ञ",
      help: "मदत",
      myBookings: "माझे बुकिंग",
      bookNow: "सेवा बुक करा",
      login: "लॉग इन",
      signup: "साइन अप",
      logout: "लॉग आउट",
      dashboard: "डॅशबोर्ड",
      joinPartner: "भागीदार व्हा"
    },
    auth: {
      loginTitle: "FixNear मध्ये लॉग इन करा",
      loginSubtitle: "आपले बुकिंग किंवा तंत्रज्ञ कन्सोल ॲक्सेस करा",
      signupTitle: "आपले खाते तयार करा",
      signupSubtitle: "विश्वसनीय गृह सेवेसाठी FixNear ला जोडा",
      emailLabel: "ईमेल पत्ता",
      emailPlaceholder: "name@example.com",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "किमान 8 अक्षरे (अक्षरे + संख्या)",
      passwordReq: "पासवर्ड किमान 8 अक्षरे लांब असावा आणि त्यात अक्षरे आणि संख्या दोन्ही असाव्यात.",
      fullNameLabel: "पूर्ण नाव",
      phoneLabel: "फोन नंबर",
      cityLabel: "शहर",
      roleSelectLabel: "आपण FixNear मध्ये कसे सामील होऊ इच्छिता:",
      customerChoice: "मला घर दुरुस्ती सेवा हवी आहे (ग्राहक)",
      providerChoice: "मी एक कुशल तंत्रज्ञ आहे (सेवा प्रदाता)",
      googleBtn: "Google सह सुरू ठेवा",
      alreadyAccount: "आधीच खाते आहे? लॉग इन करा",
      noAccount: "खाते नाही? साइन अप करा"
    },
    home: {
      heroTitle: "विश्वासार्ह आणि दर्जेदार गृह सेवा.",
      heroSubtitle: "पहिल्याच प्रयत्नात योग्य दुरुस्ती.",
      heroDesc: "पारदर्शक दर, प्रमाणित स्थानिक तंत्रज्ञ आणि 30 दिवसांची हमी. कोणतेही लपवलेले शुल्क नाही.",
      searchPlaceholder: "काय दुरुस्त करायचे आहे? (उदा. एसी, नळ गळती, स्विचबोर्ड)",
      searchBtn: "तज्ज्ञ शोधा",
      browseCategories: "आवश्यक गृह सेवा शोधा",
      browseSubtitle: "वाजवी, पारदर्शक दर आणि तपासलेले तंत्रज्ञ",
      popularServices: "तुमच्या भागातील लोकप्रिय सेवा",
      howItWorks: "FixNear कसे कार्य करते",
      howItWorksSub: "सुरुवातीपासून शेवटपर्यंत सोपे, पारदर्शक आणि सुरक्षित",
    },
    categories: {
      'ac-cooling': "एअर कंडिशनर",
      'plumbing': "प्लंबिंग दुरुस्ती",
      'electrical': "इलेक्ट्रिकल सुरक्षा",
      'appliances': "घरगुती उपकरणे",
      'cleaning': "घराची सखोल स्वच्छता",
      'carpentry': "सुतारकाम व लाकूडकाम",
    },
    bookingStatus: {
      REQUESTED: "विनंती केली",
      ACCEPTED: "प्रदाता स्वीकारले",
      ON_THE_WAY: "वाटेवर",
      WORKING: "काम सुरू",
      COMPLETED: "पूर्ण",
      CANCELLED: "रद्द",
      DISPUTED: "वादग्रस्त"
    },
    provider: {
      regTitle: "प्रदाता नोंदणी",
      step1: "वैयक्तिक तपशील",
      step2: "कौशल्ये आणि अनुभव",
      step3: "ओळख पडताळणी",
      testTitle: "अनिवार्य कौशल्य पडताळणी परीक्षा",
      testSubtitle: "प्रमाणित कौशल्य बॅज मिळवण्यासाठी प्रात्यक्षिक सुरक्षा ज्ञान सिद्ध करा",
      passMarkInfo: "उत्तीर्ण गुण: 70%. प्रश्न फेरबदल. 15 मिनिटांची मुदत.",
      dashboardTitle: "तंत्रज्ञ सेवा कन्सोल",
      incomingRequests: "येणाऱ्या विनंत्या",
      activeJobs: "सक्रिय कामे",
      earningsToday: "आजची कमाई",
      jobsDone: "पूर्ण कामे",
      acceptJob: "काम स्वीकारा",
      declineJob: "नकार द्या",
      onTheWayBtn: "मी वाटेवर आहे",
      extraQuoteBtn: "अतिरिक्त सुट्या भागांचे कोटेशन पाठवा",
      completeJobBtn: "ग्राहक कोडसह पूर्ण करा",
      statusReview: "मंजुरीची प्रतीक्षा",
      newJobRequests: "नवीन कामाच्या विनंत्या",
      bookingDetails: "बुकिंग तपशील"
    },
    admin: {
      deskTitle: "प्रशासक कन्सोल",
      liveCounts: "लाइव्ह आकडेवारी",
      approvalDesk: "प्रदाता पडताळणी डेस्क",
      manageProviders: "तंत्रज्ञ व्यवस्थापन",
      manageServices: "सेवा आणि दर",
      questionBank: "कौशल्य प्रश्न बँक",
      disputes: "तक्रारी व पेमेंट संरक्षण",
      reviews: "पुनरावलोकन नियंत्रण"
    },
    payment: {
      payOnline: "ऑनलाइन पेमेंट करा",
      payCash: "रोख पैसे द्या",
      totalDue: "एकूण देय रक्कम",
      invoice: "वॉरंटी टॅक्स चलन",
      paid: "पेमेंट झाले",
      cashConfirmed: "रोख रक्कम मिळाली",
      platformFee: "प्लॅटफॉर्म सुविधा शुल्क"
    },
    changePassword: {
      title: "पासवर्ड बदला",
      currentPassword: "सध्याचा पासवर्ड",
      newPassword: "नवीन पासवर्ड",
      confirmPassword: "नवीन पासवर्डची पुष्टी करा",
      submitBtn: "पासवर्ड अपडेट करा",
      successMsg: "पासवर्ड यशस्वीरित्या बदलला."
    }
  }
};

// Simple hook / helper for localized text retrieval
export function t(path, fallback = "") {
  const lang = activeLanguage;
  const keys = path.split('.');
  
  // Try active language first, fall back to en
  let current = i18n[lang] || i18n.en;
  for (const k of keys) {
    if (current && current[k] !== undefined) {
      current = current[k];
    } else {
      current = null;
      break;
    }
  }

  if (current) return current;

  // Fallback to English
  let enCurrent = i18n.en;
  for (const k of keys) {
    if (enCurrent && enCurrent[k] !== undefined) {
      enCurrent = enCurrent[k];
    } else {
      return fallback || path;
    }
  }
  return enCurrent || fallback || path;
}
