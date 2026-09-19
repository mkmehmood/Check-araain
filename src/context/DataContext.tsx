import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SiteSettings, 
  Program, 
  Leader, 
  EventItem, 
  PageItem, 
  GalleryItem, 
  Registration, 
  Donation, 
  ContactMessage 
} from '../types';
import { 
  defaultSettings
} from '../data/defaultData';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  auth,
  subscribeToSiteConfig, 
  subscribeToRegistrations, 
  subscribeToDonations, 
  submitRegistration, 
  submitDonation,
  pushSettingsToCloud,
  pushProgramsToCloud,
  pushLeadersToCloud,
  pushEventsToCloud,
  pushPagesToCloud,
  pushGalleryToCloud,
  replaceDatabaseWithCmsKeepMemories,
  updateRegistrationStatusInCloud,
  deleteRegistrationFromCloud,
  updateDonationStatusInCloud,
  deleteDonationFromCloud,
  assignCardIdInCloud,
  registerVerifiedCard,
  PublicVerifiedCard,
  formatIssueDate,
  submitContactMessageInCloud,
  subscribeToContactMessages,
  deleteContactMessageFromCloud,
  updateContactMessageStatusInCloud
} from '../services/firebase';
import { isAuthorizedAdminEmail } from '../utils/security';
import { prewarmSiteTranslations } from '../data/translations';

interface DataContextType {
  settings: SiteSettings;
  programs: Program[];
  leaders: Leader[];
  events: EventItem[];
  pages: PageItem[];
  gallery: GalleryItem[];
  registrations: Registration[];
  donations: Donation[];
  messages: ContactMessage[];
  isCloudConnected: boolean;
  
  // Public Actions
  registerMember: (data: Omit<Registration, '_id' | 'submittedAt'>) => Promise<string>;
  recordDonation: (data: Omit<Donation, '_id' | 'submittedAt'>) => Promise<string>;
  sendContactMessage: (data: Omit<ContactMessage, 'id' | 'createdAt'>) => Promise<void>;

  // Admin Actions
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  savePrograms: (items: Program[]) => Promise<void>;
  saveLeaders: (items: Leader[]) => Promise<void>;
  saveEvents: (items: EventItem[]) => Promise<void>;
  savePages: (items: PageItem[]) => Promise<void>;
  saveGallery: (items: GalleryItem[]) => Promise<void>;
  replaceDatabaseWithCms: (
    newSettings: SiteSettings,
    newPrograms: Program[],
    newLeaders: Leader[],
    newEvents: EventItem[],
    newPages: PageItem[]
  ) => Promise<void>;
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  updateDonationStatus: (id: string, status: string) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  getOrCreateMemberCardId: (registration: Registration) => Promise<{ cardId: string; approvedAt: string }>;
  deleteContactMessage: (id: string) => Promise<void>;
  updateContactMessageStatus: (id: string, status: 'unread' | 'read' | 'replied') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Rely strictly on live Firestore database; initial state is empty until Firestore snapshot resolves
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Proactively purge any leftover cache keys on mount so app is guaranteed 100% fresh and relies only on Firestore
  useEffect(() => {
    try {
      const keysToPurge = [
        'site_settings',
        'site_programs',
        'site_leaders',
        'site_events',
        'site_pages',
        'site_gallery',
        'site_messages',
        'local_registrations',
        'local_donations',
        'local_messages',
        'arain_bannu_cache'
      ];
      keysToPurge.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      if (typeof window !== 'undefined' && 'caches' in window && typeof window.caches?.keys === 'function') {
        try {
          window.caches.keys().then(names => {
            names.forEach(name => {
              try { window.caches.delete(name); } catch {}
            });
          }).catch(() => {});
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Subscribe to Public Cloud Site Configuration (available to all visitors)
  useEffect(() => {
    const unsubConfig = subscribeToSiteConfig(
      (patch) => {
        setSettings(prev => ({ ...prev, ...patch }));
      },
      (progItems) => {
        if (Array.isArray(progItems)) {
          setPrograms(progItems);
        }
      },
      (leaderItems) => {
        if (Array.isArray(leaderItems)) {
          setLeaders(leaderItems);
        }
      },
      (eventItems) => {
        if (Array.isArray(eventItems)) {
          setEvents(eventItems);
        }
      },
      (pageItems) => {
        if (Array.isArray(pageItems)) {
          setPages(pageItems);
        }
      },
      (galleryItems) => {
        if (Array.isArray(galleryItems)) {
          setGallery(galleryItems);
        }
      }
    );

    return () => {
      unsubConfig();
    };
  }, []);

  // Proactively translate all dynamic site content via Azure the moment it
  // loads/changes - this is what makes Azure the PRIMARY translator in
  // practice, since by the time a visitor toggles language the real
  // translation is (in the common case) already cached; the hand-curated
  // dictionary is only ever a fallback for the brief window before this
  // resolves, or if Azure is unavailable. Safe to re-run on every update -
  // already-cached strings are skipped instantly.
  useEffect(() => {
    if (programs.length || leaders.length || events.length || pages.length || gallery.length) {
      prewarmSiteTranslations({ programs, leaders, events, pages, gallery });
    }
  }, [programs, leaders, events, pages, gallery]);

  // Subscribe to Protected Admin Collections (registrations, donations, messages)
  // strictly when an authorized administrator is authenticated.
  useEffect(() => {
    let unsubRegs: (() => void) | null = null;
    let unsubDons: (() => void) | null = null;
    let unsubMsgs: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up existing listeners if any
      if (unsubRegs) { unsubRegs(); unsubRegs = null; }
      if (unsubDons) { unsubDons(); unsubDons = null; }
      if (unsubMsgs) { unsubMsgs(); unsubMsgs = null; }

      if (user && isAuthorizedAdminEmail(user.email)) {
        unsubRegs = subscribeToRegistrations((items) => {
          setRegistrations(items);
          setIsCloudConnected(true);
        });

        unsubDons = subscribeToDonations((items) => {
          setDonations(items);
          setIsCloudConnected(true);
        });

        unsubMsgs = subscribeToContactMessages((items) => {
          if (Array.isArray(items)) {
            setMessages(items);
          }
        });
      } else {
        setIsCloudConnected(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubRegs) unsubRegs();
      if (unsubDons) unsubDons();
      if (unsubMsgs) unsubMsgs();
    };
  }, []);

  // Public submission wrappers
  const registerMember = async (data: Omit<Registration, '_id' | 'submittedAt'>) => {
    const id = await submitRegistration(data);
    return id;
  };

  const recordDonation = async (data: Omit<Donation, '_id' | 'submittedAt'>) => {
    const id = await submitDonation(data);
    return id;
  };

  const sendContactMessage = async (data: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    try {
      const cloudId = await submitContactMessageInCloud(data);
      const newMsg: ContactMessage = {
        ...data,
        id: cloudId,
        status: 'unread',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [newMsg, ...prev.filter(m => m.id !== cloudId)]);
    } catch (err) {
      console.warn('[DataContext] Error submitting message to cloud, using local fallback:', err);
      const fallbackMsg: ContactMessage = {
        ...data,
        id: String(Date.now()),
        status: 'unread',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [fallbackMsg, ...prev]);
    }
  };

  const deleteContactMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    await deleteContactMessageFromCloud(id);
  };

  const updateContactMessageStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    await updateContactMessageStatusInCloud(id, status);
  };

  // Admin CMS & Data Operations
  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await pushSettingsToCloud(updated);
  };

  const savePrograms = async (items: Program[]) => {
    setPrograms(items);
    await pushProgramsToCloud(items);
  };

  const saveLeaders = async (items: Leader[]) => {
    setLeaders(items);
    await pushLeadersToCloud(items);
  };

  const saveEvents = async (items: EventItem[]) => {
    setEvents(items);
    await pushEventsToCloud(items);
  };

  const savePages = async (items: PageItem[]) => {
    setPages(items);
    await pushPagesToCloud(items);
  };

  const saveGallery = async (items: GalleryItem[]) => {
    setGallery(items);
    await pushGalleryToCloud(items);
  };

  const replaceDatabaseWithCms = async (
    newSettings: SiteSettings,
    newPrograms: Program[],
    newLeaders: Leader[],
    newEvents: EventItem[],
    newPages: PageItem[]
  ) => {
    setSettings(newSettings);
    setPrograms(newPrograms);
    setLeaders(newLeaders);
    setEvents(newEvents);
    setPages(newPages);
    await replaceDatabaseWithCmsKeepMemories(
      newSettings,
      newPrograms,
      newLeaders,
      newEvents,
      newPages
    );
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    // Stamp approvedAt exactly once - the first time a registration becomes
    // 'approved' - and never again. This is what makes "issue date" a real,
    // stable fact instead of whatever today happens to be.
    const existing = registrations.find(r => r._id === id);
    const approvedAtToSet = (status === 'approved' && !existing?.approvedAt)
      ? new Date().toISOString()
      : undefined;

    setRegistrations(prev => prev.map(r => r._id === id
      ? { ...r, status, ...(approvedAtToSet ? { approvedAt: approvedAtToSet } : {}) }
      : r
    ));
    await updateRegistrationStatusInCloud(id, status, approvedAtToSet);
  };

  const deleteRegistration = async (id: string) => {
    setRegistrations(prev => prev.filter(r => r._id !== id));
    await deleteRegistrationFromCloud(id);
  };

  const updateDonationStatus = async (id: string, status: string) => {
    setDonations(prev => prev.map(d => d._id === id ? { ...d, status } : d));
    await updateDonationStatusInCloud(id, status);
  };

  const deleteDonation = async (id: string) => {
    setDonations(prev => prev.filter(d => d._id !== id));
    await deleteDonationFromCloud(id);
  };

  const getOrCreateMemberCardId = async (reg: Registration): Promise<{ cardId: string; approvedAt: string }> => {
    // If this member already has a card, its issue date was already fixed
    // the first time it was created - just return it as-is. Re-registering
    // it here on every subsequent view/open was the bug: it silently reset
    // the card's real issue date to "today" (and, when scanning, to
    // whatever moment the card happened to be scanned or searched at)
    // every single time.
    if (reg.cardId) {
      return { cardId: reg.cardId, approvedAt: reg.approvedAt || new Date().toISOString() };
    }

    // First time this member is getting a card. Generating a card IS the
    // approval action if the registration wasn't already explicitly marked
    // approved - so this timestamp doubles as "when the admin approved the
    // person" per the requirement, and is set exactly once, right now.
    const approvedAt = reg.approvedAt || new Date().toISOString();

    let cardId: string;
    if (reg._id) {
      cardId = await assignCardIdInCloud(reg._id, settings.siteName, { ...reg, approvedAt });
    } else {
      const prefix = settings.siteName
        ? settings.siteName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'AB'
        : 'AB';
      const yy = String(new Date().getFullYear() % 100).padStart(2, '0');
      const randomSerial = String(Math.floor(100000 + Math.random() * 900000));
      cardId = `${prefix}-${yy}-${randomSerial}`;

      const verifiedEntry: PublicVerifiedCard = {
        cardId,
        fullNameEn: reg.fullNameEn || reg.fullName || '',
        fullNameUr: reg.fullNameUr || reg.fullName || '',
        membershipTypeEn: reg.membershipTypeEn || reg.membershipType || 'Official Member',
        membershipTypeUr: reg.membershipTypeUr || reg.membershipType || 'باضابطہ رکن',
        status: 'verified',
        issuedAt: formatIssueDate(approvedAt),
        approvedAt,
        councilName: settings.siteName || 'ARAAIN ASSOCIATION BANNU',
      };
      await registerVerifiedCard(verifiedEntry);
    }

    setRegistrations(prev => prev.map(r =>
      (r._id === reg._id || (r.cnic && r.cnic === reg.cnic))
        ? { ...r, cardId, approvedAt, status: 'approved' }
        : r
    ));

    return { cardId, approvedAt };
  };

  return (
    <DataContext.Provider value={{
      settings,
      programs,
      leaders,
      events,
      pages,
      gallery,
      registrations,
      donations,
      messages,
      isCloudConnected,
      registerMember,
      recordDonation,
      sendContactMessage,
      saveSettings,
      savePrograms,
      saveLeaders,
      saveEvents,
      savePages,
      saveGallery,
      replaceDatabaseWithCms,
      updateRegistrationStatus,
      deleteRegistration,
      updateDonationStatus,
      deleteDonation,
      getOrCreateMemberCardId,
      deleteContactMessage,
      updateContactMessageStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
