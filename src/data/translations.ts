import { SiteSettings, Program, Leader, EventItem, PageItem, GalleryItem, Language, ContactDetail } from '../types';
import {
  translateNameToUrdu,
  translateNameToEnglish,
  translateOccupationToUrdu,
  translateOccupationToEnglish,
  translateAddressToUrdu,
  translateAddressToEnglish,
  translateMonthToUrdu,
  translateMonthToEnglish,
  translateUrduToEnglish,
  translateEnglishToUrdu,
  isUrduText,
  isCorruptedTransliteration,
  cleanCorruptedUrdu,
} from '../utils/urduTransliterator';
import { translateViaAzure, getCachedTranslation, setCachedTranslation } from '../services/azureTranslator';

// ── Live Translation Upgrade Channel ─────────────────────────────────
// Azure Translator is the PRIMARY translator for all free-form,
// admin-entered bilingual text. The hand-curated word-by-word dictionary
// (translateUrduToEnglish / translateEnglishToUrdu) below is the SECONDARY,
// offline fallback: it exists only (a) as the instant placeholder shown for
// the brief moment before Azure has ever translated a given string, and (b)
// as the permanent fallback if Azure is unreachable or misconfigured (no
// network, no API key, backend error) - it never overrides a real Azure
// result once one exists.
//
// To make Azure feel primary in practice (not just "eventually correct"),
// `prewarmSiteTranslations()` below proactively batch-translates every
// piece of dynamic site content via Azure the moment it loads from
// Firestore - well before the user ever switches language - so that by the
// time English/Urdu is actually requested, the real translation is already
// cached and the dictionary guess is rarely (ideally never) seen at all.
// getLocalizedSetting() and friends still return the dictionary's
// synchronous guess immediately on an actual cache miss (React render
// functions can't block on network), then kick off/await a real Azure
// translation in the background; when it resolves, the result is cached
// and every subscribed component (via LanguageContext) re-renders with the
// corrected, Azure-sourced text.
type TranslationListener = () => void;
const translationUpdateListeners = new Set<TranslationListener>();
export function subscribeToTranslationUpdates(cb: TranslationListener): () => void {
  translationUpdateListeners.add(cb);
  return () => translationUpdateListeners.delete(cb);
}
function notifyTranslationUpdate() {
  translationUpdateListeners.forEach((cb) => cb());
}
const azureWarmupInFlight = new Set<string>();
function warmAzureTranslation(text: string, to: 'ur' | 'en', from: 'en' | 'ur') {
  const key = `${from}>${to}::${text}`;
  if (azureWarmupInFlight.has(key)) return;
  azureWarmupInFlight.add(key);
  translateViaAzure(text, to, from)
    .then((result) => {
      azureWarmupInFlight.delete(key);
      const trimmedResult = (result || '').trim();
      if (trimmedResult && trimmedResult !== text.trim()) {
        setCachedTranslation(text, to, trimmedResult, from);
        notifyTranslationUpdate();
      }
    })
    .catch(() => {
      azureWarmupInFlight.delete(key);
    });
}

/**
 * Proactively seeds the Azure translation cache for every piece of dynamic,
 * admin-entered bilingual content (programs, leaders, events, pages,
 * gallery captions) as soon as it's loaded - in whichever direction each
 * string actually needs (detected via isUrduText), and only for strings
 * that don't already have a cached translation. This is what makes Azure
 * the PRIMARY source in real usage: by the time a visitor toggles language,
 * most (ideally all) of the page's text already has a genuine Azure
 * translation sitting in cache, so the word-by-word dictionary guess is
 * only ever a fallback, not what people normally see.
 * Call this once per fresh data load (e.g. from DataContext) - it's cheap
 * and idempotent to call repeatedly since already-cached strings are
 * skipped instantly.
 */
export function prewarmSiteTranslations(data: {
  programs?: Program[];
  leaders?: Leader[];
  events?: EventItem[];
  pages?: PageItem[];
  gallery?: GalleryItem[];
}): void {
  const seen = (text?: string) => {
    if (!text || !text.trim()) return;
    // Only ever needs to run in the direction the admin actually needs:
    // this site's content is written in Urdu, so in practice this is
    // almost always a Urdu -> English translation. Detected from the
    // text itself rather than trusted from a field name (e.g. `nameUr`),
    // since the admin can't reliably tell which field is which.
    const looksUrdu = isUrduText(text);
    const to: 'en' | 'ur' = looksUrdu ? 'en' : 'ur';
    const from: 'en' | 'ur' = looksUrdu ? 'ur' : 'en';
    if (getCachedTranslation(text, to, from)) return;
    warmAzureTranslation(text, to, from);
  };

  (data.programs || []).forEach((p) => { seen(p.title); seen(p.desc); });
  (data.leaders || []).forEach((l) => {
    // Check both possible fields independently rather than skipping one
    // just because its "Ur" companion is non-empty - an admin who can't
    // read English may well have put Urdu text in both, or in the "wrong"
    // one. seen() is a no-op for text that's already in its target
    // language or already cached, so this costs nothing extra in the
    // common well-filled case.
    seen(l.name); seen(l.nameUr);
    seen(l.role); seen(l.roleUr);
    seen(l.location); seen(l.locationUr);
    seen(l.message); seen(l.messageUr);
    seen(l.bio); seen(l.bioUr);
  });
  (data.events || []).forEach((e) => { seen(e.title); seen(e.place); seen(e.tag); });
  (data.pages || []).forEach((p) => { seen(p.title); seen(p.body); seen(p.label); });
  (data.gallery || []).forEach((g) => { seen(g.caption); seen(g.captionUr); });
}

/**
 * Shared resolver used by every getLocalized*() function below: checks the
 * Azure cache FIRST (Azure is the primary, source-of-truth translator) -
 * if `prewarmSiteTranslations()` already ran for this content, this is the
 * common case and returns a real machine translation immediately. Only on
 * an actual cache miss does it fall back to the hand-curated dictionary as
 * a secondary, synchronous stand-in, while also kicking off a real Azure
 * translation in the background for next time.
 * Returns `text` unchanged if it's already in the target language.
 */
function resolveTranslation(
  text: string,
  targetLang: 'en' | 'ur',
  dictTranslate: (t: string) => string
): string {
  if (!text) return text;
  const alreadyTargetLang = targetLang === 'ur' ? isUrduText(text) : !isUrduText(text);
  if (alreadyTargetLang) return text;
  const sourceLang: 'en' | 'ur' = targetLang === 'ur' ? 'en' : 'ur';
  const cached = getCachedTranslation(text, targetLang, sourceLang);
  if (cached) return cached;
  warmAzureTranslation(text, targetLang, sourceLang);
  return dictTranslate(text);
}

export const EN: Record<string, string> = {
  // Brand & Identity
  siteName: "ARAAIN BANNU",
  siteTagline: "Unity, Empowerment, Development",
  siteSubName: "Bannu Regional Organisation",
  siteSubTagline: "Strengthening community bonds across Bannu & KPK",
  logoInitials: "AB",
  langToggleText: "Urdu",
  cloudOnline: "Firebase Connected",
  cloudSyncing: "Syncing...",
  cloudOffline: "Local Mode",
  
  // Navigation
  navHome: "Home",
  navAbout: "About Us",
  navPrograms: "Programs",
  navLeadership: "Leadership",
  navEvents: "Events",
  navGallery: "Gallery",
  navContact: "Contact",
  navAdmin: "Admin Portal",
  navApply: "Join Us",
  navDonate: "Donate",

  // Hero
  heroBadge: "Global Community Movement",
  heroTitle: "ARAAIN BANNU",
  heroSub: "Empowering Our Next Generation, Proud Of Our Heritage",
  heroTagline: "Uniting the Araain Community Worldwide — Strength, Unity, Progress. Join a legacy of community development, education, and welfare.",
  btnDiscover: "Discover Mission",
  btnEvents: "Upcoming Events",
  btnBecomeMember: "Become a Member",

  // About
  aboutTag: "Who We Are",
  aboutTitle: "A Global Vision Rooted in Service & Community",
  aboutSubtitle: "Dedicated to the socio-economic advancement of the Araain community worldwide.",
  aboutP1: "The ARAAIN BANNU represents thousands of families across Pakistan and the diaspora, driven by a shared commitment to education, welfare, and sustainable development.",
  aboutP2: "Through strategic initiatives, scholarship programs, community centers, and youth engagement, we build bridges between tradition and modern opportunity.",
  aboutP3: "Our regional chapter in Bannu works actively at the grassroots level, providing relief, career mentorship, and community cohesion for families across Southern Khyber Pakhtunkhwa.",
  statMembers: "500+",
  statMembersLabel: "Active Members",
  statPrograms: "8+",
  statProgramsLabel: "Flagship Programs",
  statCities: "30+",
  statCitiesLabel: "Connected Cities",
  chairmanTitle: "Leadership Message",
  chairmanName: "Dr. Aitzaz Chaudhary",
  chairmanRole: "Global Chairman",
  chairmanQuote: "Our unity is our greatest strength. When we empower our youth and support our families, we build a foundation that endures for generations.",
  valueTransparent: "Transparent Welfare",
  valueScholarships: "Merit Scholarships",
  valueBrotherhood: "Global Brotherhood",

  // Programs
  programsTitle: "Key Initiatives & Programs",
  programsDesc: "Targeted programs designed to uplift families, educate youth, and preserve community welfare.",
  btnLearnMore: "Learn More",

  // Leadership
  leadershipTitle: "Our Leadership Team",
  leadershipDesc: "Committed community servants providing strategic guidance and global connection.",
  featuredBadge: "Featured",

  // Events
  eventsTitle: "Upcoming Events & Programs",
  eventsDesc: "Stay connected with upcoming gatherings, business workshops, and annual assemblies.",
  eventLocation: "Location",
  eventTime: "Time",

  // Gallery
  galleryTitle: "Community Moments",
  galleryDesc: "A visual journey through our community events, gatherings, and welfare drives.",

  // Call to Action
  ctaTitle: "Be Part of Our Journey",
  ctaDesc: "Join as an active member or support our welfare initiatives with your generous contributions.",
  membershipCardTitle: "Official Membership",
  membershipCardDesc: "Register today to receive your official membership ID card, vote in community affairs, and access member-exclusive programs.",
  donateCardTitle: "Support Our Welfare",
  donateCardDesc: "Your donations directly fund education scholarships, healthcare camps, and emergency relief operations.",
  btnApplyMembership: "Apply for Membership",
  btnDonateNow: "Donate Now",

  // Membership Form
  memFormTitle: "Membership Registration",
  memFormSubtitle: "Complete this form to apply for official membership with ARAAIN BANNU.",
  memStep1: "Personal Details",
  memStep2: "Contact & Identity",
  memStep3: "Professional & Background",
  memStep4: "Address & Photo",

  fieldFullName: "Full Name",
  phFullName: "e.g. Muhammad Tahir",
  fieldFatherName: "Father / Guardian Name",
  phFatherName: "e.g. Haji Meer Muhammad",
  fieldCaste: "Caste / Tribe (قومیت / قبیلہ)",
  phCaste: "e.g. Araain, Mian, Malik, Chaudhry",
  fieldGender: "Gender",
  fieldMale: "Male",
  fieldFemale: "Female",
  fieldOther: "Other",
  fieldMembershipType: "Membership Type",
  optGeneralMember: "General Member",
  optLifeMember: "Life Member",
  optYouthMember: "Youth Member",
  optAssociateMember: "Associate Member",
  optSeniorMember: "Senior Member",
  fieldCnic: "National Identity Card / B-Form",
  fieldDob: "Date of Birth",
  fieldEmail: "Email Address",
  fieldWhatsapp: "WhatsApp Number",
  fieldResidentialStatus: "Residential Status",
  optResident: "Resident (Pakistan)",
  optOverseas: "Overseas Pakistani",
  optForeign: "Foreign National",
  fieldAffiliated: "Affiliated Community Organisation",
  fieldEducation: "Highest Education",
  optMetric: "Matriculation / O-Level",
  optIntermediate: "Intermediate / A-Level",
  optBachelors: "Bachelor's Degree",
  optMasters: "Master's Degree",
  optDoctorate: "Doctorate (PhD)",
  optOther: "Other / Vocational",
  fieldWork: "Occupation / Profession",
  fieldReason: "Reason for Joining",
  fieldStreet: "Street Address",
  fieldCity: "City / District",
  fieldState: "Province / State",
  fieldCountry: "Country",
  fieldPhoto: "Profile Photograph",
  photoHint: "Upload a clear passport-style photo (max 2MB).",
  agreeTerms: "I declare that all information provided is accurate and I agree to abide by the constitution and code of ethics of ARAAIN BANNU.",
  btnSubmitApplication: "Submit Application",
  btnSubmitting: "Submitting...",
  submissionSuccessTitle: "Registration Submitted Successfully!",
  submissionSuccessDesc: "Thank you for registering. Your application has been recorded in the central database. Our executive council will review your details.",
  appRefId: "Application Reference ID",
  closeModal: "Close",

  // Donation Form & Modal
  donModalTitle: "Make a Donation",
  donModalSubtitle: "Support education, welfare, and community initiatives.",
  tabBankTransfer: "Bank Transfer",
  tabMobileWallets: "Mobile Wallets",
  tabInternational: "International Transfer",
  tabConfirmPayment: "Confirm Payment",
  selectAmount: "Select or Enter Amount (PKR)",
  customAmount: "Custom Amount",
  bankDetailsHeading: "Official Bank Account Details",
  fieldBankName: "Bank Name",
  fieldAccountTitle: "Account Title",
  fieldAccountNumber: "Account Number",
  fieldIBAN: "IBAN",
  fieldBranchCode: "Branch Code",
  mobileWalletsHeading: "Easypaisa & JazzCash",
  fieldEasypaisa: "Easypaisa Account",
  fieldJazzcash: "JazzCash Account",
  intDetailsHeading: "International Wire Transfer",
  fieldSwift: "SWIFT Code",
  confirmFormHeading: "Submit Payment Proof",
  confirmFormDesc: "After transferring funds, please provide your transaction reference so our accounts team can verify and issue an official receipt.",
  fieldDonorName: "Donor Name",
  fieldDonorPhone: "Phone / WhatsApp",
  fieldPaymentMethod: "Payment Method",
  optMeezanBank: "Bank Transfer (Meezan Bank)",
  optEasypaisa: "Easypaisa",
  optJazzcash: "JazzCash",
  optInternationalTransfer: "International Wire / SWIFT",
  fieldTxId: "Transaction / Reference ID",
  fieldDonationNote: "Note / Purpose (Optional)",
  fieldProofPhoto: "Upload Payment Screenshot / Slip",
  btnSubmitDonation: "Submit Confirmation",
  donationSuccessTitle: "Donation Recorded!",
  donationSuccessDesc: "Your contribution details have been received. We will verify and send your official confirmation.",

  // Contact
  contactHeading: "Get In Touch",
  contactSubheading: "Have questions about our initiatives or wish to visit our regional center? We welcome your message.",
  contactAddressTitle: "Our Office",
  contactHoursTitle: "Office Hours",
  contactPhoneTitle: "Helpline & WhatsApp",
  contactEmailTitle: "Official Email",
  formName: "Your Full Name",
  formEmail: "Email Address",
  formPhone: "Phone Number",
  formSubject: "Subject",
  formMessage: "Your Message",
  btnSendMessage: "Send Message",
  msgSentSuccess: "Your message has been sent successfully. We will get back to you shortly.",

  // Footer
  footerAboutTitle: "About ARAAIN BANNU",
  footerQuickLinks: "Quick Navigation",
  footerCommunityPages: "Information & Policies",
  footerContactTitle: "Regional Center",
  allRightsReserved: "All rights reserved.",

  // Admin
  adminDashboard: "Admin Management System",
  adminLoginTitle: "Administrator Sign In",
  adminLoginSub: "Access the central council database and content manager.",
  adminEmail: "Admin Email",
  adminPassword: "Password",
  btnLogin: "Sign In to Admin",
  btnLogout: "Sign Out",
  tabOverview: "Overview",
  tabRegistrations: "Membership Records",
  tabDonations: "Donation Records",
  tabMessages: "Contact Messages",
  tabCMS: "Content Manager",
  totalMembers: "Total Members",
  pendingReview: "Pending Review",
  totalFunds: "Total Donations",
  unverifiedDonations: "Unverified",
  exportCSV: "Export CSV",
  searchPlaceholder: "Search by name, identity card, phone, or city...",
  generateCard: "Generate ID Card",
  statusApproved: "Approved",
  statusPending: "Pending",
  statusRejected: "Rejected",
  statusVerified: "Verified",
  statusUnverified: "Unverified",
  actions: "Actions",
  viewDetails: "View Details",
  printCard: "Print Card",
  saveChanges: "Save Changes",
  syncWithCloud: "Sync with Cloud",
  cloudSynced: "Synced with Firebase",

  // Additional Bilingual UI Keys
  welfareFundTitle: "ARAAIN BANNU Welfare Fund",
  tabTransferDetails: "1. Transfer Details",
  tabConfirmPaymentStep: "2. Confirm Payment & Receipt",
  trackingIdLabel: "Confirmation Tracking ID",
  beneficiaryBank: "Beneficiary Bank",
  swiftBic: "SWIFT / BIC",
  fundsSentSubmitProof: "I Have Sent Funds — Submit Proof",
  recordedAmount: "Recorded Amount",
  changeScreenshot: "Change Screenshot",
  uploadScreenshot: "Upload Screenshot",
  screenshotHelp: "Helps our accounts department verify and acknowledge immediately.",
  phEnterCustomAmt: "Or enter custom amount in PKR...",
  phDonorName: "e.g. Asad Chaudhary",
  phDonorPhone: "+92 300 0000000",
  phTxnRef: "e.g. TXN-98765432",
  phDonationNote: "e.g. Education scholarship fund, Bannu medical camp",
  meezanBankTab: "Meezan Bank",
  mobileWalletsTab: "Easypaisa / JazzCash",
  swiftWireTab: "SWIFT Wire",
  copyBtn: "Copy",
  copiedBtn: "Copied",
  titleLabel: "Title",
  errDonorName: "Please enter donor name.",
  errPhone: "Please enter phone / WhatsApp number.",
  errScreenshot: "Could not load screenshot. Please retry.",
  errSubmitDonation: "Failed to submit payment verification.",
  contactFormTitle: "Send Direct Inquiry",
  contactFormDesc: "Our communications team responds promptly to all community members.",
  contactPhFullName: "e.g. Asad Chaudhary",
  contactPhFatherName: "e.g. Haji Meer Muhammad",
  phEmail: "you@domain.com",
  phSubject: "e.g. Volunteering, Scholarships inquiry",
  phMessage: "Please write your detailed message...",
  sendingBtn: "Sending...",
  changePhoto: "Change Photo",
  uploadPhoto: "Upload Photograph",
  phWork: "e.g. Teacher, Engineer, Businessman",
  phAffiliated: "e.g. Araain Youth Bannu / None",
  phReason: "Tell us how you would like to contribute or participate in welfare initiatives...",
  phStreet: "Mohallah / Street / House #",
  errAcceptTerms: "Please accept the declaration terms before submitting.",
  communityCardTitle: "COMMUNITY MEMBERSHIP CARD",
  cardCertifiesText: "This card certifies official affiliation with ARAAIN BANNU, committed to welfare, education, and collective progress.",
  memberIdentification: "MEMBER IDENTIFICATION",
  scanToVerify: "Scan to Verify",
  scanVerifyDesc: "Scan using any phone camera to verify official membership records.",
  cardAuthorityText: "Issued under the authority of Executive Council Bannu.",
  generatingCardText: "Generating secure membership card & cryptographic QR code...",
  btnPublicSite: "View Public Site",
};

export const UR: Record<string, string> = {
  // Brand & Identity
  siteName: "آرائیں بنوں",
  siteTagline: "اتحاد، خود مختاری، ترقی",
  siteSubName: "بنوں علاقائی تنظیم",
  siteSubTagline: "بنوں اور خیبر پختونخوا میں برادری کے رشتوں کو مضبوط بنانا",
  logoInitials: "آ ب",
  langToggleText: "انگریزی",
  cloudOnline: "کلاؤڈ آن لائن",
  cloudSyncing: "ہم آہنگی جاری ہے...",
  cloudOffline: "آف لائن موڈ",

  // Navigation
  navHome: "صفحہ اول",
  navAbout: "ہمارے متعلق",
  navPrograms: "پروگرامز",
  navLeadership: "قیادت",
  navEvents: "تقریبات",
  navGallery: "تصاویر گیلری",
  navContact: "رابطہ",
  navAdmin: "ایڈمن پورٹل",
  navApply: "رکنیت لیں",
  navDonate: "عطیہ دیں",

  // Hero
  heroBadge: "عالمی برادری کی تحریک",
  heroTitle: "آرائیں بنوں",
  heroSub: "نئی نسل کو بااختیار بنانا، اپنے ورثے پر فخر",
  heroTagline: "دنیا بھر میں آرائیں برادری کا اتحاد — طاقت، یکجہتی، ترقی۔ برادری کی فلاح، تعلیم اور ترقی کے ایک عظیم مشن کا حصہ بنیں۔",
  btnDiscover: "ہمارا مشن",
  btnEvents: "آئندہ تقریبات",
  btnBecomeMember: "رکن بنیں",

  // About
  aboutTag: "ہمارا تعارف",
  aboutTitle: "خدمت اور کمیونٹی پر مبنی ایک روشن وژن",
  aboutSubtitle: "دنیا بھر میں آرائیں برادری کی سماجی و معاشی ترقی کے لیے کوشاں۔",
  aboutP1: "آرائیں بنوں پاکستان اور بیرون ملک بسنے والے ہزاروں خاندانوں کی نمائندگی کرتی ہے، جو تعلیم، فلاح اور پائیدار ترقی کے مشترکہ عزم سے جڑے ہوئے ہیں۔",
  aboutP2: "اسٹریٹجک منصوبوں، تعلیمی وظائف، کمیونٹی سینٹرز اور نوجوانوں کی رہنمائی کے ذریعے ہم روایات اور جدید مواقع کے درمیان مضبوط پل تعمیر کر رہے ہیں۔",
  aboutP3: "بنوں میں ہماری علاقائی شاخ نچلی سطح پر فعال ہے، جو جنوبی خیبر پختونخوا کے خاندانوں کے لیے امداد، کیریئر رہنمائی اور باہمی اتحاد فراہم کرتی ہے۔",
  statMembers: "+۵۰۰",
  statMembersLabel: "فعال اراکین",
  statPrograms: "+۸",
  statProgramsLabel: "بنیادی پروگرامز",
  statCities: "+۳۰",
  statCitiesLabel: "منسلک شہر",
  chairmanTitle: "پیغام چیئرمین",
  chairmanName: "ڈاکٹر اعزاز چوہدری",
  chairmanRole: "گلوبل چیئرمین",
  chairmanQuote: "ہمارا اتحاد ہی ہماری سب سے بڑی طاقت ہے۔ جب ہم اپنے نوجوانوں کو بااختیار بناتے ہیں اور خاندانوں کو سہارا دیتے ہیں تو نسلوں کے لیے مضبوط بنیاد بنتی ہے۔",
  valueTransparent: "شفاف فلاحی بہبود",
  valueScholarships: "تعلیمی وظائف اور اسکالرشپس",
  valueBrotherhood: "عالمی برادری کا اتحاد",

  // Programs
  programsTitle: "اہم منصوبے اور فلاحی پروگرامز",
  programsDesc: "خاندانوں کی مدد، نوجوانوں کی تعلیم اور برادری کی فلاح کے لیے جامع منصوبے۔",
  btnLearnMore: "مزید جانیے",

  // Leadership
  leadershipTitle: "ہماری قیادت",
  leadershipDesc: "مخلص اور پرعزم قائدین جو اسٹریٹجک رہنمائی اور عالمی ہم آہنگی فراہم کر رہے ہیں۔",
  featuredBadge: "نمایاں",

  // Events
  eventsTitle: "تقریبات اور اعلانات",
  eventsDesc: "آئندہ سیمینارز، بزنس ورکشاپس اور سالانہ اجتماعات سے باخبر رہیں۔",
  eventLocation: "مقام",
  eventTime: "وقت",

  // Gallery
  galleryTitle: "کمیونٹی کی یادگار جھلکیاں",
  galleryDesc: "ہمارے سیمینارز، فلاحی سرگرمیوں، یوتھ سمٹس اور علاقائی اجتماعات کی تصویری جھلکیاں۔",

  // Call to Action
  ctaTitle: "ہمارے اس عظیم سفر کا حصہ بنیں",
  ctaDesc: "ایک فعال رکن کے طور پر شامل ہوں یا اپنے عطیات کے ذریعے فلاحی کاموں میں ہاتھ بٹائیں۔",
  membershipCardTitle: "سرکاری رکنیت حاصل کریں",
  membershipCardDesc: "آج ہی اندراج کروائیں، اپنا باضابطہ ممبرشپ شناختی کارڈ حاصل کریں اور برادری کے خصوصی پروگرامز میں شرکت کریں۔",
  donateCardTitle: "فلاحی منصوبوں میں حصہ لیں",
  donateCardDesc: "آپ کے عطیات براہ راست غریب طلبہ کے وظائف، مفت میڈیکل کیمپس اور ہنگامی امدادی سرگرمیوں میں خرچ ہوتے ہیں۔",
  btnApplyMembership: "رکنیت کے لیے درخواست دیں",
  btnDonateNow: "عطیہ کی معلومات دیکھیں",

  // Membership Form
  memFormTitle: "رکنیت فارم",
  memFormSubtitle: "آرائیں بنوں کی باضابطہ رکنیت حاصل کرنے کے لیے درج ذیل معلومات فراہم فرمائیں۔",
  memStep1: "ذاتی معلومات",
  memStep2: "رابطہ اور شناخت",
  memStep3: "پیشہ ورانہ پس منظر",
  memStep4: "پتہ اور تصویر",

  fieldFullName: "پورا نام",
  phFullName: "مثلاً: محمد طاہر",
  fieldFatherName: "والد / سرپرست کا نام",
  phFatherName: "مثلاً: حاجی میر محمد",
  fieldCaste: "قومیت / قبیلہ (Caste)",
  phCaste: "مثلاً: آرائیں، میاں، ملک، چوہدری وغیرہ",
  fieldGender: "جنس",
  fieldMale: "مرد",
  fieldFemale: "خاتون",
  fieldOther: "دیگر",
  fieldMembershipType: "رکنیت کی قسم",
  optGeneralMember: "عام رکن",
  optLifeMember: "تایحیات رکن",
  optYouthMember: "نوجوان رکن (یوتھ)",
  optAssociateMember: "ایسوسی ایٹ رکن",
  optSeniorMember: "سینئر رکن",
  fieldCnic: "قومی شناختی کارڈ نمبر / بی فارم",
  fieldDob: "تاریخ پیدائش",
  fieldEmail: "ای میل ایڈریس",
  fieldWhatsapp: "واٹس ایپ نمبر",
  fieldResidentialStatus: "رہائشی حیثیت",
  optResident: "پاکستانی شہری (مقیم پاکستان)",
  optOverseas: "اوورسیز پاکستانی",
  optForeign: "غیر ملکی شہری",
  fieldAffiliated: "منسلک تنظیم (اگر کوئی ہو)",
  fieldEducation: "تعلیمی قابلیت",
  optMetric: "میٹرک / او لیول",
  optIntermediate: "انٹرمیڈیٹ / ایف اے / ایف ایس سی",
  optBachelors: "بیچلر ڈگری (گریجویشن)",
  optMasters: "ماسٹرز ڈگری",
  optDoctorate: "ڈاکٹریٹ (پی ایچ ڈی)",
  optOther: "دیگر / فنی تعلیم",
  fieldWork: "پیشہ / ملازمت / کاروبار",
  fieldReason: "شمولیت کا مقصد",
  fieldStreet: "گھر کا پتہ / گلی محلہ",
  fieldCity: "شہر / ضلع",
  fieldState: "صوبہ",
  fieldCountry: "ملک",
  fieldPhoto: "پاسپورٹ سائز تصویر",
  photoHint: "ایک واضح اور صاف تصویر اپ لوڈ فرمائیں (زیادہ سے زیادہ ۲ ایم بی)۔",
  agreeTerms: "میں تصدیق کرتا/کرتی ہوں کہ فراہم کردہ تمام معلومات درست ہیں اور میں آرائیں بنوں کے آئین اور قواعد وضوابط کی پابندی کروں گا۔",
  btnSubmitApplication: "درخواست جمع کروائیں",
  btnSubmitting: "جمع ہو رہی ہے...",
  submissionSuccessTitle: "درخواست کامیابی سے موصول ہو گئی!",
  submissionSuccessDesc: "رجسٹریشن کے لیے شکریہ۔ آپ کی درخواست کا اندراج سنٹرل ڈیٹا بیس میں ہو گیا ہے۔ منظوری کے بعد آپ کو باضابطہ کارڈ جاری کیا جائے گا۔",
  appRefId: "درخواست کا حوالہ نمبر",
  closeModal: "بند کریں",

  // Donation Form & Modal
  donModalTitle: "عطیہ / فنڈنگ جمع کروائیں",
  donModalSubtitle: "تعلیم، فلاحی کاموں اور کمیونٹی منصوبوں میں حصہ ڈالیں۔",
  tabBankTransfer: "بینک ٹرانسفر",
  tabMobileWallets: "موبائل والٹس (ایزی پیسہ / جاز کیش)",
  tabInternational: "بین الاقوامی ترسیل (سوئفٹ)",
  tabConfirmPayment: "ادائیگی کی تصدیق",
  selectAmount: "رقم منتخب یا درج کریں (پاکستانی روپے)",
  customAmount: "دیگر رقم",
  bankDetailsHeading: "سرکاری بینک اکاؤنٹ کی تفصیلات",
  fieldBankName: "بینک کا نام",
  fieldAccountTitle: "اکاؤنٹ کا عنوان",
  fieldAccountNumber: "اکاؤنٹ نمبر",
  fieldIBAN: "بین الاقوامی بینک اکاؤنٹ نمبر (آئی بی اے این)",
  fieldBranchCode: "برانچ کوڈ",
  mobileWalletsHeading: "ایزی پیسہ اور جاز کیش اکاؤنٹس",
  fieldEasypaisa: "ایزی پیسہ اکاؤنٹ",
  fieldJazzcash: "جاز کیش اکاؤنٹ",
  intDetailsHeading: "بین الاقوامی بینک ترسیل",
  fieldSwift: "سوئفٹ کوڈ",
  confirmFormHeading: "ادائیگی کا ثبوت جمع کروائیں",
  confirmFormDesc: "بینک یا موبائل اکاؤنٹ میں رقم بھیجنے کے بعد ٹرانزیکشن کی تفصیلات اور رسید کی تصویر یہاں اپ لوڈ فرمائیں۔",
  fieldDonorName: "عطیہ دہندہ کا نام",
  fieldDonorPhone: "فون / واٹس ایپ نمبر",
  fieldPaymentMethod: "ادائیگی کا طریقہ",
  optMeezanBank: "بینک ٹرانسفر (میزان بینک)",
  optEasypaisa: "ایزی پیسہ",
  optJazzcash: "جاز کیش",
  optInternationalTransfer: "بین الاقوامی ٹرانسفر",
  fieldTxId: "ٹرانزیکشن آئی ڈی / رسید نمبر",
  fieldDonationNote: "وضاحت یا نیت (اختیاری)",
  fieldProofPhoto: "رسید یا اسکرین شاٹ اپ لوڈ کریں",
  btnSubmitDonation: "تصدیق جمع کروائیں",
  donationSuccessTitle: "عطیہ کا اندراج ہو گیا!",
  donationSuccessDesc: "جزاک اللہ خیر! آپ کی تفصیلات کامیابی سے درج کر لی گئی ہیں۔ ہمارے فنانس ڈیپارٹمنٹ کی توثیق کے بعد آپ کو تصدیق موصول ہو جائے گی۔",

  // Contact
  contactHeading: "ہم سے رابطہ کریں",
  contactSubheading: "کیا آپ ہمارے منصوبوں میں شامل ہونا چاہتے ہیں یا دفتر تشریف لانا چاہتے ہیں؟ ہمیں ضرور آگاہ فرمائیں۔",
  contactAddressTitle: "مرکزی دفتر کا پتہ",
  contactHoursTitle: "اوقات کار",
  contactPhoneTitle: "ہیلپ لائن اور واٹس ایپ",
  contactEmailTitle: "سرکاری ای میل",
  formName: "آپ کا پورا نام",
  formEmail: "ای میل پتہ",
  formPhone: "فون نمبر",
  formSubject: "موضوع",
  formMessage: "آپ کا پیغام",
  btnSendMessage: "پیغام ارسال کریں",
  msgSentSuccess: "آپ کا پیغام کامیابی کے ساتھ موصول ہو چکا ہے۔ ہم جلد آپ سے رابطہ کریں گے۔",

  // Footer
  footerAboutTitle: "آرائیں بنوں کے بارے میں",
  footerQuickLinks: "فوری روابط",
  footerCommunityPages: "معلومات اور دستاویزات",
  footerContactTitle: "علاقائی مرکز",
  allRightsReserved: "تمام حقوق محفوظ ہیں۔",

  // Admin
  adminDashboard: "ایڈمن مینجمنٹ سسٹم",
  adminLoginTitle: "ایڈمنسٹریٹر لاگ ان",
  adminLoginSub: "سینٹرل کونسل ڈیٹا بیس اور مواد کے نظم کے لیے لاگ ان فرمائیں۔",
  adminEmail: "ایڈمن ای میل",
  adminPassword: "پاس ورڈ",
  btnLogin: "لاگ ان کریں",
  btnLogout: "لاگ آؤٹ",
  tabOverview: "جائزہ",
  tabRegistrations: "رکنیت کی درخواستیں",
  tabDonations: "عطیات کا ریکارڈ",
  tabMessages: "موصولہ پیغامات",
  tabCMS: "ویب سائٹ کا مواد",
  totalMembers: "کل اراکین",
  pendingReview: "زیر غور",
  totalFunds: "کل عطیات",
  unverifiedDonations: "غیر تصدیق شدہ",
  exportCSV: "سی ایس وی ڈاؤن لوڈ",
  searchPlaceholder: "نام، شناختی کارڈ، فون یا شہر سے تلاش کریں...",
  generateCard: "شناختی کارڈ بنائیں",
  statusApproved: "منظور شدہ",
  statusPending: "زیر غور",
  statusRejected: "مسترد",
  statusVerified: "تصدیق شدہ",
  statusUnverified: "غیر تصدیق شدہ",
  actions: "اعمال",
  viewDetails: "تفصیلات دیکھیں",
  printCard: "کارڈ پرنٹ کریں",
  saveChanges: "تبدیلیاں محفوظ کریں",
  syncWithCloud: "کلاؤڈ سے ہم آہنگ کریں",
  cloudSynced: "فائر بیس سے منسلک",

  // Additional Bilingual UI Keys
  welfareFundTitle: "آرائیں بنوں ویلفیئر فنڈ",
  tabTransferDetails: "1. منتقلی کی تفصیلات",
  tabConfirmPaymentStep: "2. ادائیگی اور رسید کی تصدیق",
  trackingIdLabel: "تصدیقی ٹریکنگ کوڈ",
  beneficiaryBank: "بینک کا نام",
  swiftBic: "سوئفٹ کوڈ",
  fundsSentSubmitProof: "میں نے رقم بھیج دی ہے — رسید ارسال کریں",
  recordedAmount: "درج شدہ رقم",
  changeScreenshot: "تصویر تبدیل کریں",
  uploadScreenshot: "رسید کی تصویر اپلوڈ کریں",
  screenshotHelp: "اس سے ہمارا شعبہ حسابات فوری تصدیق کر سکتا ہے۔",
  phEnterCustomAmt: "یا اپنی مرضی کی رقم درج کریں...",
  phDonorName: "مثلاً اسد چوہدری",
  phDonorPhone: "+92 300 0000000",
  phTxnRef: "مثلاً TXN-98765432",
  phDonationNote: "مثلاً تعلیمی اسکالرشپ یا طبی کیمپ فنڈ",
  meezanBankTab: "میزان بینک",
  mobileWalletsTab: "ایزی پیسہ / جاز کیش",
  swiftWireTab: "سوئفٹ وائر",
  copyBtn: "کاپی کریں",
  copiedBtn: "کاپی ہو گیا",
  titleLabel: "عنوان",
  errDonorName: "براہ کرم عطیہ دہندہ کا نام درج فرمائیں۔",
  errPhone: "براہ کرم فون یا واٹس ایپ نمبر درج فرمائیں۔",
  errScreenshot: "تصویر لوڈ نہ ہو سکی، براہ کرم دوبارہ کوشش کریں۔",
  errSubmitDonation: "ادائیگی کی تصدیق جمع کروانے میں ناکامی ہوئی۔",
  contactFormTitle: "براہ راست رابطہ فرمائیں",
  contactFormDesc: "ہماری رابطہ ٹیم تمام برادری ممبران کو فوری جواب دیتی ہے۔",
  contactPhFullName: "مثلاً اسد چوہدری",
  contactPhFatherName: "مثلاً حاجی میر محمد",
  phEmail: "you@domain.com",
  phSubject: "مثلاً رضاکارانہ خدمات یا تعلیمی وظائف",
  phMessage: "براہ کرم اپنا تفصیلی پیغام تحریر فرمائیں...",
  sendingBtn: "ارسال ہو رہا ہے...",
  changePhoto: "تصویر تبدیل کریں",
  uploadPhoto: "تصویر اپلوڈ کریں",
  phWork: "مثلاً استاد، انجینئر، تاجر",
  phAffiliated: "مثلاً آرائیں یوتھ بنوں یا کوئی نہیں",
  phReason: "ہمیں بتائیں کہ آپ فلاحی کاموں میں کس طرح حصہ لینا چاہتے ہیں...",
  phStreet: "محلہ / گلی / مکان نمبر",
  errAcceptTerms: "براہ کرم جمع کروانے سے پہلے شرائط کی توثیق فرمائیں۔",
  communityCardTitle: "برادری ممبرشپ شناختی کارڈ",
  cardCertifiesText: "یہ کارڈ آرائیں بنوں کے ساتھ باضابطہ وابستگی کی تصدیق کرتا ہے جو فلاح، تعلیم اور باہمی ترقی کے لیے کوشاں ہے۔",
  memberIdentification: "رکن کی باضابطہ شناخت",
  scanToVerify: "تصدیق کے لیے اسکین کریں",
  scanVerifyDesc: "سرکاری ممبرشپ ریکارڈ کی تصدیق کے لیے کیمرے سے اسکین کریں۔",
  cardAuthorityText: "یہ کارڈ ایگزیکٹو کونسل بنوں کے مجاز اختیار سے جاری کیا گیا ہے۔",
  generatingCardText: "محفوظ ممبرشپ کارڈ اور کیو آر کوڈ تیار کیا جا رہا ہے...",
  btnPublicSite: "ویب سائٹ دیکھیں",
};

// ── Complete Bilingual Settings Models ──────────────────────────

export const LOCALIZED_SETTINGS: Record<Language, SiteSettings> = {
  en: {
    siteName: "ARAAIN BANNU",
    siteTagline: "Unity, Empowerment, Development",
    siteSubName: "Bannu Regional Organisation",
    siteSubTagline: "Strengthening community bonds across Bannu & KPK",
    logoData: "",

    heroBadge: "Global Community Movement",
    heroTitle: "ARAAIN BANNU",
    heroSub: "Empowering Our Next Generation, Proud Of Our Heritage",
    heroTagline: "Uniting the Araain Community Worldwide — Strength, Unity, Progress. Join a legacy of community development, education, and welfare.",
    heroImage: "",

    aboutTitle: "ARAAIN BANNU",
    aboutSubtitle: "Dedicated to the socio-economic advancement of the Araain community worldwide.",
    aboutP1: "The ARAAIN BANNU represents thousands of families across Pakistan and the diaspora, driven by a shared commitment to education, welfare, and sustainable development.",
    aboutP2: "Through strategic initiatives, scholarship programs, community centers, and youth engagement, we build bridges between tradition and modern opportunity.",
    aboutP3: "Our regional chapter in Bannu works actively at the grassroots level, providing relief, career mentorship, and community cohesion for families across Southern Khyber Pakhtunkhwa.",
    statMembers: "500+",
    statPrograms: "8+",
    statCities: "30+",
    chairmanName: "Maulana Muhammad Tahir Khan",
    chairmanPosition: "Global Chairman",
    chairmanQuote: "Our unity is our greatest strength. When we empower our youth and support our families, we build a foundation that endures for generations.",

    programsTitle: "Key Initiatives & Programs",
    programsDesc: "Targeted programs designed to uplift families, educate youth, and preserve community welfare.",
    leadershipTitle: "Our Leadership Team",
    membershipTitle: "Membership Registration",
    membershipDesc: "Join ARAAIN BANNU to connect with our global network, participate in community initiatives, and make a difference.",
    donateTitle: "Support Our Mission",
    donateDesc: "Your generous contributions help fund scholarships, healthcare camps, flood relief, and community welfare programs.",
    eventsTitle: "Upcoming Events & Programs",
    galleryTitle: "Community Moments",
    galleryDesc: "A visual journey through our community events, gatherings, and welfare drives.",

    contactAddress: "ARAAIN BANNU Office, Main City, Bannu, Khyber Pakhtunkhwa, Pakistan",
    contactHours: "Monday – Saturday: 09:00 AM – 05:00 PM (PKT)",
    contactPhone: "03369948409",
    contactEmail: "3tahirmeer@gmail.com",

    socialFacebook: "https://facebook.com",
    socialTwitter: "https://x.com",
    socialWhatsapp: "https://wa.me/923369948409",
    socialInstagram: "https://instagram.com",

    footerDesc: "ARAAIN BANNU is committed to empowering the Araain community across Bannu, Khyber Pakhtunkhwa, and globally through education, economic empowerment, and humanitarian welfare.",
    footerCopy: "© 2025 ARAAIN BANNU. All rights reserved.",

    bankName: "Meezan Bank Limited",
    bankTitle: "ARAAIN BANNU Welfare Fund",
    bankAccount: "",
    bankIBAN: "",
    bankBranch: "Bannu Branch",
    epTitle: "Tahir Meer (Finance Secretary)",
    epNumber: "03369948409",
    jcTitle: "ARAAIN BANNU Welfare",
    jcNumber: "03369948409",
    intBank: "Meezan Bank Limited, Bannu",
    intSwift: "",
    intIBAN: "",
    announcementBadge: "Official Announcement",
    announcementText: "Araain Bannu Membership Drive is live. Register now to receive your official digital ID card.",
    customNoticeHeadline: "Special Education and Welfare Package for Bannu and Southern Districts has been formally launched.",
  },
  ur: {
    siteName: "آرائیں بنوں",
    siteTagline: "اتحاد، خود مختاری، ترقی",
    siteSubName: "بنوں علاقائی تنظیم",
    siteSubTagline: "بنوں اور خیبر پختونخوا میں برادری کے رشتوں کو مضبوط بنانا",
    logoData: "",

    heroBadge: "عالمی برادری کی تحریک",
    heroTitle: "آرائیں بنوں",
    heroSub: "نئی نسل کو بااختیار بنانا، اپنے ورثے پر فخر",
    heroTagline: "دنیا بھر میں آرائیں برادری کا اتحاد — طاقت، یکجہتی، ترقی۔ برادری کی فلاح، تعلیم اور ترقی کے ایک عظیم مشن کا حصہ بنیں۔",
    heroImage: "",

    aboutTitle: "آرائیں بنوں",
    aboutSubtitle: "دنیا بھر میں آرائیں برادری کی سماجی و معاشی ترقی کے لیے کوشاں۔",
    aboutP1: "آرائیں بنوں پاکستان اور بیرون ملک بسنے والے ہزاروں خاندانوں کی نمائندگی کرتی ہے، جو تعلیم، فلاح اور پائیدار ترقی کے مشترکہ عزم سے جڑے ہوئے ہیں۔",
    aboutP2: "اسٹریٹجک منصوبوں، تعلیمی وظائف، کمیونٹی سینٹرز اور نوجوانوں کی رہنمائی کے ذریعے ہم روایات اور جدید مواقع کے درمیان مضبوط پل تعمیر کر رہے ہیں۔",
    aboutP3: "بنوں میں ہماری علاقائی شاخ نچلی سطح پر فعال ہے، جو جنوبی خیبر پختونخوا کے خاندانوں کے لیے امداد، کیریئر رہنمائی اور باہمی اتحاد فراہم کرتی ہے۔",
    statMembers: "50",
    statPrograms: "8",
    statCities: "30+",
    chairmanName: "مولانا محمد طاہر خان",
    chairmanPosition: "گلوبل چیئرمین",
    chairmanQuote: "ہمارا اتحاد ہماری سب سے بڑی طاقت ہے۔ جب ہم اپنے نوجوانوں کو بااختیار بناتے ہیں اور اپنے خاندانوں کی مدد کرتے ہیں، تو ہم ایک ایسی بنیاد بناتے ہیں جو نسلوں تک قائم رہتی ہے۔",

    programsTitle: "اہم منصوبے اور فلاحی پروگرامز",
    programsDesc: "خاندانوں کی مدد، نوجوانوں کی تعلیم اور برادری کی فلاح کے لیے جامع منصوبے۔",
    leadershipTitle: "ہماری قیادت",
    membershipTitle: "رکنیت کا باضابطہ اندراج",
    membershipDesc: "آرائیں بنوں کا حصہ بنیں اور برادری کی فلاح و بہبود کے منصوبوں میں اپنا کردار ادا کریں۔",
    donateTitle: "فلاحی منصوبوں کے لیے عطیات",
    donateDesc: "آپ کے عطیات مستحق طلبہ کے وظائف، مفت طبی کیمپس اور ہنگامی امداد میں خرچ ہوتے ہیں۔",
    eventsTitle: "تقریبات اور اعلانات",
    galleryTitle: "کمیونٹی کی یادگار جھلکیاں",
    galleryDesc: "ہمارے سیمینارز، فلاحی سرگرمیوں، یوتھ سمٹس اور علاقائی اجتماعات کی تصویری جھلکیاں۔",

    contactAddress: "دفتر آرائیں بنوں، مین سٹی، بنوں، خیبر پختونخوا، پاکستان",
    contactHours: "پیر تا ہفتہ: صبح نو بجے تا شام پانچ بجے",
    contactPhone: "03369948409",
    contactEmail: "3tahirmeer@gmail.com",

    socialFacebook: "https://facebook.com",
    socialTwitter: "https://x.com",
    socialWhatsapp: "https://wa.me/923369948409",
    socialInstagram: "https://instagram.com",

    footerDesc: "آرائیں بنوں تعلیم، معاشی خود مختاری اور انسانی فلاح کے ذریعے بنوں، خیبر پختونخوا اور دنیا بھر میں برادری کو بااختیار بنانے کے لیے کوشاں ہے۔",
    footerCopy: "© 2025 آرائیں بنوں۔ تمام حقوق محفوظ ہیں۔",

    bankName: "میزان بینک لمیٹڈ",
    bankTitle: "آرائیں بنوں ویلفیئر فنڈ",
    bankAccount: "",
    bankIBAN: "",
    bankBranch: "بنوں برانچ",
    epTitle: "طاہر میر (فنانس سیکرٹری)",
    epNumber: "03369948409",
    jcTitle: "آرائیں بنوں ویلفیئر",
    jcNumber: "03369948409",
    intBank: "میزان بینک لمیٹڈ، بنوں",
    intSwift: "",
    intIBAN: "",
    announcementBadge: "اہم اعلان",
    announcementText: "آرائیں بنوں کی باضابطہ ممبرشپ مہم جاری ہے۔ ابھی اندراج کروائیں اور اپنا ڈیجیٹل رکنیت کارڈ حاصل کریں۔",
    customNoticeHeadline: "بنوں اور جنوبی اضلاع کے لیے خصوصی تعلیمی و فلاحی پیکج کا باقاعدہ آغاز کر دیا گیا ہے۔",
  }
};

// ── Complete Bilingual Programs ─────────────────────────────────

export const LOCALIZED_PROGRAMS: Record<Language, Program[]> = {
  en: [
    { id: 1, icon_name: "heart", color: "#AD7A28", title: "Community Welfare", desc: "Financial aid, healthcare support, and emergency relief for needy families.", sort_order: 0 },
    { id: 2, icon_name: "briefcase", color: "#16232F", title: "Jobs & Careers", desc: "Employment board, professional mentorship, career counseling, and networking.", sort_order: 1 },
    { id: 3, icon_name: "graduation-cap", color: "#AD7A28", title: "Education Institutes", desc: "Scholarships for deserving students, school drives, and free digital literacy.", sort_order: 2 },
    { id: 4, icon_name: "trophy", color: "#16232F", title: "Araain Heroes", desc: "Recognising high achievers, scholars, civil servants, and community champions.", sort_order: 3 },
    { id: 5, icon_name: "shield", color: "#AD7A28", title: "Flood Relief", desc: "Emergency rescue, dry ration kits, and rehabilitation in disaster-struck zones.", sort_order: 4 },
    { id: 6, icon_name: "users", color: "#16232F", title: "Marriage Bureau", desc: "A trusted, respectful matrimonial matching service for Araain families globally.", sort_order: 5 },
    { id: 7, icon_name: "building", color: "#AD7A28", title: "Community Centers", desc: "Establishing physical spaces for community gatherings, youth activities, and study halls.", sort_order: 6 },
    { id: 8, icon_name: "award", color: "#16232F", title: "Women's Desk", desc: "Skills development, entrepreneurship grants, and legal aid for women.", sort_order: 7 },
  ],
  ur: [
    { id: 1, icon_name: "heart", color: "#AD7A28", title: "فلاحی بہبود", desc: "مستحق خاندانوں کے لیے مالی معاونت، صحت کی سہولیات اور ہنگامی امداد۔", sort_order: 0 },
    { id: 2, icon_name: "briefcase", color: "#16232F", title: "روزگار اور کیریئر", desc: "ملازمتوں کی فراہمی، پیشہ ورانہ رہنمائی اور نوجوانوں کے لیے کیریئر کونسلنگ۔", sort_order: 1 },
    { id: 3, icon_name: "graduation-cap", color: "#AD7A28", title: "تعلیمی ادارے", desc: "ہونہار اور مستحق طلبہ کے لیے تعلیمی وظائف، مفت ڈیجیٹل خواندگی اور کتب کی فراہمی۔", sort_order: 2 },
    { id: 4, icon_name: "trophy", color: "#16232F", title: "برادری کے ہیروز", desc: "نمایاں کارکردگی دکھانے والے اسکالرز، طلبہ، سول سرونٹس اور سماجی رہنماؤں کی حوصلہ افزائی۔", sort_order: 3 },
    { id: 5, icon_name: "shield", color: "#AD7A28", title: "سیلاب اور ہنگامی امداد", desc: "قدرتی آفات اور ہنگامی حالات میں ریسکیو، راشن کٹس اور بحالی کے کام۔", sort_order: 4 },
    { id: 6, icon_name: "users", color: "#16232F", title: "رشتہ ناطہ سروس", desc: "آرائیں خاندانوں کے لیے مکمل رازداری کے ساتھ ایک بااعتماد اور باوقار رشتہ داری سروس۔", sort_order: 5 },
    { id: 7, icon_name: "building", color: "#AD7A28", title: "کمیونٹی سینٹرز", desc: "برادری کے باہمی میل جول، تقریبات اور تعلیمی سیمینارز کے لیے مراکز کا قیام۔", sort_order: 6 },
    { id: 8, icon_name: "award", color: "#16232F", title: "خواتین ڈیسک", desc: "خواتین کی خود مختاری، ہنر مندی کی تربیت، گھریلو صنعت کے لیے گرانٹس اور رہنمائی۔", sort_order: 7 },
  ]
};

// ── Complete Bilingual Leaders (Defaults empty, sourced strictly from Firestore) ────

export const LOCALIZED_LEADERS: Record<Language, Leader[]> = {
  en: [],
  ur: []
};

// ── Complete Bilingual Events (Defaults empty, sourced strictly from Firestore) ──────

export const LOCALIZED_EVENTS: Record<Language, EventItem[]> = {
  en: [
    {
      id: 1,
      day: '15',
      month: 'OCT',
      title: 'Strategically Build Your Business',
      place: 'Community Hall, Bannu',
      time_str: '10:00 AM - 01:00 PM',
      tag: 'Business'
    },
    {
      id: 2,
      day: '22',
      month: 'NOV',
      title: 'ARAAIN BANNU Annual Gathering 2025',
      place: 'Main Hall, Bannu',
      time_str: '11:00 AM - 04:00 PM',
      tag: 'Community'
    },
    {
      id: 3,
      day: '10',
      month: 'DEC',
      title: 'Youth Leadership Summit 2025',
      place: 'Bannu Sports Complex',
      time_str: '02:00 PM - 06:00 PM',
      tag: 'Youth'
    }
  ],
  ur: [
    {
      id: 1,
      day: '15',
      month: 'اکتوبر',
      title: 'اپنے کاروبار کو حکمت عملی کے ساتھ استوار کریں',
      place: 'کمیونٹی ہال، بنوں',
      time_str: 'صبح 10:00 تا دوپہر 01:00',
      tag: 'کاروبار'
    },
    {
      id: 2,
      day: '22',
      month: 'نومبر',
      title: 'آرائیں بنوں سالانہ اجتماع 2025',
      place: 'مین ہال، بنوں',
      time_str: 'صبح 11:00 تا شام 04:00',
      tag: 'برادری'
    },
    {
      id: 3,
      day: '10',
      month: 'دسمبر',
      title: 'یوتھ لیڈرشپ سمٹ 2025',
      place: 'بنوں اسپورٹس کمپلیکس',
      time_str: 'دوپہر 02:00 تا شام 06:00',
      tag: 'نوجوان'
    }
  ]
};

// ── Complete Bilingual Dynamic Pages (Defaults empty, sourced strictly from Firestore) ───

export const LOCALIZED_PAGES: Record<Language, PageItem[]> = {
  en: [
    {
      id: 'page_blog',
      slug: 'blog',
      title: 'ARAAIN BANNU Blog & News',
      label: 'Our Blog',
      body: 'Welcome to the ARAAIN BANNU Blog. Stay updated with the latest news, stories, and announcements from the ARAAIN BANNU community. Here you will find updates on welfare drives, educational milestones, executive council decisions, and upcoming events across Bannu and beyond.'
    },
    {
      id: 'page_history',
      slug: 'history',
      title: 'History of the Araain Community & Council',
      label: 'Our History',
      body: 'The ARAAIN BANNU was founded with a vision to unite Araains globally. From humble beginnings, ARAAIN BANNU has grown into a vibrant organization dedicated to the socio-economic advancement of our people, rooted in shared history, agricultural excellence, and community solidarity.'
    },
    {
      id: 'page_docs',
      slug: 'docs',
      title: 'Official Documents & Bylaws',
      label: 'Documentation',
      body: 'Official documents, policies, and guidelines of the ARAAIN BANNU. All resources are available for members and the public to ensure absolute transparency, democratic governance, and accountable administration.'
    },
    {
      id: 'page_green',
      slug: 'green',
      title: 'Environmental & Green Initiatives',
      label: 'Environmental',
      body: 'ARAAIN BANNU is deeply committed to environmental sustainability and climate resilience in Southern KPK. Drawing inspiration from our agrarian heritage, we lead tree plantation campaigns, promote clean water conservation, and educate youth on ecological responsibility.'
    },
    {
      id: 'page_gallery',
      slug: 'gallery',
      title: 'Bannu Community Gallery',
      label: 'Town Gallery',
      body: 'Explore photographic archives from ARAAIN BANNU community gatherings, medical camps, Eid gift distributions, and student award ceremonies across Southern Khyber Pakhtunkhwa.'
    },
    {
      id: 'page_departments',
      slug: 'departments',
      title: 'Functional Departments & Wings',
      label: 'Department',
      body: 'ARAAIN BANNU operates through several specialized departments, each led by experienced professionals: Education & Scholarships, Health & Medical Relief, Youth Leadership & Sports, and Community Welfare & Matrimonial Services.'
    }
  ],
  ur: [
    {
      id: 'page_blog',
      slug: 'blog',
      title: 'آرائیں بنوں بلاگ اور خبریں',
      label: 'ہمارا بلاگ',
      body: 'آرائیں بنوں کے آفیشل بلاگ میں خوش آمدید۔ برادری کی تازہ ترین خبروں، فلاحی سرگرمیوں اور اعلانات سے باخبر رہیں۔ یہاں آپ کو بنوں اور دیگر علاقوں میں فلاحی مہمات، تعلیمی کامیابیوں، انتظامی فیصلوں اور آئندہ تقریبات سے متعلق معلومات حاصل ہوں گی۔'
    },
    {
      id: 'page_history',
      slug: 'history',
      title: 'آرائیں برادری اور تنظیم کی تاریخ',
      label: 'ہماری تاریخ',
      body: 'آرائیں بنوں کی بنیاد دنیا بھر میں آرائیں برادری کو باہم متحد کرنے کے وژن کے تحت رکھی گئی۔ ایک باوقار آغاز سے اب یہ ایک فعال تنظیم بن چکی ہے جو باہمی تاریخ، زرعی مہارت اور سماجی یکجہتی کے تحت ہمارے افراد کی فلاح و بہبود کے لیے وقف ہے۔'
    },
    {
      id: 'page_docs',
      slug: 'docs',
      title: 'سرکاری دستاویزات اور آئین',
      label: 'دستاویزات',
      body: 'آرائیں بنوں کے سرکاری دستاویزات، آئین، قواعد و ضوابط اور انتظامی رہنما اصول۔ مکمل شفافیت، جمہوری طریقہ کار اور جوابدہ نظام کو یقینی بنانے کے لیے تمام مواد اراکین اور عوام کے لیے دستیاب ہے۔'
    },
    {
      id: 'page_green',
      slug: 'green',
      title: 'ماحولیاتی اور شجرکاری مہمات',
      label: 'ماحولیات',
      body: 'آرائیں بنوں جنوبی خیبر پختونخوا میں ماحولیاتی پائیداری اور تحفظ ماحول کے لیے پرعزم ہے۔ اپنے زرعی ورثے سے رہنمائی لیتے ہوئے ہم شجرکاری مہمات، صاف پانی کی حفاظت اور نوجوانوں میں ماحولیاتی شعور بیدار کرنے کے لیے کوشاں ہیں۔'
    },
    {
      id: 'page_gallery',
      slug: 'gallery',
      title: 'بنوں کمیونٹی تصویری گیلری',
      label: 'شہری گیلری',
      body: 'جنوبی خیبر پختونخوا میں آرائیں بنوں کے اجتماعات، مفت طبی کیمپس، عید کے تحائف کی تقسیم اور طلبہ کے اعزاز میں منعقدہ تقاریب کے تصویری ریکارڈز اور یادگار جھلکیاں دیکھیں۔'
    },
    {
      id: 'page_departments',
      slug: 'departments',
      title: 'شعبہ جات اور انتظامی ونگز',
      label: 'شعبہ جات',
      body: 'آرائیں بنوں کئی مخصوص شعبہ جات کے ذریعے کام کرتی ہے جن کی سربراہی تجربہ کار اراکین کرتے ہیں: تعلیمی و اسکالرشپ شعبہ، صحت و طبی امداد، یوتھ لیڈرشپ و اسپورٹس، اور سماجی بہبود و رشتہ ناطہ سروس۔'
    }
  ]
};

// ── Smart Script Detection Helpers ──────────────────────────────

const URDU_REGEX = /[\u0600-\u06FF]/;
const ENGLISH_REGEX = /[a-zA-Z]/;

/**
 * Returns true if the string is primarily in Urdu/Arabic script
 */
export function isUrduScript(str?: string): boolean {
  if (!str) return false;
  return URDU_REGEX.test(str);
}

/**
 * Returns true if the string is primarily in Latin/English script
 */
export function isEnglishScript(str?: string): boolean {
  if (!str) return false;
  return ENGLISH_REGEX.test(str);
}

/**
 * Resolves a settings value strictly respecting the current language:
 * In 'ur' mode: returns pure Urdu (translations applied if entered in English)
 * In 'en' mode: returns pure English (translations applied if entered in Urdu)
 */
export function getLocalizedSetting(
  field: keyof SiteSettings,
  lang: Language,
  customSettings?: SiteSettings
): string {
  let customVal = customSettings ? (customSettings[field] as string) : '';
  const fallbackUr = (LOCALIZED_SETTINGS.ur[field] as string) || '';
  const fallbackEn = (LOCALIZED_SETTINGS.en[field] as string) || '';
  const fallback = lang === 'ur' ? fallbackUr : fallbackEn;

  // Technical fields or digits formats stay in standard English format
  const isTechnical = [
    'contactPhone', 'contactEmail', 'socialWhatsapp', 'socialFacebook', 'socialTwitter',
    'socialInstagram', 'bankAccount', 'bankIBAN', 'epNumber', 'jcNumber', 'intSwift',
    'intIBAN', 'logoData', 'statMembers', 'statPrograms', 'statCities'
  ].includes(field as string);

  if (isTechnical) {
    return customVal || fallback;
  }

  if (!customVal || !customVal.trim()) {
    return fallback;
  }

  // If corrupted transliteration detected, clean it or use catalog fallback
  if (isCorruptedTransliteration(customVal)) {
    const cleaned = cleanCorruptedUrdu(customVal);
    if (!isCorruptedTransliteration(cleaned)) {
      customVal = cleaned;
    } else {
      return fallback;
    }
  }

  // Check if customVal matches the default English setting
  const normCustom = customVal.trim().toLowerCase().replace(/[.۔!?,;\s]+$/, '');
  const normEn = fallbackEn.trim().toLowerCase().replace(/[.۔!?,;\s]+$/, '');
  if (normEn && normCustom === normEn) {
    return fallback;
  }

  // Check if customVal matches the default Urdu setting (with madda tolerance)
  const normUr = fallbackUr.trim().replace(/[.۔!?,;\s]+$/, '');
  const normCustomUr = customVal.trim().replace(/[.۔!?,;\s]+$/, '');
  if (normUr && (normCustomUr === normUr || normCustomUr.replace(/آ/g, 'ا') === normUr.replace(/آ/g, 'ا'))) {
    return fallback;
  }

  if (lang === 'ur') {
    if (isUrduText(customVal)) {
      return customVal;
    }
    // Admin or user entered in English -> translate to Urdu.
    // Prefer a real, cached machine translation if one has already resolved;
    // otherwise return the dictionary's best-effort guess immediately and
    // kick off a proper translation in the background for next render.
    const cachedUr = getCachedTranslation(customVal, 'ur', 'en');
    if (cachedUr) return cachedUr;
    const dictGuessUr = translateEnglishToUrdu(customVal);
    warmAzureTranslation(customVal, 'ur', 'en');
    return dictGuessUr;
  } else {
    // English mode:
    if (!isUrduText(customVal)) {
      return customVal;
    }
    // Admin entered in Urdu -> translate accurately to English.
    const cachedEn = getCachedTranslation(customVal, 'en', 'ur');
    if (cachedEn) return cachedEn;
    const dictGuessEn = translateUrduToEnglish(customVal);
    warmAzureTranslation(customVal, 'en', 'ur');
    return dictGuessEn;
  }
}

/**
 * Resolves programs array respecting the active language and reflecting Firestore data
 */
export function getLocalizedPrograms(lang: Language, customPrograms: Program[]): Program[] {
  const sourceList = customPrograms && customPrograms.length > 0 ? customPrograms : LOCALIZED_PROGRAMS[lang];
  return sourceList.map((item, idx) => {
    const catalogUr = LOCALIZED_PROGRAMS.ur.find(p => p.id === item.id);
    const catalogEn = LOCALIZED_PROGRAMS.en.find(p => p.id === item.id);

    let title = item.title || '';
    let desc = item.desc || '';

    // Clean any corrupted transliterations
    if (isCorruptedTransliteration(title)) {
      title = catalogUr ? (lang === 'ur' ? catalogUr.title : (catalogEn?.title || title)) : cleanCorruptedUrdu(title);
    }
    if (isCorruptedTransliteration(desc)) {
      desc = catalogUr ? (lang === 'ur' ? catalogUr.desc : (catalogEn?.desc || desc)) : cleanCorruptedUrdu(desc);
    }

    const titleUnedited =
      (!!catalogEn && title.trim().toLowerCase() === catalogEn.title.trim().toLowerCase()) ||
      (!!catalogUr && title.trim() === catalogUr.title.trim());
    const descUnedited =
      (!!catalogEn && desc.trim().toLowerCase() === catalogEn.desc.trim().toLowerCase()) ||
      (!!catalogUr && desc.trim() === catalogUr.desc.trim());

    if (lang === 'ur') {
      title = (titleUnedited && catalogUr) ? catalogUr.title : resolveTranslation(title, 'ur', translateEnglishToUrdu);
      desc = (descUnedited && catalogUr) ? catalogUr.desc : resolveTranslation(desc, 'ur', translateEnglishToUrdu);
    } else {
      title = (titleUnedited && catalogEn) ? catalogEn.title : resolveTranslation(title, 'en', translateUrduToEnglish);
      desc = (descUnedited && catalogEn) ? catalogEn.desc : resolveTranslation(desc, 'en', translateUrduToEnglish);
    }

    return {
      ...item,
      title,
      desc,
      id: item.id ?? idx + 1,
    };
  });
}

/**
 * Resolves leaders array respecting the active language and reflecting Firestore data
 */
export function getLocalizedLeaders(lang: Language, customLeaders: Leader[]): Leader[] {
  const sourceList = Array.isArray(customLeaders) ? customLeaders : [];
  return sourceList.map((item, idx) => {
    const catalogUr = LOCALIZED_LEADERS.ur.find(l => l.id === item.id);
    const catalogEn = LOCALIZED_LEADERS.en.find(l => l.id === item.id);

    let name = item.name || '';
    let role = item.role || '';

    if (isCorruptedTransliteration(name)) {
      name = catalogUr ? (lang === 'ur' ? catalogUr.name : (catalogEn?.name || name)) : cleanCorruptedUrdu(name);
    }
    if (isCorruptedTransliteration(role)) {
      role = catalogUr ? (lang === 'ur' ? catalogUr.role : (catalogEn?.role || role)) : cleanCorruptedUrdu(role);
    }

    if (catalogEn && name.trim().toLowerCase() === catalogEn.name.trim().toLowerCase()) {
      name = lang === 'ur' && catalogUr ? catalogUr.name : catalogEn.name;
    }
    if (catalogEn && role.trim().toLowerCase() === catalogEn.role.trim().toLowerCase()) {
      role = lang === 'ur' && catalogUr ? catalogUr.role : catalogEn.role;
    }
    if (catalogUr && name.trim() === catalogUr.name.trim()) {
      name = lang === 'en' && catalogEn ? catalogEn.name : catalogUr.name;
    }
    if (catalogUr && role.trim() === catalogUr.role.trim()) {
      role = lang === 'en' && catalogEn ? catalogEn.role : catalogUr.role;
    }

    if (lang === 'ur') {
      if (!isUrduText(name)) {
        name = item.nameUr || (catalogUr ? catalogUr.name : translateNameToUrdu(name));
      } else if (item.nameUr) {
        name = item.nameUr;
      }
      if (!isUrduText(role)) {
        role = item.roleUr || (catalogUr ? catalogUr.role : resolveTranslation(role, 'ur', translateOccupationToUrdu));
      } else if (item.roleUr) {
        role = item.roleUr;
      }
      let message = item.messageUr || item.message || catalogUr?.message || '';
      if (message && !isUrduText(message)) {
        message = resolveTranslation(message, 'ur', translateEnglishToUrdu);
      }
      let bio = item.bioUr || item.bio || catalogUr?.bio || '';
      if (bio && !isUrduText(bio)) {
        bio = resolveTranslation(bio, 'ur', translateEnglishToUrdu);
      }
      let location = item.locationUr || item.location || catalogUr?.location || '';
      if (location && !isUrduText(location)) {
        location = resolveTranslation(location, 'ur', translateAddressToUrdu);
      }

      return {
        ...item,
        name,
        role,
        message,
        bio,
        location,
        responsibilities: (item.responsibilitiesUr && item.responsibilitiesUr.length > 0)
          ? item.responsibilitiesUr 
          : (catalogUr?.responsibilitiesUr || item.responsibilities),
        initials: catalogUr?.initials || item.initials || 'آ ب',
        id: item.id ?? idx + 1,
      };
    } else {
      if (isUrduText(name)) {
        name = item.name && !isUrduText(item.name) ? item.name : (catalogEn ? catalogEn.name : translateNameToEnglish(name));
      }
      if (isUrduText(role)) {
        role = item.role && !isUrduText(item.role) ? item.role : (catalogEn ? catalogEn.role : resolveTranslation(role, 'en', translateOccupationToEnglish));
      }
      let message = item.message || item.messageUr || catalogEn?.message || '';
      if (message && isUrduText(message)) {
        message = resolveTranslation(message, 'en', translateUrduToEnglish);
      }
      let bio = item.bio || item.bioUr || catalogEn?.bio || '';
      if (bio && isUrduText(bio)) {
        bio = resolveTranslation(bio, 'en', translateUrduToEnglish);
      }
      let location = item.location || item.locationUr || catalogEn?.location || '';
      if (location && isUrduText(location)) {
        location = resolveTranslation(location, 'en', translateAddressToEnglish);
      }

      return {
        ...item,
        name,
        role,
        message,
        bio,
        location,
        responsibilities: (item.responsibilities && item.responsibilities.length > 0)
          ? item.responsibilities 
          : (catalogEn?.responsibilities || item.responsibilitiesUr),
        initials: catalogEn?.initials || item.initials || 'AB',
        id: item.id ?? idx + 1,
      };
    }
  });
}

// ── Contact Channels Localization Dictionary & Resolver ─────────────

export const CONTACT_TITLES_EN_TO_UR: Record<string, string> = {
  'helpline number': 'ہیلپ لائن نمبر',
  'helpline': 'ہیلپ لائن نمبر',
  'official whatsapp': 'سرکاری واٹس ایپ رابطہ',
  'whatsapp helpline': 'واٹس ایپ ہیلپ لائن',
  'inquiry desk': 'معلومات و رابطہ ای میل',
  'official email': 'سرکاری ای میل',
  'office address': 'مرکزی سیکرٹریٹ و دفتر',
  'secretariat': 'مرکزی کمیونٹی سیکرٹریٹ',
  'main secretariat': 'مرکزی کمیونٹی سیکرٹریٹ',
  'central office': 'مرکزی دفتر و پتہ',
  'secretariat hours': 'دفتری اوقات کار',
  'general inquiries': 'مرکزی رابطہ و معلومات',
  'direct contact': 'براہ راست رابطہ',
  'official contact': 'سرکاری رابطہ',
  'community desk': 'کمیونٹی ڈیسک',
  'emergency cell': 'ایمرجنسی سیل',
  'membership desk': 'رکنیت ڈیسک',
  'donation desk': 'عطیات و فنڈز رابطہ',
  'media & press': 'میڈیا و پریس رابطہ',
  'headquarters': 'مرکزی ہیڈ کوارٹر',
  'phone': 'فون رابطہ',
  'email': 'ای میل رابطہ',
  'address': 'پتہ',
  'hours': 'اوقات کار'
};

export const CONTACT_TITLES_UR_TO_EN: Record<string, string> = {
  'ہیلپ لائن نمبر': 'Helpline Number',
  'سرکاری واٹس ایپ رابطہ': 'Official WhatsApp',
  'واٹس ایپ ہیلپ لائن': 'WhatsApp Helpline',
  'معلومات و رابطہ ای میل': 'Inquiry Desk',
  'سرکاری ای میل': 'Official Email',
  'مرکزی سیکرٹریٹ و دفتر': 'Main Secretariat & Office',
  'مرکزی کمیونٹی سیکرٹریٹ': 'Central Community Secretariat',
  'مرکزی دفتر و پتہ': 'Central Office & Address',
  'دفتری اوقات کار': 'Secretariat Office Hours',
  'مرکزی رابطہ و معلومات': 'General Inquiries',
  'براہ راست رابطہ': 'Direct Contact',
  'سرکاری رابطہ': 'Official Contact',
  'کمیونٹی ڈیسک': 'Community Desk',
  'ایمرجنسی سیل': 'Emergency Cell',
  'رکنیت ڈیسک': 'Membership Desk',
  'عطیات و فنڈز رابطہ': 'Donation Desk',
  'میڈیا و پریس رابطہ': 'Media & Press Relations',
  'مرکزی ہیڈ کوارٹر': 'Headquarters'
};

export const CONTACT_NOTES_EN_TO_UR: Record<string, string> = {
  'available 9 am - 5 pm': 'صبح 9 تا شام 5 بجے تک دستیاب',
  'available 9 am to 5 pm': 'صبح 9 تا شام 5 بجے تک دستیاب',
  'mon - sat: 9 am - 5 pm': 'پیر تا ہفتہ: صبح 9 تا شام 5 بجے',
  'mon - sat: 9 am to 5 pm': 'پیر تا ہفتہ: صبح 9 تا شام 5 بجے',
  'monday – saturday: 09:00 am – 05:00 pm (pkt)': 'پیر تا ہفتہ: صبح نو بجے تا شام پانچ بجے',
  'instant messaging & inquiries': 'فوری پیغامات و معلومات',
  'official correspondence': 'سرکاری خط و کتابت',
  'main community secretariat': 'مرکزی کمیونٹی سیکرٹریٹ',
  'sunday closed / emergency on call': 'اتوار تعطیل / ایمرجنسی آن کال',
  'direct contact': 'براہ راست رابطہ',
  'instant messaging service': 'فوری میسج سروس',
  'membership & general inquiries': 'ممبرشپ اور عمومی سوالات',
  'visitors welcome during office hours': 'دفتری اوقات میں زائرین خوش آمدید',
  '24/7 helpline': '24 گھنٹے ہیلپ لائن'
};

export const CONTACT_NOTES_UR_TO_EN: Record<string, string> = {
  'صبح 9 تا شام 5 بجے تک دستیاب': 'Available 9 AM - 5 PM',
  'صبح 9 تا شام 5 بجے تک': 'Available 9 AM - 5 PM',
  'پیر تا ہفتہ: صبح 9 تا شام 5 بجے': 'Mon - Sat: 9 AM - 5 PM',
  'پیر تا ہفتہ: صبح نو بجے تا شام پانچ بجے': 'Monday – Saturday: 09:00 AM – 05:00 PM (PKT)',
  'فوری پیغامات و معلومات': 'Instant messaging & inquiries',
  'سرکاری خط و کتابت': 'Official correspondence',
  'مرکزی کمیونٹی سیکرٹریٹ': 'Main community secretariat',
  'اتوار تعطیل / ایمرجنسی آن کال': 'Sunday closed / Emergency on call',
  'براہ راست رابطہ': 'Direct contact',
  'فوری میسج سروس': 'Instant messaging service',
  'ممبرشپ اور عمومی سوالات': 'Membership & general inquiries',
  'دفتری اوقات میں زائرین خوش آمدید': 'Visitors welcome during office hours',
  '24 گھنٹے ہیلپ لائن': '24/7 Helpline'
};

export function translateContactTitleToUrdu(title: string): string {
  if (!title) return '';
  const key = title.trim().toLowerCase();
  if (CONTACT_TITLES_EN_TO_UR[key]) return CONTACT_TITLES_EN_TO_UR[key];
  return resolveTranslation(title, 'ur', translateEnglishToUrdu);
}

export function translateContactTitleToEnglish(title: string): string {
  if (!title) return '';
  const key = title.trim();
  if (CONTACT_TITLES_UR_TO_EN[key]) return CONTACT_TITLES_UR_TO_EN[key];
  return resolveTranslation(title, 'en', translateUrduToEnglish);
}

export function translateContactNoteToUrdu(note: string): string {
  if (!note) return '';
  const key = note.trim().toLowerCase();
  if (CONTACT_NOTES_EN_TO_UR[key]) return CONTACT_NOTES_EN_TO_UR[key];
  return resolveTranslation(note, 'ur', translateEnglishToUrdu);
}

export function translateContactNoteToEnglish(note: string): string {
  if (!note) return '';
  const key = note.trim();
  if (CONTACT_NOTES_UR_TO_EN[key]) return CONTACT_NOTES_UR_TO_EN[key];
  return resolveTranslation(note, 'en', translateUrduToEnglish);
}

/**
 * Resolves contact items array respecting active language
 */
export function getLocalizedContacts(lang: Language, customContacts?: ContactDetail[]): ContactDetail[] {
  if (!Array.isArray(customContacts) || customContacts.length === 0) return [];

  return customContacts.map((c) => {
    let title = '';
    let note = '';

    if (lang === 'ur') {
      if (c.titleUr && isUrduText(c.titleUr)) {
        title = c.titleUr;
      } else if (c.title && isUrduText(c.title)) {
        title = c.title;
      } else {
        title = (c.titleUr && isUrduText(c.titleUr)) ? c.titleUr : translateContactTitleToUrdu(c.title || c.titleUr || '');
      }

      if (c.noteUr && isUrduText(c.noteUr)) {
        note = c.noteUr;
      } else if (c.note && isUrduText(c.note)) {
        note = c.note;
      } else {
        note = (c.noteUr && isUrduText(c.noteUr)) ? c.noteUr : translateContactNoteToUrdu(c.note || c.noteUr || '');
      }
    } else {
      if (c.title && !isUrduText(c.title)) {
        title = c.title;
      } else if (c.titleUr && !isUrduText(c.titleUr)) {
        title = c.titleUr;
      } else {
        title = translateContactTitleToEnglish(c.title || c.titleUr || '');
      }

      if (c.note && !isUrduText(c.note)) {
        note = c.note;
      } else if (c.noteUr && !isUrduText(c.noteUr)) {
        note = c.noteUr;
      } else {
        note = translateContactNoteToEnglish(c.note || c.noteUr || '');
      }
    }

    return {
      ...c,
      title: title || c.title || c.titleUr || '',
      note: note || c.note || c.noteUr || '',
    };
  });
}

/**
 * Resolves events array respecting the active language and reflecting Firestore data
 */
export function getLocalizedEvents(lang: Language, customEvents: EventItem[]): EventItem[] {
  const sourceList = customEvents && customEvents.length > 0 ? customEvents : LOCALIZED_EVENTS[lang];
  return sourceList.map((item, idx) => {
    const catalogUr = LOCALIZED_EVENTS.ur.find(e => String(e.id) === String(item.id) || e.title.toLowerCase().trim() === item.title.toLowerCase().trim());
    const catalogEn = LOCALIZED_EVENTS.en.find(e => String(e.id) === String(item.id) || e.title.toLowerCase().trim() === item.title.toLowerCase().trim());

    let title = item.title || '';
    let place = item.place || '';
    let tag = item.tag || '';

    if (isCorruptedTransliteration(title)) {
      title = catalogUr ? (lang === 'ur' ? catalogUr.title : (catalogEn?.title || title)) : cleanCorruptedUrdu(title);
    }
    if (isCorruptedTransliteration(place)) {
      place = catalogUr ? (lang === 'ur' ? catalogUr.place : (catalogEn?.place || place)) : cleanCorruptedUrdu(place);
    }

    const titleUnedited =
      (!!catalogEn && title.trim().toLowerCase() === catalogEn.title.trim().toLowerCase()) ||
      (!!catalogUr && title.trim() === catalogUr.title.trim());
    const placeUnedited =
      (!!catalogEn && place.trim().toLowerCase() === catalogEn.place.trim().toLowerCase()) ||
      (!!catalogUr && place.trim() === catalogUr.place.trim());
    const tagUnedited =
      (!!catalogEn && !!catalogEn.tag && tag.trim().toLowerCase() === catalogEn.tag.trim().toLowerCase()) ||
      (!!catalogUr && !!catalogUr.tag && tag.trim() === catalogUr.tag.trim());

    if (lang === 'ur') {
      title = (titleUnedited && catalogUr) ? catalogUr.title : resolveTranslation(title, 'ur', translateEnglishToUrdu);
      place = (placeUnedited && catalogUr) ? catalogUr.place : resolveTranslation(place, 'ur', translateAddressToUrdu);
      tag = (tagUnedited && catalogUr) ? (catalogUr.tag || tag) : resolveTranslation(tag, 'ur', translateEnglishToUrdu);
      return {
        ...item,
        title,
        place,
        day: (titleUnedited && catalogUr?.day) || item.day,
        month: translateMonthToUrdu(item.month),
        tag: tag || catalogUr?.tag || item.tag,
        id: item.id ?? idx + 1,
      };
    } else {
      title = (titleUnedited && catalogEn) ? catalogEn.title : resolveTranslation(title, 'en', translateUrduToEnglish);
      place = (placeUnedited && catalogEn) ? catalogEn.place : resolveTranslation(place, 'en', translateAddressToEnglish);
      tag = (tagUnedited && catalogEn) ? (catalogEn.tag || tag) : resolveTranslation(tag, 'en', translateUrduToEnglish);
      return {
        ...item,
        title,
        place,
        day: (titleUnedited && catalogEn?.day) || item.day,
        month: translateMonthToEnglish(item.month),
        tag: tag || catalogEn?.tag || item.tag,
        id: item.id ?? idx + 1,
      };
    }
  });
}

/**
 * Resolves dynamic pages array respecting the active language and reflecting Firestore data
 */
export function getLocalizedPages(lang: Language, customPages: PageItem[]): PageItem[] {
  const sourceList = customPages && customPages.length > 0 ? customPages : LOCALIZED_PAGES[lang];
  return sourceList.map((item, idx) => {
    const catalogUr = LOCALIZED_PAGES.ur.find(p => p.slug === item.slug || p.id === item.id || p.title.toLowerCase().trim() === item.title.toLowerCase().trim());
    const catalogEn = LOCALIZED_PAGES.en.find(p => p.slug === item.slug || p.id === item.id || p.title.toLowerCase().trim() === item.title.toLowerCase().trim());

    let title = item.title || '';
    let body = item.body || '';
    let label = item.label || '';

    if (isCorruptedTransliteration(title)) {
      title = catalogUr ? (lang === 'ur' ? catalogUr.title : (catalogEn?.title || title)) : cleanCorruptedUrdu(title);
    }
    if (isCorruptedTransliteration(body)) {
      body = catalogUr ? (lang === 'ur' ? catalogUr.body : (catalogEn?.body || body)) : cleanCorruptedUrdu(body);
    }

    // A record is only safe to pair with the catalog's polished counterpart
    // text when its OWN content still exactly matches the catalog default in
    // its own language — i.e. genuinely untouched by an admin edit. Matching
    // by id/slug alone is not enough: those never change even after an admin
    // edits the title/body/label, so trusting id/slug matches here would mean
    // any edit gets silently discarded in favor of stale catalog text.
    const titleUnedited =
      (!!catalogEn && title.trim().toLowerCase() === catalogEn.title.trim().toLowerCase()) ||
      (!!catalogUr && title.trim() === catalogUr.title.trim());
    const bodyUnedited =
      (!!catalogEn && body.trim().toLowerCase() === catalogEn.body.trim().toLowerCase()) ||
      (!!catalogUr && body.trim() === catalogUr.body.trim());
    const labelUnedited =
      (!!catalogEn && !!catalogEn.label && label.trim().toLowerCase() === catalogEn.label.trim().toLowerCase()) ||
      (!!catalogUr && !!catalogUr.label && label.trim() === catalogUr.label.trim());

    if (lang === 'ur') {
      if (titleUnedited && catalogUr) {
        title = catalogUr.title;
      } else if (!isUrduText(title)) {
        const cachedTitle = getCachedTranslation(title, 'ur', 'en');
        title = cachedTitle || translateEnglishToUrdu(title);
        if (!cachedTitle) warmAzureTranslation(item.title || '', 'ur', 'en');
      }
      if (bodyUnedited && catalogUr) {
        body = catalogUr.body;
      } else if (!isUrduText(body)) {
        const cachedBody = getCachedTranslation(body, 'ur', 'en');
        body = cachedBody || translateEnglishToUrdu(body);
        if (!cachedBody) warmAzureTranslation(item.body || '', 'ur', 'en');
      }
      if (labelUnedited && catalogUr) {
        label = catalogUr.label || label;
      } else if (!isUrduText(label)) {
        const cachedLabel = getCachedTranslation(label, 'ur', 'en');
        label = cachedLabel || translateEnglishToUrdu(label);
        if (!cachedLabel) warmAzureTranslation(item.label || '', 'ur', 'en');
      }
      return {
        ...item,
        title,
        body,
        label,
        id: item.id ?? idx + 1,
      };
    } else {
      if (titleUnedited && catalogEn) {
        title = catalogEn.title;
      } else if (isUrduText(title)) {
        const cachedTitle = getCachedTranslation(title, 'en', 'ur');
        title = cachedTitle || translateUrduToEnglish(title);
        if (!cachedTitle) warmAzureTranslation(item.title || '', 'en', 'ur');
      }
      if (bodyUnedited && catalogEn) {
        body = catalogEn.body;
      } else if (isUrduText(body)) {
        const cachedBody = getCachedTranslation(body, 'en', 'ur');
        body = cachedBody || translateUrduToEnglish(body);
        if (!cachedBody) warmAzureTranslation(item.body || '', 'en', 'ur');
      }
      if (labelUnedited && catalogEn) {
        label = catalogEn.label || label;
      } else if (isUrduText(label)) {
        const cachedLabel = getCachedTranslation(label, 'en', 'ur');
        label = cachedLabel || translateUrduToEnglish(label);
        if (!cachedLabel) warmAzureTranslation(item.label || '', 'en', 'ur');
      }
      return {
        ...item,
        title,
        body,
        label,
        id: item.id ?? idx + 1,
      };
    }
  });
}

/**
 * Gallery Items localized - empty defaults to ensure only authentic pictures added to Firestore or website are shown
 */
export const LOCALIZED_GALLERY: Record<Language, GalleryItem[]> = {
  en: [],
  ur: [],
};

/**
 * Resolves gallery array respecting the active language and reflecting Firestore data.
 * Strictly filters out any empty or placeholder URLs (such as unsplash.com) to only show
 * pictures actually uploaded to Firestore or the website.
 */
export function getLocalizedGallery(lang: Language, customGallery: GalleryItem[]): GalleryItem[] {
  const sourceList = Array.isArray(customGallery) ? customGallery : [];
  
  return sourceList
    .filter((item) => Boolean(item && item.data_url && typeof item.data_url === 'string' && !item.data_url.includes('unsplash.com')))
    .map((item, idx) => {
      let caption = item.caption || '';
      if (isCorruptedTransliteration(caption)) {
        caption = cleanCorruptedUrdu(caption);
      }

      if (lang === 'ur') {
        if (item.captionUr && isUrduText(item.captionUr)) {
          caption = item.captionUr;
        } else if (caption && !isUrduText(caption)) {
          caption = resolveTranslation(caption, 'ur', translateEnglishToUrdu);
        }
        return {
          ...item,
          caption: caption || '',
          captionUr: item.captionUr || caption || '',
          id: item.id ?? idx + 1,
        };
      } else {
        if (caption && isUrduText(caption)) {
          caption = resolveTranslation(caption, 'en', translateUrduToEnglish);
        }
        return {
          ...item,
          caption: caption || '',
          captionUr: item.captionUr || '',
          id: item.id ?? idx + 1,
        };
      }
    });
}
