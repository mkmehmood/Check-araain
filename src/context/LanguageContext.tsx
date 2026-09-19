import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, SiteSettings, Program, Leader, EventItem, PageItem, GalleryItem, ContactDetail } from '../types';
import { 
  EN, 
  UR, 
  getLocalizedSetting, 
  getLocalizedPrograms, 
  getLocalizedLeaders, 
  getLocalizedEvents, 
  getLocalizedPages,
  getLocalizedGallery,
  getLocalizedContacts,
  subscribeToTranslationUpdates
} from '../data/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  setLanguage: (l: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
  isUrdu: boolean;
  tSetting: (field: keyof SiteSettings, customSettings?: SiteSettings) => string;
  getPrograms: (customPrograms: Program[]) => Program[];
  getLeaders: (customLeaders: Leader[]) => Leader[];
  getEvents: (customEvents: EventItem[]) => EventItem[];
  getPages: (customPages: PageItem[]) => PageItem[];
  getGallery: (customGallery: GalleryItem[]) => GalleryItem[];
  getContacts: (customContacts?: ContactDetail[]) => ContactDetail[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always load fresh in Urdu by default; no cache persistence
  const [lang, setLangState] = useState<Language>('ur');

  // Bumped whenever a background Azure translation resolves for text that
  // was first shown as a naive word-by-word guess (see translations.ts),
  // so every component reading tSetting()/t() re-renders with the corrected text.
  const [, forceTranslationRefresh] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeToTranslationUpdates(() => {
      forceTranslationRefresh((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Purge any stale cached language on startup
  useEffect(() => {
    try {
      localStorage.removeItem('app_language');
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ur' : 'en');
  };

  useEffect(() => {
    const isUr = lang === 'ur';
    document.documentElement.lang = lang;
    document.documentElement.dir = isUr ? 'rtl' : 'ltr';
    if (isUr) {
      document.body.classList.add('font-urdu');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-urdu');
    }
  }, [lang]);

  const t = useCallback((key: string, fallback?: string): string => {
    const dict = lang === 'ur' ? UR : EN;
    if (dict[key]) return dict[key];
    const fallbackDict = lang === 'ur' ? UR : EN;
    if (fallbackDict[key]) return fallbackDict[key];
    return fallback || key;
  }, [lang]);

  const tSetting = useCallback((field: keyof SiteSettings, customSettings?: SiteSettings): string => {
    return getLocalizedSetting(field, lang, customSettings);
  }, [lang]);

  const getPrograms = useCallback((customPrograms: Program[]): Program[] => {
    return getLocalizedPrograms(lang, customPrograms);
  }, [lang]);

  const getLeaders = useCallback((customLeaders: Leader[]): Leader[] => {
    return getLocalizedLeaders(lang, customLeaders);
  }, [lang]);

  const getEvents = useCallback((customEvents: EventItem[]): EventItem[] => {
    return getLocalizedEvents(lang, customEvents);
  }, [lang]);

  const getPages = useCallback((customPages: PageItem[]): PageItem[] => {
    return getLocalizedPages(lang, customPages);
  }, [lang]);

  const getGallery = useCallback((customGallery: GalleryItem[]): GalleryItem[] => {
    return getLocalizedGallery(lang, customGallery);
  }, [lang]);

  const getContacts = useCallback((customContacts?: ContactDetail[]): ContactDetail[] => {
    return getLocalizedContacts(lang, customContacts);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      setLang, 
      setLanguage: setLang,
      toggleLang, 
      t, 
      isUrdu: lang === 'ur',
      tSetting,
      getPrograms,
      getLeaders,
      getEvents,
      getPages,
      getGallery,
      getContacts
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
