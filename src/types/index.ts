export type Language = 'en' | 'ur';

export interface Program {
  id?: number | string;
  icon_name: string;
  color: string;
  title: string;
  titleUr?: string;
  desc: string;
  descUr?: string;
  image?: string;
  image_url?: string;
  badge?: string;
  badgeUr?: string;
  category?: string;
  categoryUr?: string;
  status?: 'active' | 'planning' | 'completed' | string;
  budget?: string;
  sort_order?: number;
}

export interface ContactDetail {
  id: string;
  title: string;
  titleUr?: string;
  value: string;
  type?: 'phone' | 'whatsapp' | 'email' | 'address' | 'hours' | 'link' | 'auto';
  icon?: string;
  note?: string;
  noteUr?: string;
  isPrimary?: boolean;
  sort_order?: number;
}

export interface Leader {
  id?: number | string;
  initials?: string;
  name: string;
  nameUr?: string;
  role: string;
  roleUr?: string;
  email?: string;
  phone?: string;
  location?: string;
  locationUr?: string;
  message?: string;
  messageUr?: string;
  bio?: string;
  bioUr?: string;
  responsibilities?: string[];
  responsibilitiesUr?: string[];
  featured?: boolean | number;
  pinnedForAbout?: boolean;
  photo_data?: string;
  image?: string;
  sort_order?: number;
}

export interface EventItem {
  id?: number | string;
  day: string;
  month: string;
  year?: string;
  tag: string;
  tagUr?: string;
  title: string;
  titleUr?: string;
  desc?: string;
  descUr?: string;
  time_str: string;
  place: string;
  placeUr?: string;
  image?: string;
  poster_url?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | string;
  registrationLink?: string;
  sort_order?: number;
}

export type PageCategory =
  | 'documentation'
  | 'history'
  | 'blog'
  | 'environmental'
  | 'department'
  | 'gallery';

export interface PageItem {
  id?: number | string;
  slug: string;
  label: string;
  labelUr?: string;
  title: string;
  titleUr?: string;
  body: string;
  bodyUr?: string;
  image?: string;
  bannerPhoto?: string;
  published?: boolean | number;
  sort_order?: number;
  category?: PageCategory | string;
}

export interface GalleryItem {
  id?: number | string;
  data_url: string;
  image?: string;
  caption?: string;
  captionUr?: string;
  sort_order?: number;
}

export interface SiteSettings {
  // Identity
  siteName: string;
  siteTagline: string;
  siteSubName: string;
  siteSubTagline: string;
  logoData?: string;
  faviconData?: string;

  // Hero
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  heroTagline: string;
  heroImage?: string;
  heroImages?: string[];
  heroSlideDuration?: number;

  // About
  aboutTitle: string;
  aboutSubtitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
  statMembers: string;
  statPrograms: string;
  statCities: string;
  // Note: chairman quote info merged into Leader with pinnedForAbout?: boolean

  // Sections
  programsTitle: string;
  programsDesc: string;
  leadershipTitle: string;
  membershipTitle: string;
  membershipDesc: string;
  donateTitle: string;
  donateDesc: string;
  eventsTitle: string;
  galleryTitle: string;
  galleryDesc: string;

  // Contact
  contactAddress: string;
  contactHours: string;
  contactPhone: string;
  contactEmail: string;
  multipleContacts?: ContactDetail[];
  contactOfficeImage?: string;
  contactMapUrl?: string;

  // Social
  socialFacebook: string;
  socialTwitter: string;
  socialWhatsapp: string;
  socialInstagram: string;

  // Footer
  footerDesc: string;
  footerCopy: string;

  // Donation Accounts
  bankName: string;
  bankTitle: string;
  bankAccount: string;
  bankIBAN: string;
  bankBranch: string;
  bankQrCode?: string;
  epTitle: string;
  epNumber: string;
  epQrCode?: string;
  jcTitle: string;
  jcNumber: string;
  jcQrCode?: string;
  intBank: string;
  intSwift: string;
  intIBAN: string;
  raastId?: string;
  raastQrCode?: string;

  // Custom Website Update & Announcement
  announcementEnabled?: boolean;
  announcementBadge?: string;
  announcementBadgeUr?: string;
  announcementText?: string;
  announcementTextEn?: string;
  announcementTextUr?: string;
  announcementLinkText?: string;
  announcementAction?: string;
  announcementLink?: string;
  announcementImage?: string;
  websiteThemeAccent?: string;
  lastWebsiteUpdate?: string;
  customNoticeHeadline?: string;

  [key: string]: any;
}

export interface Registration {
  _id?: string;
  id?: string;
  fullName: string;
  fatherName: string;
  caste?: string;
  gender: string;
  membershipType: string;
  cnic: string;
  dob: string;
  email: string;
  whatsapp: string;
  residentialStatus: string;
  affiliated?: string;
  education?: string;
  work?: string;
  reason?: string;
  // Administrative Hierarchy Address
  province?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  // Legacy address compatibility
  street?: string;
  city: string;
  state?: string;
  country: string;
  photoData?: string;
  status?: 'new' | 'approved' | 'rejected' | string;
  cardId?: string;
  // Timestamp (ISO string) of the moment this member was actually approved /
  // their ID card was first issued. Set exactly ONCE, the first time either
  // happens - never recomputed afterward. This is the one true "issue date"
  // for the card; it must never be replaced by "today" just because someone
  // reopened the card viewer, scanned the card, or looked it up.
  approvedAt?: string;
  submittedAt?: any;

  // Processed Bi-directional Translations
  fullNameEn?: string;
  fullNameUr?: string;
  fatherNameEn?: string;
  fatherNameUr?: string;
  casteEn?: string;
  casteUr?: string;
  provinceEn?: string;
  provinceUr?: string;
  districtEn?: string;
  districtUr?: string;
  tehsilEn?: string;
  tehsilUr?: string;
  villageEn?: string;
  villageUr?: string;
  streetEn?: string;
  streetUr?: string;
  cityEn?: string;
  cityUr?: string;
  stateEn?: string;
  stateUr?: string;
  countryEn?: string;
  countryUr?: string;
  workEn?: string;
  workUr?: string;
  membershipTypeEn?: string;
  membershipTypeUr?: string;
  genderEn?: string;
  genderUr?: string;
  educationEn?: string;
  educationUr?: string;
  residentialStatusEn?: string;
  residentialStatusUr?: string;
}

export interface Donation {
  _id?: string;
  id?: string | number;
  donorName: string;
  phone: string;
  email?: string;
  amount: string | number;
  method: string;
  txId?: string;
  note?: string;
  photoData?: string;
  receiptUrl?: string;
  receiptPhoto?: string;
  proofUrl?: string;
  status?: 'unverified' | 'verified' | 'rejected' | string;
  submittedAt?: any;
}

export interface ContactMessage {
  id?: string | number;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read' | 'replied' | string;
  createdAt?: any;
  submittedAt?: any;
}
