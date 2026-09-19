import { Program, Leader, EventItem, PageItem, GalleryItem, SiteSettings } from '../types';

export const defaultSettings: SiteSettings = {
  // Identity (Default to Urdu)
  siteName: "آرائیں بنوں",
  siteTagline: "اتحاد، خود مختاری، ترقی",
  siteSubName: "بنوں علاقائی تنظیم",
  siteSubTagline: "بنوں اور خیبر پختونخوا میں برادری کے رشتوں کو مضبوط بنانا",
  logoData: "",

  // Hero
  heroBadge: "عالمی برادری کی تحریک",
  heroTitle: "آرائیں بنوں",
  heroSub: "نئی نسل کو بااختیار بنانا، اپنے ورثے پر فخر",
  heroTagline: "دنیا بھر میں آرائیں برادری کا اتحاد — طاقت، یکجہتی، ترقی۔ برادری کی فلاح، تعلیم اور ترقی کے ایک عظیم مشن کا حصہ بنیں۔",
  heroImage: "",
  heroImages: [],
  heroSlideDuration: 5,

  // About
  aboutTitle: "آرائیں بنوں",
  aboutSubtitle: "دنیا بھر میں آرائیں برادری کی سماجی و معاشی ترقی کے لیے کوشاں۔",
  aboutP1: "آرائیں بنوں پاکستان اور بیرون ملک بسنے والے ہزاروں خاندانوں کی نمائندگی کرتی ہے، جو تعلیم، فلاح اور پائیدار ترقی کے مشترکہ عزم سے جڑے ہوئے ہیں۔",
  aboutP2: "اسٹریٹجک منصوبوں، تعلیمی وظائف، کمیونٹی سینٹرز اور نوجوانوں کی رہنمائی کے ذریعے ہم روایات اور جدید مواقع کے درمیان مضبوط پل تعمیر کر رہے ہیں۔",
  aboutP3: "بنوں میں ہماری علاقائی شاخ نچلی سطح پر فعال ہے، جو جنوبی خیبر پختونخوا کے خاندانوں کے لیے امداد، کیریئر رہنمائی اور باہمی اتحاد فراہم کرتی ہے۔",
  statMembers: "50",
  statPrograms: "8",
  statCities: "30+",

  // Sections
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

  // Contact
  contactAddress: "ARAAIN BANNU Office, Main City, Bannu, Khyber Pakhtunkhwa, Pakistan",
  contactHours: "Monday – Saturday: 09:00 AM – 05:00 PM (PKT)",
  contactPhone: "03369948409",
  contactEmail: "3tahirmeer@gmail.com",
  multipleContacts: [],

  // Social
  socialFacebook: "",
  socialTwitter: "",
  socialWhatsapp: "https://wa.me/923369948409",
  socialInstagram: "",

  // Footer
  footerDesc: "آرائیں بنوں تعلیم، معاشی خود مختاری اور انسانی فلاح کے ذریعے بنوں، خیبر پختونخوا اور دنیا بھر میں برادری کو بااختیار بنانے کے لیے کوشاں ہے۔",
  footerCopy: "© 2025 آرائیں بنوں۔ تمام حقوق محفوظ ہیں۔",

  // Donation Accounts
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

  // Custom Website Update & Announcement
  announcementEnabled: false,
  announcementBadge: "اہم اطلاع",
  announcementText: "آرائیں بنوں کی ممبرشپ مہم شروع ہے۔ اپنا باضابطہ ڈیجیٹل رکنیت کارڈ حاصل کریں۔",
  announcementTextEn: "Official Membership Drive is active. Register online to receive your verified digital ID card.",
  announcementLinkText: "رکنیت حاصل کریں",
  announcementAction: "membership",
  websiteThemeAccent: "#AD7A28",
  lastWebsiteUpdate: "2026-09-12T12:00:00.000Z",
  customNoticeHeadline: "بنوں اور جنوبی اضلاع کے لیے خصوصی تعلیمی و فلاحی پیکج کا باقاعدہ آغاز کر دیا گیا ہے۔",
};

export const defaultPrograms: Program[] = [];

export const defaultLeaders: Leader[] = [];

export const defaultEvents: EventItem[] = [];

export const defaultPages: PageItem[] = [
  {
    slug: 'documentation',
    label: 'Constitution & By-Laws',
    labelUr: 'آئین و منشور',
    title: 'Official Constitution & Governance By-Laws of Araain Bannu',
    titleUr: 'مرکزی آئین و تنظیمی ضوابط برائے آرائیں بنوں',
    body: 'The constitution establishes the governance, executive body rules, welfare mandates, and electoral bylaws of Araain Welfare Association Bannu.',
    bodyUr: 'یہ سرکاری آئین تنظیم کے تنظیمی ڈھانچے، مجلسِ عاملہ، فلاحی منصوبوں، اور ضابطہ اخلاق کو قانونی و تنظیمی تحفظ فراہم کرتا ہے۔',
    published: true,
    sort_order: 1,
    ...({ category: 'documentation' } as any)
  },
  {
    slug: 'history',
    label: 'Our History',
    labelUr: 'ہماری تاریخ',
    title: 'Historical Heritage of Araain Community in Bannu',
    titleUr: 'ضلع بنوں میں برادری کا تاریخی پس منظر اور خدمات',
    body: 'A comprehensive chronicle documenting the migration, historical contributions, and legacy of the Araain community in Bannu and southern districts.',
    bodyUr: 'ضلع بنوں اور خیبر پختونخوا کے جنوبی اضلاع میں برادری کی آمد، زراعت، تعلیم، اور سماجی خدمات کی تفصیلی تاریخی دستاویز۔',
    published: true,
    sort_order: 2,
    ...({ category: 'history' } as any)
  },
  {
    slug: 'blog',
    label: 'Our Blog',
    labelUr: 'ہمارا بلاگ',
    title: 'Community Insights, Articles & Announcements Blog',
    titleUr: 'تعلیمی، سماجی اور فلاحی مضامین و تجزیات',
    body: 'Official thought-leadership articles, educational guides for students, and social welfare reports published by our community scholars.',
    bodyUr: 'نوجوانوں کی رہنمائی، کیریئر کونسلنگ، اور فلاحی سرگرمیوں کے حوالے سے معلوماتی و فکری تحاریر۔',
    published: true,
    sort_order: 3,
    ...({ category: 'blog' } as any)
  },
  {
    slug: 'environmental',
    label: 'Environmental Initiative',
    labelUr: 'ماحولیاتی مہم',
    title: 'Green Bannu & Environmental Sustainability Charter',
    titleUr: 'سرسبز بنوں مہم اور ماحولیاتی تحفظ کا منشور',
    body: 'Annual tree plantation drives, clean drinking water filtration plants, and community hygiene initiatives managed by the environmental wing.',
    bodyUr: 'صاف پانی کی فراہمی، شجرکاری مہم، اور صحت مند ماحول کے فروغ کے لیے اٹھائے گئے عملی اقدامات کی رپورٹ۔',
    published: true,
    sort_order: 4,
    ...({ category: 'environmental' } as any)
  },
  {
    slug: 'gallery',
    label: 'Town Gallery Info',
    labelUr: 'ٹاؤن گیلری معلومات',
    title: 'Town Gallery & Visual Archives Overview',
    titleUr: 'ٹاؤن گیلری و تصویری آرکائیو کی معلومات',
    body: 'Photographic records of community conventions, welfare ration distributions, medical camps, and public award ceremonies across Bannu.',
    bodyUr: 'تنظیم کے اہم اجلاسوں، راشن پیکجز کی تقسیم، فری میڈیکل کیمپس، اور اعزازی تقاریب کی یادگار تصاویر۔',
    published: true,
    sort_order: 5,
    ...({ category: 'gallery' } as any)
  },
  {
    slug: 'departments',
    label: 'Departments & Desks',
    labelUr: 'شعبہ جات و انتظامیہ',
    title: 'Executive Wings, Welfare Desks & Functional Departments',
    titleUr: 'تنظیمی شعبہ جات، لیگل ایڈ، یوتھ ونگ اور فلاحی ڈیسکس',
    body: 'Functional portfolios including Education Wing, Youth Development, Legal Assistance, Healthcare Support, and Public Relations.',
    bodyUr: 'تعلیمی کمیٹی، یوتھ ونگ، قانونی معاونت سیل، میڈیکل ایڈ، اور میڈیا و پبلک ریلیشنز ونگ کی ذمہ داریاں اور رابطے۔',
    published: true,
    sort_order: 6,
    ...({ category: 'department' } as any)
  }
];

export const defaultGallery: GalleryItem[] = [];
