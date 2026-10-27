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
      dashboard: "Dashboard"
    },
    auth: {
      loginTitle: "Log In to FixNear",
      loginSubtitle: "Access your bookings, technician dashboard, or admin desk",
      signupTitle: "Create Your Account",
      signupSubtitle: "Join thousands who trust FixNear for verified home care",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter minimum 6 characters",
      fullNameLabel: "Full Name",
      phoneLabel: "Phone Number",
      cityLabel: "City",
      roleSelectLabel: "I want to join as:",
      customerChoice: "I need home repair services (Customer)",
      providerChoice: "I am a skilled technician (Service Provider)",
      googleBtn: "Continue with Google",
      alreadyAccount: "Already have an account? Log In",
      noAccount: "Don't have an account? Sign Up"
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
      dashboard: "डैशबोर्ड"
    },
    auth: {
      loginTitle: "FixNear में लॉग इन करें",
      loginSubtitle: "अपनी बुकिंग्स या तकनीशियन कंसोल तक पहुंचें",
      signupTitle: "अपना खाता बनाएं",
      signupSubtitle: "सत्यापित गृह सेवा के लिए FixNear से जुड़ें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "name@example.com",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "कम से कम 6 अक्षर दर्ज करें",
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
      dashboard: "डॅशबोर्ड"
    },
    auth: {
      loginTitle: "FixNear मध्ये लॉग इन करा",
      loginSubtitle: "आपले बुकिंग किंवा तंत्रज्ञ कन्सोल ॲक्सेस करा",
      signupTitle: "आपले खाते तयार करा",
      signupSubtitle: "विश्वसनीय गृह सेवेसाठी FixNear ला जोडा",
      emailLabel: "ईमेल पत्ता",
      emailPlaceholder: "name@example.com",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "किमान 6 अक्षरे प्रविष्ट करा",
      fullNameLabel: "पूर्ण नाव",
      phoneLabel: "फोन नंबर",
      cityLabel: "शहर",
      roleSelectLabel: "आपण कशा प्रकारे सामील होऊ इच्छिता:",
      customerChoice: "मला घर दुरुस्ती सेवा हवी आहे (ग्राहक)",
      providerChoice: "मी एक कुशल तंत्रज्ञ आहे (सेवा प्रदाता)",
      googleBtn: "Google सह सुरू ठेवा",
      alreadyAccount: "आधीच खाते आहे? लॉग इन करा",
      noAccount: "खाते नाही? साइन अप करा"
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
