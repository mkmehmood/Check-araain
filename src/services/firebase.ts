import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { Registration, Donation, SiteSettings, Program, Leader, EventItem, PageItem, GalleryItem, ContactMessage } from '../types';
import { processRegistrationTranslations } from '../utils/urduTransliterator';

export const FIREBASE_CONFIG = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || "AIzaSyDQWTvTbXX6o1QvHy5E9HeD5k0DmySlsPg",
  authDomain: "tahir-meer.firebaseapp.com",
  projectId: "tahir-meer",
  storageBucket: "tahir-meer.firebasestorage.app",
  messagingSenderId: "275167373986",
  appId: "1:275167373986:web:0eef7d041ca22df4c3c5fb"
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Initialize Firestore with experimentalForceLongPolling to prevent gRPC-web/WebChannel stream drops in iframe & web container sandboxes
function createFirestoreInstance() {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(firebaseApp);

// ── Settings Sub-Documents Mapping ──────────────────────────────
export const SETTINGS_GROUPS: Record<string, (keyof SiteSettings)[]> = {
  identity: ['siteName', 'siteTagline', 'siteSubName', 'siteSubTagline', 'logoData', 'logoUrl', 'faviconData'],
  hero: ['heroBadge', 'heroTitle', 'heroSub', 'heroTagline', 'heroImage', 'heroImages', 'heroSlideDuration', 'heroNoticeBadge', 'heroNoticeText', 'heroNoticeTextUr', 'heroNoticeImage'],
  about: ['aboutTitle', 'aboutSubtitle', 'aboutP1', 'aboutP2', 'aboutP3', 'statMembers', 'statPrograms', 'statCities'],
  sections: ['programsTitle', 'programsDesc', 'leadershipTitle', 'membershipTitle', 'membershipTitleUr', 'membershipDesc', 'membershipDescUr', 'ctaMembershipBtn', 'ctaMembershipBtnUr', 'donateTitle', 'donateDesc', 'eventsTitle', 'galleryTitle', 'galleryDesc'],
  contact: ['contactAddress', 'contactAddressUr', 'contactHours', 'contactPhone', 'contactEmail', 'multipleContacts', 'contactOfficeImage', 'officePhoto', 'contactMapUrl', 'mapUrl'],
  social: ['socialFacebook', 'socialTwitter', 'socialWhatsapp', 'socialWhatsappGroup', 'socialInstagram'],
  footer: ['footerDesc', 'footerDescUr', 'footerCopy', 'footerCopyUr'],
  donation: ['bankName', 'bankTitle', 'bankAccount', 'bankIBAN', 'bankBranch', 'bankSwift', 'bankQrCode', 'epTitle', 'epNumber', 'epQrCode', 'jcTitle', 'jcNumber', 'jcQrCode', 'intBank', 'intSwift', 'intIBAN', 'raastId', 'raastTitle', 'raastQrCode'],
  misc: ['announcementEnabled', 'announcementBadge', 'announcementBadgeUr', 'announcementText', 'announcementTextEn', 'announcementTextUr', 'announcementLinkText', 'announcementAction', 'announcementLink', 'announcementImage', 'websiteThemeAccent', 'lastWebsiteUpdate', 'customNoticeHeadline'],
};

import { sanitizeText, sanitizePhone, sanitizeEmail, sanitizeCardId, isAuthorizedAdminEmail } from '../utils/security';

// ── Public Submissions ──────────────────────────────────────────

/**
 * Submits a new membership registration to Firestore
 * Automatically processes bi-directional Urdu <-> English translations
 * and applies strict input sanitization to prevent XSS and payload poisoning.
 */
export async function submitRegistration(data: Omit<Registration, '_id' | 'submittedAt'>): Promise<string> {
  const processed = processRegistrationTranslations(data);
  
  // Strict sanitization & field isolation (anti-tamper)
  const sanitized = {
    fullName: sanitizeText(processed.fullName, 150),
    fatherName: sanitizeText(processed.fatherName, 150),
    gender: sanitizeText(processed.gender, 30) || 'Male',
    membershipType: sanitizeText(processed.membershipType, 60) || 'General Member',
    cnic: sanitizeText(processed.cnic, 30),
    dob: sanitizeText(processed.dob, 30),
    email: sanitizeEmail(processed.email),
    whatsapp: sanitizePhone(processed.whatsapp),
    residentialStatus: sanitizeText(processed.residentialStatus, 60) || 'Resident (Pakistan)',
    affiliated: sanitizeText(processed.affiliated, 200),
    education: sanitizeText(processed.education, 100),
    work: sanitizeText(processed.work, 100),
    reason: sanitizeText(processed.reason, 1000),
    // Administrative Hierarchy & Village Address
    village: sanitizeText(processed.village || processed.street, 200),
    tehsil: sanitizeText(processed.tehsil || processed.city, 100) || 'Bannu',
    district: sanitizeText(processed.district || processed.city, 100) || 'Bannu',
    province: sanitizeText(processed.province || processed.state, 100) || 'Khyber Pakhtunkhwa',
    // Legacy Address Support
    street: sanitizeText(processed.village || processed.street, 200),
    city: sanitizeText(processed.district || processed.tehsil || processed.city, 100) || 'Bannu',
    state: sanitizeText(processed.province || processed.state, 100) || 'Khyber Pakhtunkhwa',
    country: sanitizeText(processed.country, 100) || 'Pakistan',
    // Cap photo data size to 700KB
    photoData: typeof processed.photoData === 'string' && processed.photoData.length <= 700000 ? processed.photoData : '',
    // Bi-directional translation fields
    fullNameEn: sanitizeText(processed.fullNameEn, 150),
    fullNameUr: sanitizeText(processed.fullNameUr, 150),
    fatherNameEn: sanitizeText(processed.fatherNameEn, 150),
    fatherNameUr: sanitizeText(processed.fatherNameUr, 150),
    casteEn: sanitizeText(processed.casteEn, 60),
    casteUr: sanitizeText(processed.casteUr, 60),
    villageEn: sanitizeText(processed.villageEn, 200),
    villageUr: sanitizeText(processed.villageUr, 200),
    tehsilEn: sanitizeText(processed.tehsilEn, 100),
    tehsilUr: sanitizeText(processed.tehsilUr, 100),
    districtEn: sanitizeText(processed.districtEn, 100),
    districtUr: sanitizeText(processed.districtUr, 100),
    provinceEn: sanitizeText(processed.provinceEn, 100),
    provinceUr: sanitizeText(processed.provinceUr, 100),
    streetEn: sanitizeText(processed.villageEn || processed.streetEn, 200),
    streetUr: sanitizeText(processed.villageUr || processed.streetUr, 200),
    cityEn: sanitizeText(processed.districtEn || processed.cityEn, 100),
    cityUr: sanitizeText(processed.districtUr || processed.cityUr, 100),
    stateEn: sanitizeText(processed.provinceEn || processed.stateEn, 100),
    stateUr: sanitizeText(processed.provinceUr || processed.stateUr, 100),
    countryEn: sanitizeText(processed.countryEn, 100),
    countryUr: sanitizeText(processed.countryUr, 100),
    workEn: sanitizeText(processed.workEn, 100),
    workUr: sanitizeText(processed.workUr, 100),
    membershipTypeEn: sanitizeText(processed.membershipTypeEn, 60),
    membershipTypeUr: sanitizeText(processed.membershipTypeUr, 60),
    genderEn: sanitizeText(processed.genderEn, 30),
    genderUr: sanitizeText(processed.genderUr, 30),
    educationEn: sanitizeText(processed.educationEn, 100),
    educationUr: sanitizeText(processed.educationUr, 100),
    residentialStatusEn: sanitizeText(processed.residentialStatusEn, 60),
    residentialStatusUr: sanitizeText(processed.residentialStatusUr, 60),
    // Status is always initialized to 'new' (cardId is never permitted on submission)
    status: 'new',
  };

  try {
    const coll = collection(db, 'registrations');
    const docRef = await addDoc(coll, {
      ...sanitized,
      submittedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.warn('[Firebase] Registration write error:', error.message);
    const localId = 'offline_' + Date.now();
    return localId;
  }
}

/**
 * Submits a new donation transaction proof to Firestore
 * Applies strict schema boundaries and sanitization.
 */
export async function submitDonation(data: Omit<Donation, '_id' | 'submittedAt'>): Promise<string> {
  const sanitized = {
    donorName: sanitizeText(data.donorName, 150),
    phone: sanitizePhone(data.phone),
    email: sanitizeEmail(data.email),
    amount: sanitizeText(String(data.amount), 50),
    method: sanitizeText(data.method, 100),
    txId: sanitizeText(data.txId, 100),
    note: sanitizeText(data.note, 1000),
    photoData: typeof data.photoData === 'string' && data.photoData.length <= 700000 ? data.photoData : '',
    status: 'unverified',
  };

  try {
    const coll = collection(db, 'donations');
    const docRef = await addDoc(coll, {
      ...sanitized,
      submittedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.warn('[Firebase] Donation write error:', error.message);
    const localId = 'offline_' + Date.now();
    return localId;
  }
}

// ── Real-time Data Listeners ────────────────────────────────────

/**
 * Listen to live Registrations collection
 */
export function subscribeToRegistrations(callback: (items: Registration[]) => void): () => void {
  // Security guard: Registrations contain sensitive member PII protected by Firestore Security Rules.
  // Only establish listeners when authenticated as an authorized administrator.
  if (!auth.currentUser || !isAuthorizedAdminEmail(auth.currentUser.email)) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(collection(db, 'registrations'), orderBy('submittedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: Registration[] = snapshot.docs.map(d => {
        const raw = { ...d.data() as Registration, _id: d.id };
        return processRegistrationTranslations(raw);
      });
      callback(items);
    }, (error) => {
      console.warn('[Firebase] Registrations subscription error:', error.message);
      callback([]);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Listen to live Donations collection
 */
export function subscribeToDonations(callback: (items: Donation[]) => void): () => void {
  // Security guard: Donations contain financial proof slips protected by Firestore Security Rules.
  // Only establish listeners when authenticated as an authorized administrator.
  if (!auth.currentUser || !isAuthorizedAdminEmail(auth.currentUser.email)) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(collection(db, 'donations'), orderBy('submittedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: Donation[] = snapshot.docs.map(d => ({
        ...d.data() as Donation,
        _id: d.id,
      }));
      callback(items);
    }, (error) => {
      console.warn('[Firebase] Donations subscription error:', error.message);
      callback([]);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Subscribe to all site configuration sub-docs and collections
 */
export function subscribeToSiteConfig(
  onSettings: (patch: Partial<SiteSettings>) => void,
  onPrograms?: (items: Program[]) => void,
  onLeaders?: (items: Leader[]) => void,
  onEvents?: (items: EventItem[]) => void,
  onPages?: (items: PageItem[]) => void,
  onGallery?: (items: GalleryItem[]) => void
): () => void {
  const unsubs: (() => void)[] = [];

  const subDocs = ['identity', 'hero', 'about', 'sections', 'contact', 'social', 'footer', 'donation', 'misc'];
  subDocs.forEach(name => {
    try {
      const unsub = onSnapshot(doc(db, 'siteConfig', name), snap => {
        if (snap.exists()) {
          onSettings(snap.data() as Partial<SiteSettings>);
        }
      }, err => {
        console.warn(`[Firebase] siteConfig/${name} error:`, err.message);
      });
      unsubs.push(unsub);
    } catch (e) {}
  });

  const listDocs: { name: string; handler?: (items: any[]) => void }[] = [
    { name: 'programs', handler: onPrograms },
    { name: 'leaders', handler: onLeaders },
    { name: 'events', handler: onEvents },
    { name: 'pages', handler: onPages },
    { name: 'gallery', handler: onGallery },
  ];

  listDocs.forEach(({ name, handler }) => {
    if (!handler) return;
    try {
      const unsub = onSnapshot(doc(db, 'siteConfig', name), snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.items)) {
            handler(data.items);
          } else {
            handler([]);
          }
        }
      }, err => {
        console.warn(`[Firebase] siteConfig/${name} error:`, err.message);
      });
      unsubs.push(unsub);
    } catch (e) {}
  });

  return () => unsubs.forEach(u => u());
}

// ── Admin Push Helpers ──────────────────────────────────────────

function cleanUndefinedData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedData);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc: Record<string, any>, [k, v]) => {
      if (v !== undefined) {
        acc[k] = cleanUndefinedData(v);
      }
      return acc;
    }, {});
  }
  return obj;
}

export async function pushSettingsToCloud(settings: Partial<SiteSettings>): Promise<void> {
  const byGroup: Record<string, Record<string, any>> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined) continue;
    let group = 'misc';
    for (const [g, fields] of Object.entries(SETTINGS_GROUPS)) {
      if ((fields as string[]).includes(key)) {
        group = g;
        break;
      }
    }
    if (!byGroup[group]) byGroup[group] = {};
    byGroup[group][key] = cleanUndefinedData(value);
  }

  // Replace each sub-document in Firestore siteConfig with the new data.
  // By omitting { merge: true }, setDoc completely replaces the document in Firestore,
  // guaranteeing that any deleted pictures or replaced text completely overwrite previous entries.
  await Promise.all(
    Object.entries(byGroup).map(([group, fields]) =>
      setDoc(doc(db, 'siteConfig', group), fields)
    )
  );
}

/**
 * Replaces a single sub-document in Firestore siteConfig with complete overwrite
 * (without merge: true) so deleted fields/images are fully removed.
 */
export async function pushSettingsDocToCloud(docName: string, data: Record<string, any>): Promise<void> {
  await setDoc(doc(db, 'siteConfig', docName), cleanUndefinedData(data));
}

/**
 * Replaces the Firestore database with the new CMS pictures and text,
 * while deliberately preserving and keeping the Photo Gallery community memories intact.
 */
export async function replaceDatabaseWithCmsKeepMemories(
  settings: SiteSettings,
  programs: Program[],
  leaders: Leader[],
  events: EventItem[],
  pages: PageItem[]
): Promise<void> {
  await pushSettingsToCloud(settings);
  await pushProgramsToCloud(programs);
  await pushLeadersToCloud(leaders);
  await pushEventsToCloud(events);
  await pushPagesToCloud(pages);
  // Note: Photo Gallery (siteConfig/gallery) is intentionally kept intact because it preserves community memories.
}

export async function pushProgramsToCloud(items: Program[]): Promise<void> {
  await setDoc(doc(db, 'siteConfig', 'programs'), { items: cleanUndefinedData(items) });
}

export async function pushLeadersToCloud(items: Leader[]): Promise<void> {
  await setDoc(doc(db, 'siteConfig', 'leaders'), { items: cleanUndefinedData(items) });
}

export async function pushEventsToCloud(items: EventItem[]): Promise<void> {
  await setDoc(doc(db, 'siteConfig', 'events'), { items: cleanUndefinedData(items) });
}

export async function pushPagesToCloud(items: PageItem[]): Promise<void> {
  await setDoc(doc(db, 'siteConfig', 'pages'), { items: cleanUndefinedData(items) });
}

export async function pushGalleryToCloud(items: GalleryItem[]): Promise<void> {
  await setDoc(doc(db, 'siteConfig', 'gallery'), { items: cleanUndefinedData(items) });
}

export async function updateRegistrationStatusInCloud(id: string, status: string, approvedAt?: string): Promise<void> {
  const payload: Record<string, any> = { status };
  // Only ever written the FIRST time a registration becomes 'approved'
  // (caller is responsible for that check) - never overwritten afterward.
  if (approvedAt) payload.approvedAt = approvedAt;
  await updateDoc(doc(db, 'registrations', id), payload);
}

export async function deleteRegistrationFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'registrations', id));
}

export async function updateDonationStatusInCloud(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, 'donations', id), { status });
}

export async function deleteDonationFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'donations', id));
}

export interface PublicVerifiedCard {
  cardId: string;
  fullNameEn: string;
  fullNameUr: string;
  membershipTypeEn: string;
  membershipTypeUr: string;
  status: string;
  issuedAt: string;
  // ISO timestamp of the real admin-approval / first-issuance moment that
  // `issuedAt` was formatted from. Kept alongside the display string so any
  // future re-formatting never needs to re-derive (or worse, re-guess) it.
  approvedAt?: string;
  expiresAt?: string;
  councilName?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  province?: string;
}

/**
 * Formats an ISO timestamp into the display format used on the printed card
 * and in verification results ("DD/MM/YYYY"). Centralized here so every
 * caller renders the SAME stored moment the same way, instead of each one
 * calling `new Date().toLocaleDateString(...)` on its own local clock.
 */
export function formatIssueDate(isoTimestamp: string): string {
  try {
    const d = new Date(isoTimestamp);
    if (isNaN(d.getTime())) return isoTimestamp;
    return d.toLocaleDateString('en-GB');
  } catch {
    return isoTimestamp;
  }
}

const LOCAL_VERIFIED_CARDS_KEY = 'araain_verified_cards_registry_v1';

export function saveVerifiedCardLocally(entry: PublicVerifiedCard): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(LOCAL_VERIFIED_CARDS_KEY);
    const registry: Record<string, PublicVerifiedCard> = raw ? JSON.parse(raw) : {};
    registry[entry.cardId] = entry;
    localStorage.setItem(LOCAL_VERIFIED_CARDS_KEY, JSON.stringify(registry));
  } catch (e) {
    // Ignore storage errors
  }
}

export function getVerifiedCardLocally(cardId: string): PublicVerifiedCard | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(LOCAL_VERIFIED_CARDS_KEY);
    if (!raw) return null;
    const registry: Record<string, PublicVerifiedCard> = JSON.parse(raw);
    return registry[cardId] || null;
  } catch {
    return null;
  }
}

export async function registerVerifiedCard(cardData: PublicVerifiedCard): Promise<void> {
  if (!cardData || !cardData.cardId) return;
  // 1. Immediately persist to local registry
  saveVerifiedCardLocally(cardData);

  // 2. Attempt to publish to Firestore verifiedCards collection
  try {
    await setDoc(doc(db, 'verifiedCards', cardData.cardId), cardData, { merge: true });
  } catch (err: any) {
    console.warn('[Firebase] Could not publish card to cloud verifiedCards:', err?.message);
  }
}

export async function assignCardIdInCloud(
  regId: string, 
  orgName: string, 
  registrationData?: Partial<Registration>
): Promise<string> {
  const prefix = orgName
    ? orgName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'AB'
    : 'AB';
  const yy = String(new Date().getFullYear() % 100).padStart(2, '0');
  const randomSerial = String(Math.floor(100000 + Math.random() * 900000));
  const cardId = `${prefix}-${yy}-${randomSerial}`;

  // This function only ever runs ONCE per member - the moment a card is
  // first created (callers only reach here when no cardId exists yet). The
  // approval/issue timestamp is fixed right here, right now, and must never
  // be recomputed on a later view/scan/search of this same card. Prefer an
  // already-known approvedAt (e.g. the admin approved the registration
  // before generating the card) so the two stay consistent.
  const approvedAt = registrationData?.approvedAt || new Date().toISOString();

  const verifiedEntry: PublicVerifiedCard = {
    cardId,
    fullNameEn: sanitizeText(registrationData?.fullNameEn || registrationData?.fullName || '', 150),
    fullNameUr: sanitizeText(registrationData?.fullNameUr || registrationData?.fullName || '', 150),
    membershipTypeEn: sanitizeText(registrationData?.membershipTypeEn || registrationData?.membershipType || 'Member', 60),
    membershipTypeUr: sanitizeText(registrationData?.membershipTypeUr || registrationData?.membershipType || 'ممبر', 60),
    status: 'verified',
    issuedAt: formatIssueDate(approvedAt),
    approvedAt,
    councilName: orgName || 'ARAAIN ASSOCIATION BANNU',
    village: sanitizeText(registrationData?.village || registrationData?.street || '', 200),
    tehsil: sanitizeText(registrationData?.tehsil || '', 100),
    district: sanitizeText(registrationData?.district || registrationData?.city || '', 100),
    province: sanitizeText(registrationData?.province || registrationData?.state || '', 100),
  };

  // 1. Save locally first to guarantee zero-latency verification
  saveVerifiedCardLocally(verifiedEntry);

  // 2. Update registration document if ID exists - persist cardId AND the
  //    approval timestamp together so the registration record itself is the
  //    durable source of truth for "when was this member approved", even if
  //    the verifiedCards doc were ever lost or rebuilt.
  if (regId) {
    try {
      await updateDoc(doc(db, 'registrations', regId), { cardId, approvedAt, status: 'approved' });
    } catch (err: any) {
      console.warn('[Firebase] Could not update registration document in cloud:', err?.message);
    }
  }

  // 3. Update public verifiedCards in cloud
  try {
    await setDoc(doc(db, 'verifiedCards', cardId), verifiedEntry, { merge: true });
  } catch (err: any) {
    console.warn('[Firebase] Could not write verifiedCard in cloud:', err?.message);
  }

  return cardId;
}

/**
 * Privacy-preserving public membership verification lookup.
 * Searches across:
 * 1. Cloud Firestore verifiedCards
 * 2. Local verified cards registry
 * 3. Supplied or stored registrations matching Card ID or CNIC
 */
export async function lookupVerifiedCard(
  rawCardId: string,
  fallbackRegistrations?: Registration[]
): Promise<PublicVerifiedCard | null> {
  const cardId = sanitizeCardId(rawCardId);
  if (!cardId) return null;

  // 1. Check Cloud Firestore verifiedCards collection
  try {
    const snap = await getDoc(doc(db, 'verifiedCards', cardId));
    if (snap.exists()) {
      const data = snap.data() as PublicVerifiedCard;
      saveVerifiedCardLocally(data);
      return data;
    }
  } catch (err: any) {
    console.warn('[Firebase] lookupVerifiedCard cloud query notice:', err?.message);
  }

  // 2. Check Local Registry Cache
  const localRecord = getVerifiedCardLocally(cardId);
  if (localRecord) {
    return localRecord;
  }

  // 3. Search in provided fallback registrations or local storage registrations
  let candidateRegistrations: Registration[] = [];
  if (fallbackRegistrations && fallbackRegistrations.length > 0) {
    candidateRegistrations = fallbackRegistrations;
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawStored = localStorage.getItem('araain_local_registrations_v2') || localStorage.getItem('araain_registrations');
      if (rawStored) {
        candidateRegistrations = JSON.parse(rawStored);
      }
    } catch {
      // Ignore
    }
  }

  const cleanQuery = cardId.toUpperCase();
  const digitsQuery = cardId.replace(/\D/g, '');

  const matchedReg = candidateRegistrations.find((r) => {
    if (r.cardId && sanitizeCardId(r.cardId) === cleanQuery) return true;
    if (r._id && r._id.toUpperCase() === cleanQuery) return true;
    if (digitsQuery.length >= 7 && r.cnic && r.cnic.replace(/\D/g, '') === digitsQuery) return true;
    return false;
  });

  if (matchedReg) {
    const assignedId = matchedReg.cardId || cardId;
    const constructed: PublicVerifiedCard = {
      cardId: assignedId,
      fullNameEn: sanitizeText(matchedReg.fullNameEn || matchedReg.fullName || '', 150),
      fullNameUr: sanitizeText(matchedReg.fullNameUr || matchedReg.fullName || '', 150),
      membershipTypeEn: sanitizeText(matchedReg.membershipTypeEn || matchedReg.membershipType || 'Official Member', 60),
      membershipTypeUr: sanitizeText(matchedReg.membershipTypeUr || matchedReg.membershipType || 'باضابطہ رکن', 60),
      status: matchedReg.status || 'verified',
      issuedAt: new Date().toLocaleDateString('en-GB'),
      councilName: 'ARAAIN ASSOCIATION BANNU',
      village: sanitizeText(matchedReg.village || matchedReg.street || '', 200),
      tehsil: sanitizeText(matchedReg.tehsil || '', 100),
      district: sanitizeText(matchedReg.district || matchedReg.city || '', 100),
      province: sanitizeText(matchedReg.province || matchedReg.state || '', 100),
    };
    saveVerifiedCardLocally(constructed);
    // Asynchronously try to register to cloud
    setDoc(doc(db, 'verifiedCards', assignedId), constructed, { merge: true }).catch(() => {});
    return constructed;
  }

  return null;
}

/**
 * Securely signs out admin from Firebase Authentication
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e: any) {
    console.warn('[Firebase] Sign out error:', e?.message);
  }
}

// ── Contact Messages ────────────────────────────────────────────

export async function submitContactMessageInCloud(
  data: Omit<ContactMessage, 'id' | 'createdAt'>
): Promise<string> {
  const newRef = doc(collection(db, 'messages'));
  const sanitized = {
    name: sanitizeText(data.name, 150),
    email: sanitizeEmail(data.email),
    subject: sanitizeText(data.subject || '', 200),
    message: sanitizeText(data.message, 2000),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  await setDoc(newRef, sanitized);
  return newRef.id;
}

export function subscribeToContactMessages(
  onMessages: (items: ContactMessage[]) => void
): () => void {
  // Security guard: Contact inquiries are restricted to authorized administrators.
  if (!auth.currentUser || !isAuthorizedAdminEmail(auth.currentUser.email)) {
    onMessages([]);
    return () => {};
  }

  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as ContactMessage[];
        onMessages(list);
      },
      (err) => {
        console.warn('[Firebase] messages query failed:', err.message);
        onMessages([]);
      }
    );
  } catch (err: any) {
    console.warn('[Firebase] subscribeToContactMessages setup error:', err.message);
    return () => {};
  }
}

export async function deleteContactMessageFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', id));
}

export async function updateContactMessageStatusInCloud(
  id: string, 
  status: 'unread' | 'read' | 'replied'
): Promise<void> {
  await updateDoc(doc(db, 'messages', id), { status });
}


export async function compressImage(file: File, maxWidth = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
