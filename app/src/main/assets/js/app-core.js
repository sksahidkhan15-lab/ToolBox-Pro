// ========================================================
// ToolBox Pro - Core Application Module (app-core.js)
// Central configuration, I18n (en/bn), Themes, Navigation, State
// ========================================================

// Requirement 3: Single configuration variable controlling application name
const APP_NAME = "ToolBox Pro";

// Centralized Translation System (English & বাংলা)
const translations = {
  en: {
    appName: "ToolBox Pro",
    tagline: "Smart Utilities for Everyone",
    proBadge: "PRO",
    proCardTag: "PREMIUM",
    proCardTitle: "Unlock ToolBox Pro",
    proCardDesc: "Ad-free, unlimited PDF processing, priority features.",
    upgradeNow: "Upgrade",
    language: "Language / ভাষা",
    theme: "Theme / থিম",
    themeLight: "Light Blue",
    themeDark: "Dark",
    themeSystem: "System",
    navHome: "Home",
    navTools: "All Tools",
    navPremium: "Premium",
    navSettings: "Settings",
    privacyGuaranteed: "100% On-device privacy",
    heroBadge: "⚡ Productive & Fast",
    heroTitle: "Work Smarter, Not Harder",
    heroSubtitle: "All the useful tools you need in one app.",
    openPdfEditor: "PDF Text Editor",
    exploreAllTools: "Explore 24+ Tools",
    searchPlaceholder: "Search any tool (e.g. PDF, Image, GST, QR)...",
    quickActions: "Quick Actions",
    recentTools: "Recently Used",
    popularTools: "Popular Tools",
    viewAll: "View All (24)",
    clear: "Clear",
    starFeature: "CORE FEATURE",
    openTool: "Open Tool →",
    allToolsTitle: "All 24 Tools",
    allToolsSubtitle: "Select a category or tap any utility to begin.",
    catAll: "All (24)",
    catImage: "🖼️ Image (4)",
    catPdf: "📄 PDF (5)",
    catQr: "📱 QR (3)",
    catCalc: "🧮 Calculators (7)",
    catUtility: "🛠️ Utility (4)",
    catMoney: "💵 Money (1)",
    proHeroTitle: "Upgrade to ToolBox Pro",
    proHeroDesc: "Supercharge your productivity with professional capabilities.",
    lifetimeAccess: "LIFETIME ACCESS",
    demoFree: "Special Build",
    activatePro: "Activate Pro Mode",
    deactivatePro: "Deactivate Pro Mode (Demo)",
    proFeat1: "Unlimited PDF Text Editing & High-Res Export",
    proFeat2: "100% Ad-Free Clean Commercial Experience",
    proFeat3: "Batch Image Processing & High Quality Resizing",
    proFeat4: "Unlimited Expense History & JSON Data Backup",
    proFeat5: "Priority Client-Side Processing",
    monetizationArchitecture: "Monetization Architecture",
    monetizationDesc: "Built with an extensible AdService abstraction ready to integrate Google AdMob, Google AdSense, or custom sponsorship slots.",
    settingsTitle: "Settings",
    settingsSubtitle: "Personalize theme, language, and manage local data.",
    setAppearance: "Appearance",
    languageDesc: "Choose application interface language",
    themeDesc: "Select light blue, dark, or system mode",
    setData: "Data & Storage",
    backupData: "Backup Data",
    backupDataDesc: "Export expenses, QR history, and preferences to JSON",
    restoreData: "Restore Data",
    restoreDataDesc: "Import your saved backup JSON file",
    clearData: "Clear History & Data",
    clearDataDesc: "Remove all saved local history and cached files",
    setPrivacy: "Privacy & Trust",
    privacyPolicy: "Privacy Policy",
    privacyPolicyDesc: "All documents and images are processed on your device",
    termsOfService: "Terms of Service",
    termsOfServiceDesc: "Read guidelines and open-source license info",
    setAbout: "About",
    shareApp: "Share ToolBox Pro",
    shareAppDesc: "Share this progressive web app with friends & colleagues",
    editTextTitle: "Edit PDF Text",
    originalText: "Original PDF Text",
    replacementText: "New Replacement Text",
    fontSize: "Font Size",
    textColor: "Text Color",
    coverColor: "Cover Color",
    styleOptions: "Style",
    editPreserveHint: "The original text will be covered cleanly and the new text placed at the exact same coordinates.",
    cancel: "Cancel",
    applyChange: "Apply Change",
    signatureTitle: "Draw Your Signature",
    sigHint: "Draw with your finger or stylus inside the box below.",
    insertSignature: "Insert Signature",
    pageManagerTitle: "Page Manager",
    addBlankPage: "+ Add Blank",
    done: "Done",
    privacy1Title: "1. 100% Local Processing",
    privacy1Desc: "ToolBox Pro prioritizes your privacy. Your PDF documents, images, expenses, and QR codes are processed locally in your browser's memory. No uploaded files are stored on external application servers.",
    privacy2Title: "2. No Personal Data Harvesting",
    privacy2Desc: "We do not collect personal names, files, passwords, or transaction data. Everything stays on your phone or computer unless you explicitly export or share it.",
    privacy3Title: "3. Camera Access",
    privacy3Desc: "Camera permissions are requested solely for client-side QR code scanning and are never streamed or recorded.",
    close: "Close",

    // Tool Titles & Descriptions
    tool_image_compressor: "Image Compressor",
    tool_image_compressor_desc: "Reduce image file size quickly while preserving clarity.",
    tool_image_resize: "Image Resize",
    tool_image_resize_desc: "Scale image dimensions with locked or custom aspect ratios.",
    tool_image_crop: "Image Crop",
    tool_image_crop_desc: "Crop photos using square, 16:9, or freehand frame.",
    tool_image_convert: "Image Convert",
    tool_image_convert_desc: "Convert image files to PNG, JPEG, or WebP formats.",
    tool_pdf_text_editor: "PDF Text Editor",
    tool_pdf_text_editor_desc: "Edit text and numbers inside PDF files with precision.",
    tool_image_to_pdf: "Image → PDF",
    tool_image_to_pdf_desc: "Convert multiple photos into a single clean PDF document.",
    tool_pdf_merge: "PDF Merge",
    tool_pdf_merge_desc: "Combine multiple PDF files into one complete document.",
    tool_pdf_split: "PDF Split",
    tool_pdf_split_desc: "Extract specific page ranges or individual pages from a PDF.",
    tool_pdf_to_image: "PDF → Image",
    tool_pdf_to_image_desc: "Render and extract PDF pages as high-resolution PNG/JPG.",
    tool_qr_scanner: "QR Scanner",
    tool_qr_scanner_desc: "Instant camera & image scan for URLs, WiFi and texts.",
    tool_qr_generator: "QR Generator",
    tool_qr_generator_desc: "Create custom QR codes for URLs, WiFi, emails and contacts.",
    tool_qr_history: "QR History",
    tool_qr_history_desc: "Review and re-use your past scanned and generated QR codes.",
    tool_calculator: "Calculator",
    tool_calculator_desc: "Everyday standard calculator with history tape.",
    tool_gst_calculator: "GST Calculator",
    tool_gst_calculator_desc: "Calculate GST addition & removal with exact tax split.",
    tool_percentage_calculator: "Percentage Calculator",
    tool_percentage_calculator_desc: "Calculate percentage changes, increases, and proportions.",
    tool_age_calculator: "Age Calculator",
    tool_age_calculator_desc: "Calculate exact age, days lived, and next birthday countdown.",
    tool_discount_calculator: "Discount Calculator",
    tool_discount_calculator_desc: "Determine sale savings, discount percentages, and final prices.",
    tool_emi_calculator: "EMI Calculator",
    tool_emi_calculator_desc: "Calculate monthly loan installments and total interest payable.",
    tool_bmi_calculator: "BMI Calculator",
    tool_bmi_calculator_desc: "Check Body Mass Index and health category with visual meter.",
    tool_unit_converter: "Unit Converter",
    tool_unit_converter_desc: "Convert length, weight, speed, temperature, and data units.",
    tool_password_generator: "Password Generator",
    tool_password_generator_desc: "Generate secure, random passwords with custom rules.",
    tool_text_counter: "Text Counter",
    tool_text_counter_desc: "Count words, characters, sentences, and estimated reading time.",
    tool_random_number: "Random Number Generator",
    tool_random_number_desc: "Generate fair random numbers within your custom range.",
    tool_expense_tracker: "Expense Tracker",
    tool_expense_tracker_desc: "Track daily spending with categories & local summaries."
  },

  bn: {
    appName: "টুলবক্স প্রো",
    tagline: "সবার জন্য স্মার্ট ইউটিলিটি",
    proBadge: "প্রো",
    proCardTag: "প্রিমিয়াম",
    proCardTitle: "টুলবক্স প্রো আনলক করুন",
    proCardDesc: "বিজ্ঞাপনহীন, আনলিমিটেড পিডিএফ এডিটিং এবং প্রায়োরিটি সুবিধা।",
    upgradeNow: "আপগ্রেড",
    language: "ভাষা / Language",
    theme: "থিম / Theme",
    themeLight: "লাইট ব্লু",
    themeDark: "ডার্ক",
    themeSystem: "সিস্টেম",
    navHome: "হোম",
    navTools: "সকল টুল",
    navPremium: "প্রিমিয়াম",
    navSettings: "সেটিংস",
    privacyGuaranteed: "১০০% সম্পূর্ণ অন-ডিভাইস প্রাইভেসি",
    heroBadge: "⚡ দ্রুত এবং কার্যকারী",
    heroTitle: "কাজ করুন আরও সহজে ও স্মার্টলি",
    heroSubtitle: "প্রয়োজনীয় সব টুল এখন এক জায়গায়।",
    openPdfEditor: "পিডিএফ টেক্সট এডিটর",
    exploreAllTools: "২৪+ টুল দেখুন",
    searchPlaceholder: "যেকোনো টুল খুঁজুন (যেমন: পিডিএফ, ছবি, জিএসটি, কিউআর)...",
    quickActions: "কুইক অ্যাকশন",
    recentTools: "সম্প্রতি ব্যবহৃত",
    popularTools: "জনপ্রিয় টুলসমূহ",
    viewAll: "সব দেখুন (২৪)",
    clear: "মুছুন",
    starFeature: "প্রধান ফিচার",
    openTool: "টুল খুলুন →",
    allToolsTitle: "সকল ২৪টি টুল",
    allToolsSubtitle: "একটি ক্যাটাগরি বেছে নিন অথবা যেকোনো টুলে ট্যাপ করুন।",
    catAll: "সব (২৪)",
    catImage: "🖼️ ছবি (৪)",
    catPdf: "📄 পিডিএফ (৫)",
    catQr: "📱 কিউআর (৩)",
    catCalc: "🧮 ক্যালকুলেটর (৭)",
    catUtility: "🛠️ ইউটিলিটি (৪)",
    catMoney: "💵 টাকা-পয়সা (১)",
    proHeroTitle: "টুলবক্স প্রো-তে আপগ্রেড করুন",
    proHeroDesc: "পেশাদার ক্ষমতার সাথে আপনার কাজের গতি বাড়িয়ে নিন।",
    lifetimeAccess: "লাইফটাইম অ্যাক্সেস",
    demoFree: "স্পেশাল বিল্ড",
    activatePro: "প্রো মোড চালু করুন",
    deactivatePro: "প্রো মোড বন্ধ করুন (ডেমো)",
    proFeat1: "আনলিমিটেড পিডিএফ টেক্সট এডিটিং ও এক্সপোর্ট",
    proFeat2: "১০০% বিজ্ঞাপনহীন প্রিমিয়াম ইন্টারফেস",
    proFeat3: "উচ্চমানের ব্যাচ ইমেজ প্রসেসিং",
    proFeat4: "আনলিমিটেড খরচ হিসেব ও ব্যাকআপ",
    proFeat5: "দ্রুততম ক্লায়েন্ট-সাইড প্রসেসিং",
    monetizationArchitecture: "মনিটাইজেশন আর্কিটেকচার",
    monetizationDesc: "ভবিষ্যতে গুগল অ্যাডমব অথবা স্পনসরশিপ যুক্ত করার জন্য উপযুক্ত অ্যাডসার্ভিস আর্কিটেকচার।",
    settingsTitle: "সেটিংস",
    settingsSubtitle: "থিম, ভাষা এবং লোকাল ডেটা নিয়ন্ত্রণ করুন।",
    setAppearance: "চেহারা ও থিম",
    languageDesc: "অ্যাপ্লিকেশনের ডিসপ্লে ভাষা নির্বাচন করুন",
    themeDesc: "লাইট ব্লু, ডার্ক বা সিস্টেম মোড বাছাই করুন",
    setData: "ডেটা ও স্টোরেজ",
    backupData: "ডেটা ব্যাকআপ",
    backupDataDesc: "খরচের হিসেব ও কিউআর হিস্ট্রি JSON ফাইলে এক্সপোর্ট করুন",
    restoreData: "ডেটা রিস্টোর",
    restoreDataDesc: "সংরক্ষিত JSON ব্যাকআপ ফাইল ইমপোর্ট করুন",
    clearData: "সকল হিস্ট্রি ও ডেটা মুছুন",
    clearDataDesc: "লোকাল স্টোরেজ থেকে সব সংরক্ষিত হিস্ট্রি পরিষ্কার করুন",
    setPrivacy: "প্রাইভেসি ও ট্রাস্ট",
    privacyPolicy: "প্রাইভেসি পলিসি",
    privacyPolicyDesc: "সব ফাইল এবং ডকুমেন্ট সম্পূর্ণ আপনার ফোনে প্রসেস হয়",
    termsOfService: "ব্যবহারের নিয়মাবলী",
    termsOfServiceDesc: "নিয়মাবলী এবং ওপেন সোর্স লাইসেন্স তথ্য",
    setAbout: "অ্যাপ সম্পর্কিত",
    shareApp: "টুলবক্স প্রো শেয়ার করুন",
    shareAppDesc: "বন্ধুদের সাথে এই সুবিধাজনক ওয়েব অ্যাপটি শেয়ার করুন",
    editTextTitle: "পিডিএফ লেখা পরিবর্তন করুন",
    originalText: "আসল পিডিএফ লেখা",
    replacementText: "নতুন প্রতিস্থাপন লেখা",
    fontSize: "ফন্ট সাইজ",
    textColor: "লেখার রঙ",
    coverColor: "কভার রঙ",
    styleOptions: "স্টাইল",
    editPreserveHint: "মূল লেখাটি পরিষ্কারভাবে ঢেকে নতুন লেখাটি হুবহু একই স্থানে বসানো হবে।",
    cancel: "বাতিল",
    applyChange: "পরিবর্তন প্রয়োগ করুন",
    signatureTitle: "স্বাক্ষর আঁকুন",
    sigHint: "নিচের ঘরে আঙুল বা স্টাইলাস দিয়ে স্বাক্ষর করুন।",
    insertSignature: "স্বাক্ষর যুক্ত করুন",
    pageManagerTitle: "পেজ ম্যানেজার",
    addBlankPage: "+ খালি পেজ যোগ",
    done: "সম্পন্ন",
    privacy1Title: "১. ১০০% লোকাল প্রসেসিং",
    privacy1Desc: "টুলবক্স প্রো আপনার প্রাইভেসির সর্বাধিক সম্মান করে। আপনার কোনো পিডিএফ বা ছবি কোনো সার্ভারে পাঠানো হয় না, সম্পূর্ণ ব্রাউজারে তৈরি হয়।",
    privacy2Title: "২. কোনো ব্যক্তিগত তথ্য সংগ্রহ নয়",
    privacy2Desc: "আমরা নাম, পাসওয়ার্ড বা লেনদেনের কোনো তথ্য সংগ্রহ বা বিক্রি করি না।",
    privacy3Title: "৩. ক্যামেরা পারমিশন",
    privacy3Desc: "ক্যামেরা কেবল অন-ডিভাইস কিউআর কোড স্ক্যান করতে ব্যবহার হয়।",
    close: "বন্ধ করুন",

    tool_image_compressor: "ইমেজ কম্প্রেসার",
    tool_image_compressor_desc: "ছবির স্বচ্ছতা বজায় রেখে সহজেই ফাইলের সাইজ কমান।",
    tool_image_resize: "ইমেজ রিসাইজ",
    tool_image_resize_desc: "ছবির দৈর্ঘ্য ও প্রস্থ আপনার প্রয়োজন অনুযায়ী পরিবর্তন করুন।",
    tool_image_crop: "ইমেজ ক্রপ",
    tool_image_crop_desc: "বর্গাকার, ১৬:৯ বা কাস্টম ফ্রেমে ছবি কেটে নিন।",
    tool_image_convert: "ইমেজ কনভার্ট",
    tool_image_convert_desc: "ছবি PNG, JPEG অথবা WebP ফরম্যাটে রূপান্তর করুন।",
    tool_pdf_text_editor: "পিডিএফ টেক্সট এডিটর",
    tool_pdf_text_editor_desc: "পিডিএফ ফাইলের ভেতরের লেখা ও সংখ্যা সহজে এডিট করুন।",
    tool_image_to_pdf: "ছবি থেকে পিডিএফ",
    tool_image_to_pdf_desc: "একাধিক ছবি একত্রিত করে একটি পরিচ্ছন্ন পিডিএফ তৈরি করুন।",
    tool_pdf_merge: "পিডিএফ মার্জ",
    tool_pdf_merge_desc: "একাধিক পিডিএফ ফাইল জোড়া দিয়ে একটি ফাইল বানান।",
    tool_pdf_split: "পিডিএফ স্প্লিট",
    tool_pdf_split_desc: "পিডিএফ থেকে নির্দিষ্ট পেজ বা পেজ রেঞ্জ আলাদা করুন।",
    tool_pdf_to_image: "পিডিএফ থেকে ছবি",
    tool_pdf_to_image_desc: "পিডিএফ পেজগুলো হাই-রেজোলিউশন ছবিতে রূপান্তর করুন।",
    tool_qr_scanner: "কিউআর স্ক্যানার",
    tool_qr_scanner_desc: "ক্যামেরা বা ছবি থেকে সরাসরি কিউআর কোড স্ক্যান করুন।",
    tool_qr_generator: "কিউআর জেনারেটর",
    tool_qr_generator_desc: "ওয়েবসাইট, ওয়াইফাই এবং মেসেজের জন্য কিউআর তৈরি করুন।",
    tool_qr_history: "কিউআর হিস্ট্রি",
    tool_qr_history_desc: "আপনার পূর্বের স্ক্যান এবং তৈরি করা কিউআর তালিকা।",
    tool_calculator: "ক্যালকুলেটর",
    tool_calculator_desc: "প্রতিদিনের সাধারণ হিসাবের পূর্ণাঙ্গ ক্যালকুলেটর।",
    tool_gst_calculator: "জিএসটি ক্যালকুলেটর",
    tool_gst_calculator_desc: "জিএসটি যোগ বা বাদ দেওয়ার নির্ভুল ট্যাক্স হিসাব।",
    tool_percentage_calculator: "শতকরা ক্যালকুলেটর",
    tool_percentage_calculator_desc: "শতকরা হার, বৃদ্ধি এবং হ্রাসের সহজ হিসাব।",
    tool_age_calculator: "বয়স ক্যালকুলেটর",
    tool_age_calculator_desc: "সঠিক বয়স, দিন এবং পরবর্তী জন্মদিনের দিন গণনা।",
    tool_discount_calculator: "ছাড় / ডিসকাউন্ট ক্যালকুলেটর",
    tool_discount_calculator_desc: "পণ্যের ছাড় ও চূড়ান্ত বিক্রয়মূল্য নির্ধারণ করুন।",
    tool_emi_calculator: "ইএমআই ক্যালকুলেটর",
    tool_emi_calculator_desc: "ঋণের মাসিক কিস্তি এবং মোট সুদের নিখুঁত হিসাব।",
    tool_bmi_calculator: "বিএমআই ক্যালকুলেটর",
    tool_bmi_calculator_desc: "শরীরের উচ্চতা ও ওজনের স্বাস্থ্যকর সূচক পরিমাপ।",
    tool_unit_converter: "একক রূপান্তরকারী",
    tool_unit_converter_desc: "দৈর্ঘ্য, ওজন, গতি, তাপমাত্রা এবং ডেটা রূপান্তর করুন।",
    tool_password_generator: "পাসওয়ার্ড জেনারেটর",
    tool_password_generator_desc: "সুরক্ষিত ও জটিল র‍্যান্ডম পাসওয়ার্ড তৈরি করুন।",
    tool_text_counter: "টেক্সট কাউন্টার",
    tool_text_counter_desc: "শব্দ, অক্ষর, বাক্য এবং আনুমানিক পড়ার সময় মাপুন।",
    tool_random_number: "র‍্যান্ডম নম্বর",
    tool_random_number_desc: "নির্ধারিত সীমার মধ্যে র‍্যান্ডম সংখ্যা লটারি করুন।",
    tool_expense_tracker: "খরচের খাতা",
    tool_expense_tracker_desc: "দৈনন্দিন আয়-ব্যয় ক্যাটাগরিভিত্তিক লিপিবদ্ধ ও পর্যালোচনা করুন।"
  }
};

// Global App State
const AppState = {
  appName: APP_NAME,
  lang: localStorage.getItem('tb_lang') || 'en',
  theme: localStorage.getItem('tb_theme') || 'light',
  isPro: localStorage.getItem('tb_is_pro') === 'true',
  recentTools: JSON.parse(localStorage.getItem('tb_recents') || '[]'),
  currentTab: 'home',
  activeToolId: null
};

// Core AdService Abstraction (Monetization Architecture)
const AdService = {
  isAdsEnabled() {
    return !AppState.isPro;
  },
  renderBanner() {
    const banner = document.getElementById('ad-banner-home');
    if (!banner) return;
    if (this.isAdsEnabled()) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  },
  showInterstitial(callback) {
    if (!this.isAdsEnabled()) {
      if (callback) callback();
      return;
    }
    // Simulation / Placeholder hook for ad networks (AdMob / AdSense)
    console.log('[AdService] Interstitial slot triggered');
    if (callback) callback();
  }
};

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// I18n Manager
function setLanguage(lang) {
  if (!translations[lang]) return;
  AppState.lang = lang;
  localStorage.setItem('tb_lang', lang);

  // Update HTML elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // App Name Sync
  document.querySelectorAll('.app-name-text').forEach((el) => {
    el.textContent = AppState.lang === 'bn' ? translations.bn.appName : APP_NAME;
  });

  // Segmented control active states
  document.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  const select = document.getElementById('select-settings-lang');
  if (select) select.value = lang;

  // Re-render tools catalog with translated titles
  if (window.renderFullToolsCatalog) {
    window.renderFullToolsCatalog();
  }
  if (window.renderRecentTools) {
    window.renderRecentTools();
  }
}

// Theme Manager
function setTheme(theme) {
  AppState.theme = theme;
  localStorage.setItem('tb_theme', theme);
  document.body.setAttribute('data-theme', theme);

  document.querySelectorAll('.segment-theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
  });

  const select = document.getElementById('select-settings-theme');
  if (select) select.value = theme;
}

// Tab Navigation Manager
function switchTab(tabName) {
  AppState.currentTab = tabName;
  closeWorkspace();

  document.querySelectorAll('.view-screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(`view-${tabName}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Bottom Navigation state
  document.querySelectorAll('.bottom-nav .nav-item').forEach((item) => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
  });

  closeDrawer();
}

// Drawer Drawer Controls
function openDrawer() {
  document.getElementById('app-drawer').classList.add('open');
  document.getElementById('drawer-backdrop').classList.remove('hidden');
}

function closeDrawer() {
  document.getElementById('app-drawer').classList.remove('open');
  document.getElementById('drawer-backdrop').classList.add('hidden');
}

// Workspace Management (Opening Tools)
function openToolWorkspace(toolId) {
  const ws = document.getElementById('view-tool-workspace');
  const titleEl = document.getElementById('workspace-tool-title');
  const catEl = document.getElementById('workspace-tool-category');
  const bodyEl = document.getElementById('workspace-active-body');

  AppState.activeToolId = toolId;
  recordRecentTool(toolId);

  // Look up metadata
  const tool = ALL_TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    showToast('Tool not found', 'error');
    return;
  }

  titleEl.textContent = getToolTitle(tool.id);
  catEl.textContent = tool.category.toUpperCase();

  // Clear previous body
  bodyEl.innerHTML = '';

  // Delegate rendering to corresponding module
  if (toolId === 'pdf-text-editor') {
    if (window.initPdfEditorTool) window.initPdfEditorTool(bodyEl);
  } else if (['image-compressor', 'image-resize', 'image-crop', 'image-convert', 'image-to-pdf', 'pdf-merge', 'pdf-split', 'pdf-to-image'].includes(toolId)) {
    if (window.renderMediaTool) window.renderMediaTool(toolId, bodyEl);
  } else {
    if (window.renderCalcOrUtilityTool) window.renderCalcOrUtilityTool(toolId, bodyEl);
  }

  ws.classList.remove('hidden');
}

function closeWorkspace() {
  const ws = document.getElementById('view-tool-workspace');
  ws.classList.add('hidden');
  AppState.activeToolId = null;

  // Stop camera if open
  if (window.stopQrCamera) window.stopQrCamera();
}

function getToolTitle(toolId) {
  const key = `tool_${toolId.replace(/-/g, '_')}`;
  return translations[AppState.lang][key] || toolId;
}

function getToolDesc(toolId) {
  const key = `tool_${toolId.replace(/-/g, '_')}_desc`;
  return translations[AppState.lang][key] || '';
}

// Recent Tools in LocalStorage
function recordRecentTool(toolId) {
  let list = AppState.recentTools.filter((id) => id !== toolId);
  list.unshift(toolId);
  if (list.length > 8) list.pop();
  AppState.recentTools = list;
  localStorage.setItem('tb_recents', JSON.stringify(list));
  renderRecentTools();
}

function renderRecentTools() {
  const container = document.getElementById('home-recent-list');
  const section = document.getElementById('home-recent-section');
  if (!container) return;

  if (AppState.recentTools.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  container.innerHTML = '';

  AppState.recentTools.forEach((toolId) => {
    const tool = ALL_TOOLS.find((t) => t.id === toolId);
    if (!tool) return;
    const pill = document.createElement('div');
    pill.className = 'recent-tool-pill';
    pill.innerHTML = `
      <span class="recent-pill-icon">${tool.emoji}</span>
      <span class="recent-pill-name">${getToolTitle(tool.id)}</span>
    `;
    pill.onclick = () => openToolWorkspace(tool.id);
    container.appendChild(pill);
  });
}

// Backup & Restore System
function exportBackupJSON() {
  const data = {
    version: '1.2.0',
    appName: APP_NAME,
    timestamp: new Date().toISOString(),
    settings: {
      lang: AppState.lang,
      theme: AppState.theme,
      isPro: AppState.isPro
    },
    recents: AppState.recentTools,
    expenses: JSON.parse(localStorage.getItem('tb_expenses') || '[]'),
    qrHistory: JSON.parse(localStorage.getItem('tb_qr_history') || '[]')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `toolbox-pro-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(AppState.lang === 'bn' ? 'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে' : 'Backup downloaded successfully', 'success');
}

function restoreBackupJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.settings) {
        if (data.settings.lang) setLanguage(data.settings.lang);
        if (data.settings.theme) setTheme(data.settings.theme);
        if (data.settings.isPro !== undefined) {
          AppState.isPro = data.settings.isPro;
          localStorage.setItem('tb_is_pro', data.settings.isPro);
        }
      }
      if (data.recents) {
        AppState.recentTools = data.recents;
        localStorage.setItem('tb_recents', JSON.stringify(data.recents));
      }
      if (data.expenses) {
        localStorage.setItem('tb_expenses', JSON.stringify(data.expenses));
      }
      if (data.qrHistory) {
        localStorage.setItem('tb_qr_history', JSON.stringify(data.qrHistory));
      }
      renderRecentTools();
      AdService.renderBanner();
      showToast(AppState.lang === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে' : 'Backup restored successfully!', 'success');
    } catch (err) {
      showToast('Invalid backup file', 'error');
    }
  };
  reader.readAsText(file);
}

// Central Tool Registry (All 24 Tools)
const ALL_TOOLS = [
  // CATEGORY 1: IMAGE TOOLS
  { id: 'image-compressor', category: 'image', emoji: '🗜️', accent: 'green-accent' },
  { id: 'image-resize', category: 'image', emoji: '📐', accent: 'cyan-accent' },
  { id: 'image-crop', category: 'image', emoji: '✂️', accent: 'rose-accent' },
  { id: 'image-convert', category: 'image', emoji: '🔄', accent: 'indigo-accent' },

  // CATEGORY 2: PDF TOOLS
  { id: 'pdf-text-editor', category: 'pdf', emoji: '✏️', accent: 'blue-accent', featured: true },
  { id: 'image-to-pdf', category: 'pdf', emoji: '📄', accent: 'cyan-accent' },
  { id: 'pdf-merge', category: 'pdf', emoji: '📑', accent: 'purple-accent' },
  { id: 'pdf-split', category: 'pdf', emoji: '✂️', accent: 'orange-accent' },
  { id: 'pdf-to-image', category: 'pdf', emoji: '🖼️', accent: 'emerald-accent' },

  // CATEGORY 3: QR TOOLS
  { id: 'qr-scanner', category: 'qr', emoji: '📷', accent: 'purple-accent' },
  { id: 'qr-generator', category: 'qr', emoji: '📱', accent: 'blue-accent' },
  { id: 'qr-history', category: 'qr', emoji: '📜', accent: 'amber-accent' },

  // CATEGORY 4: CALCULATORS
  { id: 'calculator', category: 'calculator', emoji: '🔢', accent: 'blue-accent' },
  { id: 'gst-calculator', category: 'calculator', emoji: '🏷️', accent: 'orange-accent' },
  { id: 'percentage-calculator', category: 'calculator', emoji: '％', accent: 'emerald-accent' },
  { id: 'age-calculator', category: 'calculator', emoji: '🎂', accent: 'rose-accent' },
  { id: 'discount-calculator', category: 'calculator', emoji: '🏷️', accent: 'cyan-accent' },
  { id: 'emi-calculator', category: 'calculator', emoji: '🏦', accent: 'indigo-accent' },
  { id: 'bmi-calculator', category: 'calculator', emoji: '⚖️', accent: 'purple-accent' },

  // CATEGORY 5: UTILITY
  { id: 'unit-converter', category: 'utility', emoji: '📏', accent: 'emerald-accent' },
  { id: 'password-generator', category: 'utility', emoji: '🔑', accent: 'rose-accent' },
  { id: 'text-counter', category: 'utility', emoji: '📝', accent: 'cyan-accent' },
  { id: 'random-number', category: 'utility', emoji: '🎲', accent: 'amber-accent' },

  // CATEGORY 6: MONEY
  { id: 'expense-tracker', category: 'money', emoji: '💰', accent: 'emerald-accent' }
];

window.APP_NAME = APP_NAME;
window.AppState = AppState;
window.translations = translations;
window.ALL_TOOLS = ALL_TOOLS;
window.setLanguage = setLanguage;
window.setTheme = setTheme;
window.switchTab = switchTab;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.openToolWorkspace = openToolWorkspace;
window.closeWorkspace = closeWorkspace;
window.getToolTitle = getToolTitle;
window.getToolDesc = getToolDesc;
window.showToast = showToast;
window.AdService = AdService;
window.exportBackupJSON = exportBackupJSON;
window.restoreBackupJSON = restoreBackupJSON;
window.renderRecentTools = renderRecentTools;
